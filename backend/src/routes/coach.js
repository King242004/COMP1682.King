const express = require("express");
const router = express.Router();
const { getInsight, chat, getHistory, clearHistory, logFromMessage, unlogFromMessage, suggestMeal } = require("../controllers/coachController");
const protect = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /coach/insight:
 *   get:
 *     summary: Get today's AI health analysis + Health Score
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-06-18" }
 *     responses:
 *       200: { description: Returns score, summary, tips, warnings }
 */
router.get("/insight", getInsight);

/**
 * @swagger
 * /coach/chat:
 *   post:
 *     summary: Chat with the AI coach (context-aware)
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "Can I eat pho for dinner?" }
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, coach] }
 *                     text: { type: string }
 *     responses:
 *       200: { description: Returns the coach reply }
 *       400: { description: Message required }
 */
router.post("/chat", chat);

/**
 * @swagger
 * /coach/history:
 *   get:
 *     summary: Get the user's coach chat history
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Returns chat messages }
 *   delete:
 *     summary: Clear the user's coach chat history
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: History cleared }
 */
/**
 * @swagger
 * /coach/suggest-meal:
 *   post:
 *     summary: AI suggests 3 dishes for the next meal (remaining kcal + conditions aware)
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: Returns mealType, remaining kcal and 3 suggestions }
 *       429: { description: AI quota exhausted }
 */
router.post("/suggest-meal", suggestMeal);

router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.post("/log", logFromMessage);
router.post("/unlog", unlogFromMessage);

module.exports = router;
