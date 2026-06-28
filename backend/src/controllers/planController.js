const PlanMeal = require("../models/PlanMeal");
const Meal = require("../models/Meal");

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// ─── Add Plan Meal ──────────────────────────────────────────────────────────
exports.addPlanMeal = async (req, res) => {
  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (!name || !mealType || calories === undefined || !date)
    return res.status(400).json({ message: "Name, mealType, calories and date are required." });

  if (!MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  const planMeal = await PlanMeal.create({
    user: req.user.id,
    name: name.trim(),
    mealType,
    calories,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    note: note || "",
    date,
  });

  res.status(201).json({ message: "Planned meal added.", planMeal });
};

// ─── Get Plan Meals by date range ───────────────────────────────────────────
// Returns flat list for the range; frontend groups by date/mealType.
exports.getPlanMeals = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const planMeals = await PlanMeal.find(filter).sort({ date: 1, createdAt: 1 });
  res.json({ planMeals });
};

// ─── Update Plan Meal ───────────────────────────────────────────────────────
exports.updatePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this planned meal." });

  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (mealType !== undefined && !MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories !== undefined && calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (name !== undefined) planMeal.name = name.trim();
  if (mealType !== undefined) planMeal.mealType = mealType;
  if (calories !== undefined) planMeal.calories = calories;
  if (protein !== undefined) planMeal.protein = protein || 0;
  if (carbs !== undefined) planMeal.carbs = carbs || 0;
  if (fat !== undefined) planMeal.fat = fat || 0;
  if (note !== undefined) planMeal.note = note;
  if (date !== undefined) planMeal.date = date;

  await planMeal.save();
  res.json({ message: "Planned meal updated.", planMeal });
};

// ─── Delete Plan Meal ───────────────────────────────────────────────────────
exports.deletePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this planned meal." });

  await planMeal.deleteOne();
  res.json({ message: "Planned meal deleted." });
};

// ─── Mark as eaten ──────────────────────────────────────────────────────────
// Flips `done` and copies the planned meal into the real diary as a Meal.
// Idempotent: if already done, we don't create a duplicate Meal log.
exports.markEaten = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  if (planMeal.done)
    return res.status(400).json({ message: "This meal is already marked as eaten." });

  const meal = await Meal.create({
    user: req.user.id,
    name: planMeal.name,
    mealType: planMeal.mealType,
    calories: planMeal.calories,
    protein: planMeal.protein,
    carbs: planMeal.carbs,
    fat: planMeal.fat,
    note: planMeal.note,
    date: planMeal.date,
  });

  planMeal.done = true;
  await planMeal.save();

  res.json({ message: "Marked as eaten and logged to diary.", planMeal, meal });
};
