const express = require("express");
const router = express.Router();
const { register, sendRegistrationOTP, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/auth");
const { registrationOtpLimiter } = require("../middleware/rateLimiters");

/**
 * @swagger
 * /auth/register/send-otp:
 *   post:
 *     summary: Send an email ownership code before registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Verification code sent
 *       400:
 *         description: Invalid email format
 *       429:
 *         description: Request limit or resend cooldown reached
 */
router.post("/register/send-otp", registrationOtpLimiter, sendRegistrationOTP);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, otp]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               goal:
 *                 type: string
 *                 enum: [lose_weight, gain_muscle, eat_healthy]
 *               calorieGoal:
 *                 type: number
 *                 example: 2000
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user info
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

module.exports = router;
