// File này lo toàn bộ vòng đời một món trong nhật ký: thêm, xem, sửa, xóa.
// Mọi câu lệnh đều kèm mã người dùng nên không ai đọc hay sửa được món của người khác.
const Meal = require("../models/Meal");
const { requestTodayKey } = require("../utils/dateUtils");
const { validateMealInput, validateMealName, validateNutritionValues } = require("../validators/mealInputValidator");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");

const NUTRITION_SOURCES = ["manual", "ai_estimate", "ai_adjusted", "photo_scan", "barcode", "community", "repeat", "ai_suggestion"];

exports.addMeal = async (req, res) => {
  const normalized = validateMealInput(req.body, req.user.id, requestTodayKey(req));
  if (normalized.error) return res.status(400).json({ message: normalized.error });

  const meal = await Meal.create(normalized.value);

  res.status(201).json({ message: "Meal added successfully.", meal });
};

exports.addMeals = async (req, res) => {
  if (!Array.isArray(req.body.meals) || req.body.meals.length < 1 || req.body.meals.length > 8)
    return res.status(400).json({ message: "Enter between 1 and 8 meals." });

  const currentDate = requestTodayKey(req);
  const normalized = req.body.meals.map((meal) => validateMealInput(meal, req.user.id, currentDate));
  const invalid = normalized.find((meal) => meal.error);
  if (invalid) return res.status(400).json({ message: invalid.error });

  const meals = await Meal.insertMany(normalized.map((meal) => meal.value));
  res.status(201).json({ message: "Meals added successfully.", meals });
};

// Tổng được cộng ở server để mọi màn hình đều thấy cùng một con số.
exports.getMealsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Please provide a valid date in format YYYY-MM-DD." });

  const meals = await Meal.find({ user: req.user.id, date }).sort({ createdAt: 1 });

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

exports.getMealHistory = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const meals = await Meal.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ meals });
};

exports.updateMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this meal." });

  const {
    name, mealType, calories, protein, carbs, fat, portionAmount, portionUnit, portionText,
    nutritionSource, image, note, date,
  } = req.body;

  if (mealType !== undefined && !["breakfast", "lunch", "dinner", "snack"].includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  const nutrition = validateNutritionValues({
    calories: calories ?? meal.calories,
    protein: protein ?? meal.protein,
    carbs: carbs ?? meal.carbs,
    fat: fat ?? meal.fat,
  });
  if (nutrition.error) return res.status(400).json({ message: nutrition.error });
  const normalizedName = name === undefined ? null : validateMealName(name);
  if (normalizedName?.error) return res.status(400).json({ message: normalizedName.error });

  if (portionAmount !== undefined && (!Number.isFinite(portionAmount) || portionAmount <= 0))
    return res.status(400).json({ message: "Portion amount must be a positive number." });

  if (portionUnit !== undefined && (!String(portionUnit).trim() || String(portionUnit).trim().length > INPUT_LIMITS.PORTION_UNIT))
    return res.status(400).json({ message: `Portion unit must be between 1 and ${INPUT_LIMITS.PORTION_UNIT} characters.` });

  if (portionText !== undefined && String(portionText).trim().length > LEGACY_LIMITS.PORTION_TEXT)
    return res.status(400).json({ message: `Consumed portion must not exceed ${LEGACY_LIMITS.PORTION_TEXT} characters.` });

  if (nutritionSource !== undefined && !NUTRITION_SOURCES.includes(nutritionSource))
    return res.status(400).json({ message: "Invalid nutrition source." });

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (date !== undefined && date > requestTodayKey(req))
    return res.status(400).json({ message: "Cannot move a meal to a future date." });

  // Chỉ đụng tới trường nào được gửi lên. Trường không gửi thì giữ nguyên giá trị cũ.
  if (normalizedName) meal.name = normalizedName.value;
  if (mealType !== undefined) meal.mealType = mealType;
  if (calories !== undefined) meal.calories = nutrition.value.calories;
  if (protein !== undefined) meal.protein = nutrition.value.protein;
  if (carbs !== undefined) meal.carbs = nutrition.value.carbs;
  if (fat !== undefined) meal.fat = nutrition.value.fat;
  if (portionAmount !== undefined) meal.portionAmount = portionAmount;
  if (portionUnit !== undefined) meal.portionUnit = String(portionUnit).trim();
  if (portionText !== undefined) meal.portionText = String(portionText).trim();
  if (nutritionSource !== undefined) meal.nutritionSource = nutritionSource;
  if (image !== undefined) meal.image = image;
  if (note !== undefined) meal.note = note;
  if (date !== undefined) meal.date = date;

  await meal.save();
  res.json({ message: "Meal updated successfully.", meal });
};

exports.deleteMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this meal." });

  await meal.deleteOne();
  res.json({ message: "Meal deleted successfully." });
};
