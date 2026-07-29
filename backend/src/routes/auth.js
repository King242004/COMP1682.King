const express = require("express");
const { register, sendRegistrationOTP, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/auth");
const { registrationOtpLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
router.post("/register/send-otp", registrationOtpLimiter, sendRegistrationOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
