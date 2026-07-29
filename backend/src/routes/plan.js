const express = require("express");
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
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(protect);
router.post("/", addPlanMeal);
router.get("/", getPlanMeals);
router.put("/:id", updatePlanMeal);
router.delete("/:id", deletePlanMeal);
router.post("/:id/eaten", markEaten);
router.post("/workout/:id/done", markWorkoutDone);

router.post("/generate", aiLimiter, generatePlan);
router.post("/grocery", aiLimiter, groceryList);

module.exports = router;
