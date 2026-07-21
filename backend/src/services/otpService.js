const OTP = require("../models/OTP");
const {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} = require("../utils/otpSecurity");

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
    // A unique-index conflict means another request reserved this email and
    // purpose first. Treat it as cooldown instead of leaking a server error.
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

  // No match means the record was replaced or consumed by another request;
  // never delete that newer code.
  if (!updated) return { burned: false };

  if (updated.attempts >= OTP_MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: recordId, codeHash: expectedCodeHash });
    return { burned: true };
  }

  return { burned: false };
}

module.exports = { recordFailedOTPAttempt, reserveOTP };
