const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { logWeight, getWeights, deleteWeight } = require("../controllers/weightController");

router.use(protect);

/**
 * @swagger
 * tags: [{ name: Weight }]
 */

/**
 * @swagger
 * /weight:
 *   post:
 *     summary: Log body weight (same-day log replaces the value; syncs profile weight)
 *     tags: [Weight]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weightKg: { type: number }
 *               date: { type: string, example: "2026-07-10" }
 *     responses:
 *       201: { description: Logged }
 *   get:
 *     summary: Weight history (oldest→newest) + current/target weight
 *     tags: [Weight]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: limit, schema: { type: integer, default: 90 } }]
 *     responses:
 *       200: { description: History }
 */
router.post("/", logWeight);
router.get("/", getWeights);

/**
 * @swagger
 * /weight/{id}:
 *   delete:
 *     summary: Delete a weight entry
 *     tags: [Weight]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Deleted }
 */
router.delete("/:id", deleteWeight);

module.exports = router;
