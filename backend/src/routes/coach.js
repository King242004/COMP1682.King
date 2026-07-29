const express = require("express");
const { getInsight, chat, getHistory, clearHistory, logFromMessage, unlogFromMessage, suggestMeal } = require("../controllers/coachController");
const protect = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(protect);
router.get("/insight", aiLimiter, getInsight);
router.post("/chat", aiLimiter, chat);
router.post("/suggest-meal", aiLimiter, suggestMeal);

router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.post("/log", logFromMessage);
router.post("/unlog", unlogFromMessage);

module.exports = router;
