const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const protect = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile with BMI and TDEE
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile and stats (BMI, TDEE)
 *       404:
 *         description: User not found
 */
router.get("/", getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
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
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               age:
 *                 type: number
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               goal:
 *                 type: string
 *                 enum: [lose_weight, gain_muscle, eat_healthy]
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, moderate, active]
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *               calorieGoal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/", updateProfile);

module.exports = router;
