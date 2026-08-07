// ═══ FILE NÀY LÀM GÌ ═══
// Lo toàn bộ vòng đời một món trong nhật ký: thêm, xem, sửa, xóa.
//
// Ai gọi tới: mealRoutes, tức màn Thêm món, Sửa món, Chi tiết món, Lịch sử món
// Nhận vào:   tên món, buổi ăn, calo và ba chất, ngày, kèm nguồn số liệu
// Trả ra:     món đã lưu, hoặc danh sách món theo ngày
// Khi lỗi:    thiếu trường bắt buộc hoặc số âm thì validator chặn và báo rõ
//             trường nào sai. Sửa món của người khác thì bị từ chối.
//
// Mọi câu lệnh đọc và ghi đều kèm mã người dùng, nên không ai chạm được
// vào món của người khác dù có đoán đúng mã món.
const Meal = require("../models/Meal");
const { requestTodayKey } = require("../utils/dateUtils");
const { validateMealInput, validateMealName, validateNutritionValues } = require("../validators/mealInputValidator");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");
const { MEAL_TYPES, NUTRITION_SOURCES } = require("../config/mealEnums");

// Đọc lại cả ngày rồi cộng tổng. Dùng chung cho ba chỗ: xem một ngày,
// thêm một món, và thêm nhiều món.
// Vì sao gom vào đây: trước kia app phải gọi thêm một lượt GET chỉ để lấy tổng
// sau mỗi lần thêm món. Giờ lệnh thêm trả luôn cả ngày nên chỉ còn một lượt.
async function readDay(userId, date) {
  const meals = await Meal.find({ user: userId, date }).sort({ createdAt: 1 });
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
  return { date, meals, totals };
}

// LUỒNG LƯU MÓN. AddMealScreen → MealsContext.addMeals → POST /meals/batch
// → route POST /meals/batch trong mealRoutes.js → hàm addMeals bên dưới.
// Đến từ mealRoutes, đã qua authenticateUser nên req.user chắc chắn có.
// Bốn bước bên dưới, đọc từ trên xuống là đúng thứ tự.
exports.addMeal = async (req, res) => {
  // LƯU MÓN BƯỚC 1. Kiểm dữ liệu, xem mealInputValidator.
  // Sai là dừng ngay ở đây, chưa đụng tới database.
  const normalized = validateMealInput(req.body, req.user.id, requestTodayKey(req));
  if (normalized.error) return res.status(400).json({ message: normalized.error });

  // LƯU MÓN BƯỚC 2. Ghi xuống MongoDB. Model Meal kiểm lần nữa trước khi ghi.
  const meal = await Meal.create(normalized.value);

  // LƯU MÓN BƯỚC 3. Đọc lại cả ngày rồi cộng tổng.
  const day = await readDay(req.user.id, meal.date);

  // LƯU MÓN BƯỚC 4. Trả về. Trường day là thứ giúp app khỏi gọi lượt thứ hai.
  res.status(201).json({ message: "Meal added successfully.", meal, day });
};

// LUỒNG LƯU MÓN, bản nhiều món. Đây là đường mà nút Lưu ở AddMealScreen
// thật sự đi vào, vì một lần lưu ghi được tối đa 8 món.
// Cả 8 món luôn cùng một ngày nên chỉ cần đọc lại ngày đó.
exports.addMeals = async (req, res) => {
  if (!Array.isArray(req.body.meals) || req.body.meals.length < 1 || req.body.meals.length > 8)
    return res.status(400).json({ message: "Enter between 1 and 8 meals." });

  // LƯU MÓN BƯỚC 1. Kiểm TỪNG món. Chỉ cần một món sai là bỏ cả lô,
  // để không rơi vào cảnh ghi được 5 món rồi hỏng ở món thứ 6.
  const currentDate = requestTodayKey(req);
  const normalized = req.body.meals.map((meal) => validateMealInput(meal, req.user.id, currentDate));
  const invalid = normalized.find((meal) => meal.error);
  if (invalid) return res.status(400).json({ message: invalid.error });

  // LƯU MÓN BƯỚC 2. Ghi cả lô trong một lệnh.
  const meals = await Meal.insertMany(normalized.map((meal) => meal.value));

  // LƯU MÓN BƯỚC 3. Đọc lại cả ngày rồi cộng tổng.
  const day = await readDay(req.user.id, meals[0].date);

  // LƯU MÓN BƯỚC 4. Trả về, kèm trường day.
  res.status(201).json({ message: "Meals added successfully.", meals, day });
};

// Tổng được cộng ở server để mọi màn hình đều thấy cùng một con số.
exports.getMealsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Please provide a valid date in format YYYY-MM-DD." });

  res.json(await readDay(req.user.id, date));
};

// Lấy lịch sử món, không giới hạn ngày nếu không truyền khoảng.
// Màn Tiến trình và màn Lịch sử món dùng đường này.
exports.getMealHistory = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const meals = await Meal.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ meals });
};

// Sửa một món. Chỉ đổi trường nào người dùng thật sự gửi lên.
// Kiểm chủ sở hữu trước mọi thứ, để người này không sửa được món người kia.
exports.updateMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this meal." });

  const {
    name, mealType, calories, protein, carbs, fat, portionAmount, portionUnit, portionText,
    nutritionSource, image, note, date,
  } = req.body;

  if (mealType !== undefined && !MEAL_TYPES.includes(mealType))
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

// Xóa một món. Cũng kiểm chủ sở hữu trước khi xóa.
exports.deleteMeal = async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) return res.status(404).json({ message: "Meal not found." });

  if (meal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this meal." });

  await meal.deleteOne();
  res.json({ message: "Meal deleted successfully." });
};
