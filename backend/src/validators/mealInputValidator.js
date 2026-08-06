// Kiểm tra dữ liệu món tại ranh giới API trước khi controller ghi vào MongoDB.
// mealController và planController cùng gọi file này để luồng tạo và sửa món
// luôn dùng chung giới hạn calo, protein, carb và fat.
const { INPUT_LIMITS, LEGACY_LIMITS, DIGIT_LIMITS } = require("../config/inputLimits");

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const NUTRITION_SOURCES = ["manual", "ai_estimate", "ai_adjusted", "photo_scan", "barcode", "community", "repeat", "ai_suggestion"];
const CALORIE_MAX = 10 ** DIGIT_LIMITS.CALORIE - 1;
const MACRO_MAX = 10 ** DIGIT_LIMITS.MACRO - 1;

function validateMealName(input) {
  const value = typeof input === "string" ? input.trim() : "";
  return value.length >= 2 && value.length <= LEGACY_LIMITS.MEAL_NAME
    ? { value }
    : { error: "Enter a valid meal name." };
}

function validateNutritionValues(input = {}) {
  const value = {
    calories: Number(input.calories),
    protein: input.protein === undefined ? 0 : Number(input.protein),
    carbs: input.carbs === undefined ? 0 : Number(input.carbs),
    fat: input.fat === undefined ? 0 : Number(input.fat),
  };
  if (!Number.isFinite(value.calories) || value.calories < 0 || value.calories > CALORIE_MAX)
    return { error: "Enter a valid calorie amount." };
  if ([value.protein, value.carbs, value.fat].some((item) => !Number.isFinite(item) || item < 0 || item > MACRO_MAX))
    return { error: "Enter valid macronutrient values." };
  return { value };
}

function validateMealInput(input, userId, currentDate = new Date().toISOString().slice(0, 10)) {
  const name = validateMealName(input?.name);
  const mealType = String(input?.mealType || "");
  const nutrition = validateNutritionValues(input);
  const portionAmount = input?.portionAmount === undefined ? null : Number(input.portionAmount);
  const portionUnit = String(input?.portionUnit || "").trim();
  const portionText = String(input?.portionText || "").trim();
  const nutritionSource = String(input?.nutritionSource || "manual");
  const date = String(input?.date || "");
  const note = String(input?.note || "").trim();

  if (name.error) return name;
  if (!MEAL_TYPES.includes(mealType)) return { error: "Invalid meal type." };
  if (nutrition.error) return nutrition;
  if (portionAmount !== null && (!Number.isFinite(portionAmount) || portionAmount <= 0))
    return { error: "Enter a valid portion amount." };
  if (portionUnit.length > INPUT_LIMITS.PORTION_UNIT) return { error: "Portion unit is too long." };
  if (portionText.length > LEGACY_LIMITS.PORTION_TEXT) return { error: "Consumed portion is too long." };
  if (!NUTRITION_SOURCES.includes(nutritionSource)) return { error: "Invalid nutrition source." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Date must be in format YYYY-MM-DD." };
  if (date > currentDate) return { error: "Cannot log a meal for a future date." };
  if (note.length > LEGACY_LIMITS.MEAL_DETAILS) return { error: "Meal details are too long." };

  return {
    value: {
      user: userId,
      name: name.value,
      mealType,
      ...nutrition.value,
      portionAmount,
      portionUnit,
      portionText,
      nutritionSource,
      image: input?.image || null,
      note,
      date,
    },
  };
}

module.exports = { validateMealInput, validateMealName, validateNutritionValues };
