const OTP = require("../models/OTP");
const { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, isOTPMatch } = require("../utils/otpSecurity");

// File này lo vòng đời mã xác minh 6 số, dùng chung cho đăng ký và quên mật khẩu.

// Cách chặn spam nằm ngay trong điều kiện tìm kiếm, nên hai request chạy
// song song cũng chỉ một cái thắng.
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

// Xóa mã sau 5 lần sai để người lạ không dò hết một triệu tổ hợp 6 số.
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

// Hàm kiểm mã dùng chung cho cả bốn chỗ: đăng ký, xem mã, và đặt lại mật khẩu.
// Bốn chữ này để controller hiện đúng câu cho người dùng, ví dụ hết hạn thì
// bảo xin mã mới, còn sai quá nhiều lần thì bảo phải xin mã khác.
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

  // Bước xem mã ở màn Quên mật khẩu không xóa, vì bước đặt mật khẩu còn cần mã này.
  if (!consume) return "valid";
  // Tìm và xóa trong MỘT lệnh, để hai request cùng lúc thì chỉ một cái xóa được,
  // cái còn lại nhận rỗng và bị coi là mã sai. Nhờ vậy mã dùng đúng một lần.
  const consumed = await OTP.findOneAndDelete({
    _id: record._id,
    codeHash: record.codeHash,
    expiresAt: { $gt: new Date() },
  });
  return consumed ? "valid" : "invalid";
}

module.exports = { recordFailedOTPAttempt, reserveOTP, verifyOTPCode };
