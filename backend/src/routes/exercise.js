const express = require("express");
const router = express.Router();
const {
  addExercise,
  getExercisesByDate,
  getExerciseHistory,
  deleteExercise,
} = require("../controllers/exerciseController");
const protect = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /exercise:
 *   post:
 *     summary: Log a workout (calories burned computed via MET formula)
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, met, durationMin, date]
 *             properties:
 *               name: { type: string, example: Running }
 *               met: { type: number, example: 8 }
 *               durationMin: { type: number, example: 30 }
 *               date: { type: string, example: "2026-06-18" }
 *     responses:
 *       201: { description: Workout logged }
 *       400: { description: Validation error }
 */
router.post("/", addExercise);

/**
 * @swagger
 * /exercise:
 *   get:
 *     summary: Get workouts for a date (with total burned)
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-06-18" }
 *     responses:
 *       200: { description: Returns workouts and total calories burned }
 */
router.get("/", getExercisesByDate);

/**
 * @swagger
 * /exercise/history:
 *   get:
 *     summary: Get workout history
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, example: "2026-06-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, example: "2026-06-30" }
 *     responses:
 *       200: { description: Returns workout history }
 */
router.get("/history", getExerciseHistory);

/**
 * @swagger
 * /exercise/{id}:
 *   delete:
 *     summary: Delete a workout
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Workout deleted }
 *       404: { description: Not found }
 */
router.delete("/:id", deleteExercise);

module.exports = router;
