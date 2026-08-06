// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một mã xác minh 6 số đang chờ được dùng.
//
// Ai gọi tới: otpService, authController, accountController
// Nhận vào:   email, loại việc, mã đã băm, và hạn dùng
// Trả ra:     một dòng OTP đã kiểm hợp lệ
// Khi lỗi:    xin mã mới khi mã cũ chưa hết thời gian chờ thì bị chặn
//
// Điểm quan trọng khi bảo vệ: database chỉ giữ bản BĂM của mã,
// KHÔNG bao giờ giữ 6 số thật. Ai đọc trộm database cũng không dùng được.
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
