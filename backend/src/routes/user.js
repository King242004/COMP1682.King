const express = require("express");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { passwordOtpLimiter } = require("../middleware/rateLimiters");
const { uploadAvatar, sendPasswordOTP, verifyOTP, resetPassword, changeName, changePassword, deleteAccount } = require("../controllers/userController");
const protect = require("../middleware/auth");

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
