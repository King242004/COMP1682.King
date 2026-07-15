const express = require("express");
const router = express.Router();
const multer = require("multer");
const rateLimit = require("express-rate-limit");

// Password-reset endpoints are unauthenticated → strict per-IP cap
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});
const { uploadAvatar, sendPasswordOTP, verifyOTP, resetPassword, changeName, changePassword, deleteAccount } = require("../controllers/userController");
const protect = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

/**
 * @swagger
 * /user/avatar:
 *   post:
 *     summary: Upload avatar to Cloudinary
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post("/avatar", protect, upload.single("image"), uploadAvatar);

/**
 * @swagger
 * /user/name:
 *   put:
 *     summary: Change user name
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: Name updated successfully
 */
router.put("/name", protect, changeName);

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change password while logged in (requires the current password)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Changed }
 */
router.post("/change-password", protect, changePassword);

/**
 * @swagger
 * /user/account:
 *   delete:
 *     summary: Permanently delete the account and all user data (requires password)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/account", protect, deleteAccount);

/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     summary: Send OTP to email for password reset
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: Email not found
 */
router.post("/send-otp", otpLimiter, sendPasswordOTP);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Verify OTP and reset password
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid or expired OTP
 */
/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: Check an OTP before the password step (counts wrong attempts)
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200: { description: OTP is valid }
 *       400: { description: Invalid, expired or burned OTP }
 */
router.post("/verify-otp", otpLimiter, verifyOTP);

router.post("/reset-password", otpLimiter, resetPassword);

module.exports = router;
