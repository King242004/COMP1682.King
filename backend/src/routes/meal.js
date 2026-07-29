const express = require("express");
const { addMeal, getMealsByDate, getMealHistory, updateMeal, deleteMeal } = require("../controllers/mealController");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/", addMeal);
router.get("/", getMealsByDate);
router.get("/history", getMealHistory);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);

module.exports = router;
