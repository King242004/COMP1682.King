// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/auth/* tới hàm trong controllers/authController.js.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/auth
// Nhận vào:   request từ app điện thoại
// Trả ra:     không tự trả gì, chuyển thẳng cho authController
// Khi lỗi:    địa chỉ /me thiếu thẻ đăng nhập thì bị chặn ngay tại đây,
//             protect trả 401 trước authController.getMe
//
// Bảng chia việc cho nhóm đăng nhập đăng ký, địa chỉ bắt đầu bằng /api/auth.
// POST /register/send-otp  bấm nút Gửi mã ở màn Đăng ký
// POST /register           bấm nút Tạo tài khoản
// POST /login              bấm nút Đăng nhập
// GET  /me                 lấy lại thông tin của mình, phải có thẻ đăng nhập
// Ba địa chỉ đầu không cần thẻ đăng nhập vì lúc đó chưa có tài khoản.
const express = require("express");
const { register, sendRegistrationOTP, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/authenticateUser");
const { registrationOtpLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
router.post("/register/send-otp", registrationOtpLimiter, sendRegistrationOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
