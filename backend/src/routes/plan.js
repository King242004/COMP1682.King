const express = require("express");
const router = express.Router();
const {
  addPlanMeal,
  getPlanMeals,
  updatePlanMeal,
  deletePlanMeal,
  markEaten,
  markWorkoutDone,
  generatePlan,
  groceryList,
} = require("../controllers/planController");
const protect = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /plan:
 *   post:
 *     summary: Add a planned meal
 *     tags: [Plan]
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
 *               name: { type: string, example: Oatmeal }
 *               mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *               calories: { type: number, example: 350 }
 *               protein: { type: number, example: 20 }
 *               carbs: { type: number, example: 40 }
 *               fat: { type: number, example: 8 }
 *               date: { type: string, example: "2026-06-20" }
 *               note: { type: string }
 *     responses:
 *       201: { description: Planned meal added }
 *       400: { description: Validation error }
 */
router.post("/", addPlanMeal);

/**
 * @swagger
 * /plan:
 *   get:
 *     summary: Get planned meals in a date range
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, example: "2026-06-15" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, example: "2026-06-21" }
 *     responses:
 *       200: { description: Returns planned meals }
 */
router.get("/", getPlanMeals);

/**
 * @swagger
 * /plan/{id}:
 *   put:
 *     summary: Update a planned meal
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Planned meal updated }
 *       404: { description: Not found }
 */
router.put("/:id", updatePlanMeal);

/**
 * @swagger
 * /plan/{id}:
 *   delete:
 *     summary: Delete a planned meal
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Planned meal deleted }
 *       404: { description: Not found }
 */
router.delete("/:id", deletePlanMeal);

/**
 * @swagger
 * /plan/{id}/eaten:
 *   post:
 *     summary: Mark a planned meal as eaten (logs it to the diary)
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marked as eaten and logged }
 *       400: { description: Already eaten }
 *       404: { description: Not found }
 */
router.post("/:id/eaten", markEaten);

/**
 * @swagger
 * /plan/generate:
 *   post:
 *     summary: Generate a full week plan with AI (meals + daily workout tips)
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               startDate: { type: string, example: "2026-06-22" }
 *               endDate: { type: string, example: "2026-06-28" }
 *               language: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: Plan generated and saved }
 *       429: { description: Out of AI quota }
 */
/**
 * @swagger
 * /plan/workout/{id}/done:
 *   post:
 *     summary: One-tap confirm the AI-suggested workout (creates a real Exercise)
 *     tags: [Plan]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/workout/:id/done", markWorkoutDone);

router.post("/generate", generatePlan);

/**
 * @swagger
 * /plan/grocery:
 *   post:
 *     summary: Build an AI grocery shopping list from the planned meals in a range
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               startDate: { type: string, example: "2026-06-22" }
 *               endDate: { type: string, example: "2026-06-28" }
 *               language: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: Returns grouped grocery items }
 *       400: { description: No planned meals in range }
 */
router.post("/grocery", groceryList);

module.exports = router;
