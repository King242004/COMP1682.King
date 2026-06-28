const express = require("express");
const router = express.Router();
const {
  addPlanMeal,
  getPlanMeals,
  updatePlanMeal,
  deletePlanMeal,
  markEaten,
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

module.exports = router;
