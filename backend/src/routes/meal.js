const express = require("express");
const router = express.Router();
const { addMeal, getMealsByDate, getMealHistory, deleteMeal } = require("../controllers/mealController");
const protect = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /meals:
 *   post:
 *     summary: Add a new meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, mealType, calories, date]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pho Bo
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               calories:
 *                 type: number
 *                 example: 450
 *               protein:
 *                 type: number
 *                 example: 25
 *               carbs:
 *                 type: number
 *                 example: 55
 *               fat:
 *                 type: number
 *                 example: 10
 *               date:
 *                 type: string
 *                 example: "2026-05-14"
 *               note:
 *                 type: string
 *                 example: Extra beef
 *     responses:
 *       201:
 *         description: Meal added successfully
 *       400:
 *         description: Validation error
 */
router.post("/", addMeal);

/**
 * @swagger
 * /meals:
 *   get:
 *     summary: Get meals by date
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-05-14"
 *     responses:
 *       200:
 *         description: Returns meals and daily totals
 *       400:
 *         description: Invalid date format
 */
router.get("/", getMealsByDate);

/**
 * @swagger
 * /meals/history:
 *   get:
 *     summary: Get meal history
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: "2026-05-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Returns meal history
 */
router.get("/history", getMealHistory);

/**
 * @swagger
 * /meals/{id}:
 *   delete:
 *     summary: Delete a meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       404:
 *         description: Meal not found
 */
router.delete("/:id", deleteMeal);

module.exports = router;
