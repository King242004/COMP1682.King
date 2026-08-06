// Bảng chia việc cho tài khoản, địa chỉ bắt đầu bằng /api/user.
// Ở đây thẻ đăng nhập gắn cho TỪNG địa chỉ, không gắn chung cả file,
// vì ba địa chỉ quên mật khẩu phải chạy được khi chưa đăng nhập.
// Cần thẻ đăng nhập:
// POST   /avatar          đổi ảnh đại diện, gửi kèm file ảnh
// PUT    /name            đổi tên hiển thị
// POST   /change-password đổi mật khẩu khi đang đăng nhập
// DELETE /account         xóa tài khoản và toàn bộ dữ liệu
// Không cần thẻ, dùng cho màn Quên mật khẩu ba bước:
// POST   /send-otp        bước 1 nhập email để nhận mã
// POST   /verify-otp      bước 2 nhập mã để kiểm tra
// POST   /reset-password  bước 3 đặt mật khẩu mới
const express = require("express");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { passwordOtpLimiter } = require("../middleware/rateLimiters");
const { uploadAvatar, sendPasswordOTP, verifyOTP, resetPassword, changeName, changePassword, deleteAccount } = require("../controllers/accountController");
const protect = require("../middleware/authenticateUser");

const router = express.Router();

const upload = createImageUpload({ maxFileBytes: 5 * 1024 * 1024 });
const avatarUploadLimiter = imageUploadLimiter(20);
router.post("/avatar", protect, avatarUploadLimiter, upload.single("image"), uploadAvatar);
router.put("/name", protect, changeName);
router.post("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);
router.post("/send-otp", passwordOtpLimiter, sendPasswordOTP);
router.post("/verify-otp", passwordOtpLimiter, verifyOTP);

router.post("/reset-password", passwordOtpLimiter, resetPassword);

module.exports = router;
