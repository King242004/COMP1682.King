const OTP = require("../models/OTP");
const { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, isOTPMatch } = require("../utils/otpSecurity");

async function reserveOTP({ email, purpose, codeHash, expiresAt }) {
  const cooldownCutoff = new Date(Date.now() - OTP_RESEND_COOLDOWN_MS);

  try {
    return await OTP.findOneAndUpdate(
      {
        email,
        purpose,
        $or: [
          { updatedAt: { $lte: cooldownCutoff } },
          { updatedAt: { $exists: false } },
        ],
      },
      { $set: { codeHash, expiresAt, attempts: 0 } },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
}

async function recordFailedOTPAttempt(recordId, expectedCodeHash) {
  const updated = await OTP.findOneAndUpdate(
    {
      _id: recordId,
      codeHash: expectedCodeHash,
      attempts: { $lt: OTP_MAX_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" }
  ).select("attempts");

  if (!updated) return { burned: false };

  if (updated.attempts >= OTP_MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: recordId, codeHash: expectedCodeHash });
    return { burned: true };
  }

  return { burned: false };
}

async function verifyOTPCode({ email, purpose, candidate, consume = false }) {
  const record = await OTP.findOne({ email, purpose }).select("+codeHash");
  if (!record) return "invalid";

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return "expired";
  }

  if (!isOTPMatch(record.codeHash, email, purpose, candidate)) {
    const { burned } = await recordFailedOTPAttempt(record._id, record.codeHash);
    return burned ? "burned" : "invalid";
  }

  if (!consume) return "valid";
  const consumed = await OTP.findOneAndDelete({
    _id: record._id,
    codeHash: record.codeHash,
    expiresAt: { $gt: new Date() },
  });
  return consumed ? "valid" : "invalid";
}

module.exports = { recordFailedOTPAttempt, reserveOTP, verifyOTPCode };
