const Meal = require("../models/Meal");

// Local YYYY-MM-DD for "today" — string compare works for date keys
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Add Meal ─────────────────────────────────────────────────────────────────
exports.addMeal = async (req, res) => {
  const { name, mealType, calories, protein, carbs, fat, image, note, date } = req.body;

  // Validation
  if (!name || !mealType || calories === undefined || !date)
    return res.status(400).json({ message: "Name, mealType, calories and date are required." });

  if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  // Time rule: the diary records the past — back-logging a forgotten day is
  // fine, a FUTURE meal is not (planning lives in /plan).
  if (date > todayKey())
    return res.status(400).json({ message: "Cannot log a meal for a future date." });

  const meal = await Meal.create({
    user: req.user.id,
    name: name.trim(),
    mealType,
    calories,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    image: image || null,
    note: note || "",
    date,
  });

  res.status(201).json({ message: "Meal added successfully.", meal });
};

// ─── Get Meals by Date ────────────────────────────────────────────────────────
exports.getMealsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Please provide a valid date in format YYYY-MM-DD." });

  const meals = await Meal.find({ user: req.user.id, date }).sort({ createdAt: 1 });

  // Calculate daily totals
  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  res.json({ date, meals, totals });
};

// ─── Get Meal History ─────────────────────────────────────────────────────────
exports.getMealHistory = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const meals = await Meal.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ meals });
};

// ─── Update Meal ──────────────────────────────────────────────────────────────
exports.updateMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this meal." });

  const { name, mealType, calories, protein, carbs, fat, image, note, date } = req.body;

  // Validation - only validate fields that are being updated
  if (mealType !== undefined && !["breakfast", "lunch", "dinner", "snack"].includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories !== undefined && calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (date !== undefined && date > todayKey())
    return res.status(400).json({ message: "Cannot move a meal to a future date." });

  // Apply updates - only fields explicitly provided
  if (name !== undefined) meal.name = name.trim();
  if (mealType !== undefined) meal.mealType = mealType;
  if (calories !== undefined) meal.calories = calories;
  if (protein !== undefined) meal.protein = protein || 0;
  if (carbs !== undefined) meal.carbs = carbs || 0;
  if (fat !== undefined) meal.fat = fat || 0;
  if (image !== undefined) meal.image = image;
  if (note !== undefined) meal.note = note;
  if (date !== undefined) meal.date = date;

  await meal.save();
  res.json({ message: "Meal updated successfully.", meal });
};

// ─── Delete Meal ──────────────────────────────────────────────────────────────
exports.deleteMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this meal." });

  await meal.deleteOne();
  res.json({ message: "Meal deleted successfully." });
};
