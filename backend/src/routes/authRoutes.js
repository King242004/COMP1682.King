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
