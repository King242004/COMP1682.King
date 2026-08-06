const mongoose = require("mongoose");

// Bảng mã xác minh 6 số, dùng cho cả đăng ký lẫn quên mật khẩu.
// Nơi ghi vào: khi bấm gửi mã.
// Nơi xóa đi: khi dùng đúng mã, khi hết hạn, khi sai quá 5 lần, và khi xóa tài khoản.
// codeHash có select false nên mặc định không đọc ra được.
// Database chỉ giữ bản băm, KHÔNG bao giờ giữ mã thật.
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "password_reset"],
    },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  // updatedAt được dùng để tính thời gian chờ trước khi gửi lại mã.
  { timestamps: true }
);

// MongoDB tự xóa dòng khi tới thời điểm expiresAt, không cần code dọn dẹp.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Mỗi email chỉ giữ MỘT mã cho mỗi lý do. Xin mã mới là ghi đè mã cũ.
otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true, partialFilterExpression: { purpose: { $exists: true } } }
);

module.exports = mongoose.model("OTP", otpSchema);
