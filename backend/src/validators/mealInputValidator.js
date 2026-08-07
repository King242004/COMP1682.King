// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm dữ liệu món trước mealController.addMeal/addMeals hoặc planController.markEaten ghi Meal.
//
// Ai gọi tới: mealController (thêm sửa món), planController (món trong kế hoạch)
// Nhận vào:   tên món, buổi ăn, calo và ba chất, ngày, nguồn số liệu
// Trả ra:     dữ liệu đã sạch và đã ép về đúng kiểu, hoặc một câu báo lỗi
// Khi lỗi:    trả error để mealController.addMeal/addMeals hoặc planController.markEaten trả 400
//
// Vì sao tách riêng: mealController.js và planController.js cùng gọi vào đây,
// nên luồng thêm món và luồng kế hoạch luôn dùng chung một bộ giới hạn.
// Nếu mỗi bên tự kiểm thì rất dễ lệch nhau.
// mealController và planController cùng gọi file này để luồng tạo và sửa món
// luôn dùng chung giới hạn calo, protein, carb và fat.
const { INPUT_LIMITS, LEGACY_LIMITS, DIGIT_LIMITS } = require("../config/inputLimits");
const { MEAL_TYPES, NUTRITION_SOURCES } = require("../config/mealEnums");

const CALORIE_MAX = 10 ** DIGIT_LIMITS.CALORIE - 1;
const MACRO_MAX = 10 ** DIGIT_LIMITS.MACRO - 1;

function validateMealName(input) {
  const value = typeof input === "string" ? input.trim() : "";
  return value.length >= 2 && value.length <= LEGACY_LIMITS.MEAL_NAME
    ? { value }
    : { error: "Enter a valid meal name." };
}

function validateNutritionValues(input) {
  // Giá trị mặc định của tham số CHỈ chạy khi truyền undefined, không chạy khi
  // truyền null. Mà `req.body` bằng null là chuyện có thật: gửi đúng chữ null
  // kèm Content-Type json là Express đặt body thành null. Bản cũ đọc thẳng
  // `input.calories` nên ném TypeError, thành lỗi 500 thay vì lời từ chối 400.
  const source = input && typeof input === "object" ? input : {};
  const value = {
    // Dùng == null để bắt CẢ null lẫn undefined. Calo là trường bắt buộc nên
    // thiếu thì phải thành NaN rồi bị chặn ở dưới, chứ Number(null) ra 0 sẽ
    // lặng lẽ ghi một bữa ăn 0 kcal vào nhật ký.
    calories: source.calories == null ? NaN : Number(source.calories),
    protein: source.protein == null ? 0 : Number(source.protein),
    carbs: source.carbs == null ? 0 : Number(source.carbs),
    fat: source.fat == null ? 0 : Number(source.fat),
  };
  if (!Number.isFinite(value.calories) || value.calories < 0 || value.calories > CALORIE_MAX)
    return { error: "Enter a valid calorie amount." };
  if ([value.protein, value.carbs, value.fat].some((item) => !Number.isFinite(item) || item < 0 || item > MACRO_MAX))
    return { error: "Enter valid macronutrient values." };
  return { value };
}

// Cửa vào của file này, thuộc LUỒNG LƯU MÓN.
// Đến từ mealController.addMeal hoặc addMeals.
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
