// ═══ FILE NÀY LÀM GÌ ═══
// Lo toàn bộ kế hoạch tuần: món dự định ăn, nhờ AI dựng thực đơn,
// gợi ý bài tập tại nhà, danh sách đi chợ, và hai nút biến kế hoạch
// thành dữ liệu thật là "Đã ăn" và "Xong".
//
// Ai gọi tới: planRoutes, tức mọi thao tác trên màn Kế hoạch tuần
// Nhận vào:   khoảng ngày, hồ sơ người dùng, và món do người dùng tự thêm
// Trả ra:     danh sách món và buổi tập đã lên lịch, hoặc danh sách đi chợ
// Khi lỗi:    chưa có mục tiêu calo thì trả PROFILE_INCOMPLETE và app mời
//             hoàn tất hồ sơ. AI hết lượt thì trả QUOTA và app bảo thử lại sau.
const PlanMeal = require("../models/PlanMeal");
const PlanWorkout = require("../models/PlanWorkout");
const Meal = require("../models/Meal");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const { insightModels } = require("../config/geminiModels");
const { generateWithFallback } = require("../services/aiClient");
const { CONDITION_GUIDE } = require("../services/coach/coachContext");
const { filterDishes } = require("../services/nutrition/foodSafetyFilter");
const { dateKey, requestTodayKey } = require("../utils/dateUtils");
const { validateMealName, validateNutritionValues } = require("../validators/mealInputValidator");
const { replacePlanRange } = require("../services/planReplacement");
const {
  HOME_EXERCISE_CATEGORIES,
  HOME_EXERCISE_DURATIONS,
  isAllowedHomeExercise,
} = require("../config/homeRoutineRules");
const { getGuidedRoutine, buildExerciseSnapshot } = require("../config/exerciseCatalog");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");
const { MEAL_TYPES } = require("../config/mealEnums");

// Khác với nhật ký món, ở đây ngày ở tương lai là hợp lệ vì đang lên kế hoạch.
// Người dùng tự thêm một món vào kế hoạch, không qua AI.
exports.addPlanMeal = async (req, res) => {
  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (!name || !mealType || calories === undefined || !date)
    return res.status(400).json({ message: "Name, mealType, calories and date are required." });

  if (!MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  const normalizedName = validateMealName(name);
  if (normalizedName.error) return res.status(400).json({ message: normalizedName.error });
  const nutrition = validateNutritionValues({ calories, protein, carbs, fat });
  if (nutrition.error) return res.status(400).json({ message: nutrition.error });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  const planMeal = await PlanMeal.create({
    user: req.user.id,
    name: normalizedName.value,
    mealType,
    ...nutrition.value,
    note: note || "",
    date,
  });

  res.status(201).json({ message: "Planned meal added.", planMeal });
};

// Lấy mọi thứ đã lên lịch trong một khoảng ngày, cả món ăn lẫn buổi tập.
// Hai lệnh đọc chạy song song vì không cái nào cần kết quả của cái kia.
exports.getPlanMeals = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const [planMeals, planWorkouts] = await Promise.all([
    PlanMeal.find(filter).sort({ date: 1, createdAt: 1 }),
    PlanWorkout.find(filter).sort({ date: 1 }),
  ]);
  res.json({ planMeals, planWorkouts });
};

// Đây là luồng AI phức tạp nhất của app, và là luồng cần nắm rõ nhất khi bảo vệ.
// Vì sao cần hai lớp an toàn: câu lệnh gửi AI chỉ là lời dặn, AI vẫn có thể quên.
// Lớp thứ hai là foodSafetyFilter chạy sau phản hồi AI nên app không bỏ qua được.
// Giới hạn của lớp hai: nó chỉ đọc TÊN món, không phân tích được nguyên liệu bên trong.
exports.generatePlan = async (req, res) => {
  const { startDate, endDate, language, note } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || ""))
    return res.status(400).json({ message: "startDate and endDate must be YYYY-MM-DD." });

  // Bước 1. Chặn ở 14 ngày để một lần gọi AI không phình quá to.
  const dates = [];
  const cur = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  while (cur <= end && dates.length < 14) {
    dates.push(dateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  if (dates.length === 0) return res.status(400).json({ message: "Invalid date range." });

  try {
    // Bước 2. Đọc hồ sơ để lấy bệnh nền, mục tiêu calo và sở thích ăn uống.
    // Đây là nguồn dữ liệu cho cả hai lớp an toàn ở bước 3 và bước 5.
    const user = await User.findById(req.user.id).select("gender age weight height goal activityLevel conditions calorieGoal tastePreferences weeklyWorkoutTarget");
    const conditions = user?.conditions?.length ? user.conditions.join(", ") : "none";
    // Kế hoạch tuần xoay quanh mục tiêu calo, nên chưa có mục tiêu thì dừng lại
    // và mời hoàn tất hồ sơ, thay vì lặng lẽ lên kế hoạch theo một con số bịa.
    const goalCal = user?.calorieGoal;
    if (!goalCal)
      return res.status(400).json({ message: "PROFILE_INCOMPLETE" });
    const langName = language === "vi" ? "Vietnamese (tiếng Việt)" : "English";
    // Cắt RIÊNG từng vế theo hạn mức của chính nó rồi mới nối.
    // Bản cũ nối trước rồi mới cắt chung một lần, nên ghi chú dài sẽ đẩy mất
    // khẩu vị đã lưu trong hồ sơ và AI dựng kế hoạch theo dữ liệu bị cụt.
    const prefs = [
      String(user?.tastePreferences || "").trim().slice(0, LEGACY_LIMITS.TASTE_PREFERENCES),
      String(note || "").trim().slice(0, INPUT_LIMITS.PLAN_NOTE),
    ]
      .filter(Boolean)
      .join("; ");

    // Bước 3. LỚP AN TOÀN THỨ NHẤT.
    // Nhét bệnh nền, mục tiêu calo và sở thích vào câu lệnh gửi cho AI.
    // Đây mới chỉ là LỜI DẶN, AI vẫn có thể quên, nên còn lớp thứ hai ở bước 5.
    const prompt = `You are a nutrition coach creating a personalized weekly meal and at-home activity plan.

USER PROFILE:
- Goal: ${user?.goal || "maintain_weight"} | Daily calorie target: ${goalCal} kcal
- Health conditions: ${conditions} (${CONDITION_GUIDE})
- Weight: ${user?.weight ?? "unknown"} kg, Height: ${user?.height ?? "unknown"} cm, Age: ${user?.age ?? "unknown"}, Gender: ${user?.gender ?? "unknown"}, Activity: ${user?.activityLevel || "moderate"}

REQUIREMENTS:
- Plan meals for EXACTLY these dates: ${dates.join(", ")}
- "name" must be a SHORT dish name only, at most 6 words. NO cooking notes, NO parentheses, NO instructions in the name (write "Cơm gạo lứt cá kho", NOT "Cơm gạo lứt, cá thu sốt cà chua (ít muối, không đường)"). The health adjustments are implied by your dish CHOICE, not written in the name.
- Each day: breakfast, lunch, dinner and optionally one snack. Daily total within ±10% of ${goalCal} kcal.
- Prefer common Vietnamese dishes that are easy to cook or buy. Vary dishes across the week — do not repeat the same dish two days in a row.
- Adjust every dish choice to the health conditions above.
- HARD CONSTRAINT: NO dish may contain ANY ingredient the health conditions forbid (per the guide above). Example: gout → absolutely no shrimp/tôm, crab, shellfish, organ meats, red meat. Before finalizing each dish, CHECK its ingredients against the conditions; when in doubt, pick a safer dish.
- For activity, choose at most one guided at-home session per day. Use ONLY these categories: ${HOME_EXERCISE_CATEGORIES.join(", ")}. Use ONLY these durations in minutes: ${HOME_EXERCISE_DURATIONS.join(", ")}.
- A rest day must use {"rest":true}. A training day must use {"rest":false,"category":"allowed category","durationMin":allowed number}.
${user?.weeklyWorkoutTarget ? `- Across a seven-day plan, schedule about ${user.weeklyWorkoutTarget} training days.` : "- Balance training and rest days based on the profile."}
- Do not invent an exercise name, MET value, calorie burn or equipment. MealMate will link the category and duration to its own guided catalogue.
- Never use the em dash character (—) in any text; use a comma instead.
- Write dish names in ${langName}.${
      prefs
        ? `\n- USER FOOD PREFERENCES (MUST follow strictly — avoid disliked/allergy foods): ${prefs}`
        : ""
    }

Return ONLY valid JSON:
{"days":[{"date":"YYYY-MM-DD","workout":{"rest":false,"category":"everyday|recovery|strength|cardio","durationMin":10},"meals":[{"name":"...","mealType":"breakfast|lunch|dinner|snack","calories":0,"protein":0,"carbs":0,"fat":0}]}]}`;

    const result = await generateWithFallback(insightModels, prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return res.status(500).json({ message: "AI returned an invalid plan. Please try again." });
    }

    // Bước 4. Không tin thẳng dữ liệu AI trả về. Ép mọi số về số nguyên không âm,
    // cắt chữ quá dài, và bỏ qua ngày nào không nằm trong khoảng đã yêu cầu.
    const mealDocs = [];
    // Gợi ý tập của từng ngày. Lọc bỏ những gợi ý mà app không có mục tương ứng,
    // xem homeRoutineRules, kẻo người dùng bấm vào không được.
    const workoutDocs = [];
    for (const day of Array.isArray(parsed.days) ? parsed.days : []) {
      if (!dates.includes(day?.date)) continue;
      for (const m of Array.isArray(day.meals) ? day.meals : []) {
        if (!m?.name || m.calories == null) continue;
        const nutrition = validateNutritionValues(m);
        if (nutrition.error) continue;
        mealDocs.push({
          user: req.user.id,
          name: String(m.name).trim().slice(0, LEGACY_LIMITS.MEAL_NAME),
          mealType: MEAL_TYPES.includes(m.mealType) ? m.mealType : "snack",
          calories: Math.round(nutrition.value.calories),
          protein: Math.round(nutrition.value.protein),
          carbs: Math.round(nutrition.value.carbs),
          fat: Math.round(nutrition.value.fat),
          date: day.date,
        });
      }

      const workout = day?.workout;
      const workoutDuration = Math.round(Number(workout?.durationMin));
      if (
        workout &&
        !workout.rest &&
        isAllowedHomeExercise(workout.category, workoutDuration)
      ) {
        workoutDocs.push({
          user: req.user.id,
          date: day.date,
          category: workout.category,
          durationMin: workoutDuration,
          text: "",
        });
      }
    }
    // Bước 5. Lớp an toàn thứ hai, chạy ở server nên người dùng không bỏ qua được.
    const { kept: safeMealDocs, removed } = filterDishes(mealDocs, user?.conditions || []);
    if (removed.length)
      console.warn("Plan condition-filter removed:", removed.map((r) => `${r.name} (${r.condition})`).join(", "));

    if (safeMealDocs.length === 0)
      return res.status(500).json({ message: "AI plan came back empty. Please try again." });

    // Bước 6. Ghi bản mới thành công rồi mới xóa bản cũ trong đúng khoảng ngày.
    // Nếu database lỗi giữa chừng, người dùng vẫn còn kế hoạch trước đó.
    const range = { user: req.user.id, date: { $gte: startDate, $lte: endDate } };
    await replacePlanRange(range, safeMealDocs, workoutDocs);
    res.json({ message: "Plan generated.", meals: safeMealDocs.length, workouts: workoutDocs.length });
  } catch (err) {
    console.error("Plan generate error:", err.message);
    // Tách riêng lỗi hết lượt gọi AI. App nhận chữ QUOTA sẽ hiện thông báo
    // hết lượt kèm giờ được dùng lại, thay vì báo lỗi chung chung.
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Failed to generate the plan. Please try again." });
  }
};

// Gom món đã lên lịch rồi nhờ AI viết danh sách đi chợ.
// AI được dặn cộng dồn nguyên liệu trùng nhau, để mua một lần thay vì mua lẻ.
// Kết quả AI trả về vẫn bị lọc và cắt bớt ở dưới, không hiện thẳng lên màn hình.
exports.groceryList = async (req, res) => {
  const { startDate, endDate, language } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || ""))
    return res.status(400).json({ message: "startDate and endDate must be YYYY-MM-DD." });

  const meals = await PlanMeal.find({ user: req.user.id, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
  if (meals.length === 0)
    return res.status(400).json({ message: "No planned meals in this range yet." });

  const langName = language === "vi" ? "Vietnamese (tiếng Việt)" : "English";
  const dishLines = meals.map((m) => `- ${m.date} (${m.mealType}): ${m.name}`).join("\n");

  const prompt = `You are helping ONE person shop for the meals they planned this week.

PLANNED DISHES:
${dishLines}

Create a realistic grocery shopping list for ONE person to cook these dishes at home:
- Combine duplicate ingredients across dishes into one line with a total estimated quantity (e.g. "500g thịt bò").
- Group items into 3-5 sensible categories (e.g. meat/fish, vegetables & herbs, dry goods & spices, others).
- Assume a Vietnamese market/supermarket; skip water and basic items everyone has (salt, cooking oil) unless a dish needs something special.
- Keep it concise: quantities are rough estimates for one person.
- Never use the em dash character (—) in any text.
- Write everything in ${langName}.

Return ONLY valid JSON:
{"groups":[{"name":"<category>","items":["<quantity + ingredient>", "..."]}]}`;

  try {
    const result = await generateWithFallback(insightModels, prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return res.status(500).json({ message: "AI returned an invalid list. Please try again." });
    }
    // Lọc lại kết quả AI, bỏ nhóm thiếu tên, và cắt bớt cho khỏi dài quá màn hình.
    const groups = (Array.isArray(parsed.groups) ? parsed.groups : [])
      .filter((g) => g && g.name && Array.isArray(g.items))
      .map((g) => ({ name: String(g.name).slice(0, 60), items: g.items.map((s) => String(s).slice(0, 120)).slice(0, 30) }));
    if (groups.length === 0)
      return res.status(500).json({ message: "AI list came back empty. Please try again." });
    res.json({ groups });
  } catch (err) {
    console.error("Grocery list error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Failed to build the grocery list." });
  }
};

// Sửa một món đã lên lịch. Chỉ đổi những trường người dùng thật sự gửi lên,
// trường nào không gửi thì giữ nguyên giá trị cũ.
// Kiểm chủ sở hữu trước mọi thứ, để người này không sửa được kế hoạch người kia.
exports.updatePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this planned meal." });

  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (mealType !== undefined && !MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  const nutrition = validateNutritionValues({
    calories: calories ?? planMeal.calories,
    protein: protein ?? planMeal.protein,
    carbs: carbs ?? planMeal.carbs,
    fat: fat ?? planMeal.fat,
  });
  if (nutrition.error) return res.status(400).json({ message: nutrition.error });
  const normalizedName = name === undefined ? null : validateMealName(name);
  if (normalizedName?.error) return res.status(400).json({ message: normalizedName.error });

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (normalizedName) planMeal.name = normalizedName.value;
  if (mealType !== undefined) planMeal.mealType = mealType;
  if (calories !== undefined) planMeal.calories = nutrition.value.calories;
  if (protein !== undefined) planMeal.protein = nutrition.value.protein;
  if (carbs !== undefined) planMeal.carbs = nutrition.value.carbs;
  if (fat !== undefined) planMeal.fat = nutrition.value.fat;
  if (note !== undefined) planMeal.note = note;
  if (date !== undefined) planMeal.date = date;

  await planMeal.save();
  res.json({ message: "Planned meal updated.", planMeal });
};

// Xóa một món đã lên lịch. Cũng phải kiểm chủ sở hữu trước khi xóa.
exports.deletePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this planned meal." });

  await planMeal.deleteOne();
  res.json({ message: "Planned meal deleted." });
};

// Nút "Xong" ở gợi ý tập trong kế hoạch tuần.
// Đây là chỗ kế hoạch biến thành dữ liệu thật, nên phải chặn bấm hai lần
// để không tạo trùng hai buổi tập cho cùng một gợi ý.
exports.markWorkoutDone = async (req, res) => {
  const pw = await PlanWorkout.findById(req.params.id);
  if (!pw) return res.status(404).json({ message: "Planned workout not found." });
  if (pw.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });
  if (pw.done) return res.status(400).json({ message: "Already marked as done." });
  if (pw.date !== requestTodayKey(req))
    return res.status(400).json({ message: "A planned workout can only be completed on its scheduled day." });

  const suppliedName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const routine = getGuidedRoutine(req.body?.routineKey);

  if (!suppliedName || suppliedName.length > LEGACY_LIMITS.MEAL_NAME || !routine)
    return res.status(400).json({ message: "Invalid guided workout details." });
  if (
    !isAllowedHomeExercise(pw.category, pw.durationMin) ||
    routine.category !== pw.category ||
    routine.durationMin !== pw.durationMin
  )
    return res.status(400).json({ message: "Workout duration does not match the plan." });

  const name = suppliedName;
  const met = routine.met;
  const durationMin = routine.durationMin;

  // Calo tiêu hao phụ thuộc thẳng vào cân nặng, nên thiếu cân nặng thì
  // KHÔNG đoán một con số mặc định. Bản cũ dùng 60 kg cho mọi người,
  // khiến buổi tập của người 45 kg và người 90 kg ra cùng một kết quả.
  const user = await User.findById(req.user.id).select("weight");
  if (!(user?.weight > 0))
    return res.status(400).json({ message: "PROFILE_WEIGHT_REQUIRED" });
  const caloriesBurned = Math.round(met * user.weight * (durationMin / 60));
  const snapshot = buildExerciseSnapshot("guided", req.body.routineKey, routine, user.weight);

  // Giành quyền trước rồi mới ghi, cùng lý do với nút "Đã ăn" bên dưới:
  // phép kiểm `pw.done` ở trên là đọc rồi mới ghi nên hai lượt bấm sát nhau
  // đều lọt qua và tạo HAI buổi tập. Mọi phép kiểm khác đã chạy xong ở trên,
  // nên tới đây chỉ còn đúng việc giành quyền.
  const claimed = await PlanWorkout.findOneAndUpdate(
    { _id: pw._id, user: req.user.id, done: false },
    { done: true, name, met },
    { new: true },
  );
  if (!claimed) return res.status(400).json({ message: "Already marked as done." });

  let exercise;
  try {
    exercise = await Exercise.create({
      user: req.user.id,
      name,
      ...snapshot,
      durationMin,
      caloriesBurned,
      date: claimed.date,
    });
  } catch (err) {
    // Ghi hụt thì trả lại trạng thái chưa xong, kẻo buổi tập biến mất khỏi kế
    // hoạch mà nhật ký cũng không có, tức mất luôn không ai biết.
    await PlanWorkout.updateOne({ _id: claimed._id }, { done: false }).catch(() => {});
    throw err;
  }

  res.json({ message: "Workout logged.", planWorkout: claimed, exercise });
};

// Nút "Đã ăn" ở món trong kế hoạch tuần.
// Giống nút Xong ở trên, phải chặn bấm hai lần để không ghi trùng món vào nhật ký.
exports.markEaten = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  if (planMeal.done)
    return res.status(400).json({ message: "This meal is already marked as eaten." });

  if (planMeal.date > requestTodayKey(req))
    return res.status(400).json({ message: "Cannot mark a future planned meal as eaten." });

  // GIÀNH QUYỀN TRƯỚC RỒI MỚI GHI. Phép kiểm `planMeal.done` ở trên là đọc rồi
  // mới ghi, nên hai lượt gọi sát nhau đều đọc thấy chưa xong, đều đi qua, và
  // ghi HAI món giống hệt vào nhật ký. Bấm nhanh hai cái lúc mạng chậm là dính.
  // Một lượt findOneAndUpdate có điều kiện `done: false` thì database tự quyết
  // ai thắng, lượt thua nhận null và bị từ chối.
  const claimed = await PlanMeal.findOneAndUpdate(
    { _id: planMeal._id, user: req.user.id, done: false },
    { done: true },
    { new: true },
  );
  if (!claimed) return res.status(400).json({ message: "This meal is already marked as eaten." });

  let meal;
  try {
    meal = await Meal.create({
      user: req.user.id,
      name: claimed.name,
      mealType: claimed.mealType,
      calories: claimed.calories,
      protein: claimed.protein,
      carbs: claimed.carbs,
      fat: claimed.fat,
      note: claimed.note,
      date: claimed.date,
    });
  } catch (err) {
    // Đã giành quyền nhưng ghi hụt. Trả lại trạng thái chưa xong, kẻo món biến
    // mất khỏi kế hoạch mà nhật ký cũng không có gì, tức mất luôn không ai biết.
    await PlanMeal.updateOne({ _id: claimed._id }, { done: false }).catch(() => {});
    throw err;
  }

  res.json({ message: "Marked as eaten and logged to diary.", planMeal: claimed, meal });
};
