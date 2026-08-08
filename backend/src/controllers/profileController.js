// ═══ FILE NÀY LÀM GÌ ═══
// Lo hồ sơ cá nhân và các chỉ số tính ra từ hồ sơ: BMI, BMR và TDEE.
//
// Ai gọi tới: profileRoutes, tức màn Hồ sơ, màn Mục tiêu, và bước thiết lập lần đầu
// Nhận vào:   giới tính, tuổi, cân nặng, chiều cao, mức vận động, bệnh nền
// Trả ra:     hồ sơ đã lưu kèm mục tiêu calo tính ra được
// Khi lỗi:    thiếu dữ liệu để tính thì để mục tiêu calo RỖNG, không bịa số.
//             App thấy rỗng thì mời người dùng hoàn tất hồ sơ.
//
// Bệnh nền lưu ở đây chính là thứ mà cả hai lớp an toàn của kế hoạch tuần
// và của Coach đều dựa vào.
const User = require("../models/User");
const {
  calculateBMR, calculateTDEE, autoGoal, resolveRate, resolveWeightDirection,
} = require("../services/nutrition/calorieGoal");
const {
  PROFILE_LIMITS, WEEKLY_RATE_KG, WEIGHT_RATE_OPTIONS,
  WEIGHT_GOALS, WEIGHT_GOAL_VALUES, MAINTAIN_WEIGHT_THRESHOLD_KG, HEALTH_CONDITIONS,
} = require("../config/nutritionConstants");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");

// ══════════════════════════════════════════════════════════
// HAI CỬA VỀ HỒ SƠ
//
// Không phải luồng. Một cửa đọc hồ sơ, một cửa lưu hồ sơ.
// 
// Nhớ: đây là nơi DUY NHẤT chốt mục tiêu calo chính thức.
//      App có tính một bản để xem trước, nhưng bản đó chỉ để hiện,
//      và có thể lệch với bản này khi calorieGoal áp mức sàn.
// ══════════════════════════════════════════════════════════

// BMI bằng cân nặng chia cho bình phương chiều cao tính theo mét.
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

// Gom vào một hàm để getProfile và updateProfile luôn trả về cùng một hình dạng.
function buildStats(user) {
  const bmi = calculateBMI(user.weight, user.height);
  const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
  const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel);
  const weightDirection = resolveWeightDirection({
    goal: user.goal,
    currentWeight: user.weight,
    targetWeight: user.targetWeight,
  });

  return {
    bmi,
    bmr: bmr === null ? null : Math.round(bmr),
    tdee,
    weightDirection,
    rateBands: WEEKLY_RATE_KG,
    rateOptions: WEIGHT_RATE_OPTIONS,
    maintainWeightThresholdKg: MAINTAIN_WEIGHT_THRESHOLD_KG,
  };
}

// Các chỉ số tính lại mỗi lần gọi chứ không lưu, để luôn khớp với hồ sơ mới nhất.
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found." });

  res.json({ user, stats: buildStats(user) });
};

// Lưu hồ sơ. Đây là nơi DUY NHẤT tính lại mục tiêu calo chính thức,
// app chỉ tính bản xem trước rồi hiện tạm thôi.
exports.updateProfile = async (req, res) => {
  const { name, gender, age, weight, height, goal, activityLevel, conditions, calorieGoal, avatar, language, tastePreferences, isPrivate, targetWeight, weeklyRateKg, weeklyWorkoutTarget } = req.body;

  // Khoảng hợp lệ lấy từ nutritionConstants, không gõ lại số trong file này.
  const profileLimits = PROFILE_LIMITS;

  if (age && (age < profileLimits.age.min || age > profileLimits.age.max))
    return res.status(400).json({ message: `Age must be between ${profileLimits.age.min} and ${profileLimits.age.max}.` });

  if (weight && (weight < profileLimits.weightKg.min || weight > profileLimits.weightKg.max))
    return res.status(400).json({ message: `Weight must be between ${profileLimits.weightKg.min} and ${profileLimits.weightKg.max} kg.` });

  if (targetWeight != null && (targetWeight < profileLimits.weightKg.min || targetWeight > profileLimits.weightKg.max))
    return res.status(400).json({ message: `Target weight must be between ${profileLimits.weightKg.min} and ${profileLimits.weightKg.max} kg.` });

  if (height && (height < profileLimits.heightCm.min || height > profileLimits.heightCm.max))
    return res.status(400).json({ message: `Height must be between ${profileLimits.heightCm.min} and ${profileLimits.heightCm.max} cm.` });

  if (gender && !["male", "female"].includes(gender))
    return res.status(400).json({ message: "Gender must be male or female." });

  if (goal && !WEIGHT_GOAL_VALUES.includes(goal))
    return res.status(400).json({ message: "Invalid goal." });

  if (activityLevel && !["sedentary", "moderate", "active"].includes(activityLevel))
    return res.status(400).json({ message: "Invalid activity level." });

  // Chặn ngay ở cửa chứ không đợi model. Trường này nuôi thẳng lớp lọc an toàn,
  // nên một khóa lạ lọt vào là đi tới chỗ tra bảng bệnh nền. Mảng RỖNG là hợp lệ,
  // đó là cách giao diện gửi lên khi người dùng chọn Không có.
  if (conditions !== undefined) {
    if (!Array.isArray(conditions) || conditions.some((item) => !HEALTH_CONDITIONS.includes(item)))
      return res.status(400).json({ message: "Invalid health condition." });
  }

  if (language && !["vi", "en"].includes(language))
    return res.status(400).json({ message: "Language must be vi or en." });

  if (calorieGoal != null &&
      (typeof calorieGoal !== "number" || calorieGoal < profileLimits.calorieGoal.min || calorieGoal > profileLimits.calorieGoal.max))
    return res.status(400).json({ message: `Calorie goal must be between ${profileLimits.calorieGoal.min} and ${profileLimits.calorieGoal.max} kcal.` });

  // Tốc độ đổi cân nặng. Chấp nhận cả hai chiều nên chỉ kiểm độ lớn,
  // vì hướng giảm hay tăng được suy ra từ cân nặng mục tiêu chứ không từ dấu.
  const rateCeiling = Math.max(WEEKLY_RATE_KG.lose.max, WEEKLY_RATE_KG.gain.max);
  if (weeklyRateKg != null &&
      (typeof weeklyRateKg !== "number" || weeklyRateKg < 0 || weeklyRateKg > rateCeiling))
    return res.status(400).json({ message: `Weekly rate must be between 0 and ${rateCeiling} kg.` });

  if (weeklyWorkoutTarget != null &&
      (typeof weeklyWorkoutTarget !== "number" || weeklyWorkoutTarget < 0 || weeklyWorkoutTarget > 7))
    return res.status(400).json({ message: "Weekly workout target must be between 0 and 7." });

  // Khẩu vị: BÁO LỖI chứ không cắt bớt. Bản cũ dùng slice nên người dùng gõ dài
  // vẫn thấy lưu thành công trong khi phần đuôi đã biến mất, không báo một câu nào.
  // Trần ở đây là trần lịch sử, vì hồ sơ cũ có thể đang giữ chuỗi dài hơn số mới.
  if (tastePreferences != null &&
      String(tastePreferences).trim().length > LEGACY_LIMITS.TASTE_PREFERENCES)
    return res.status(400).json({ message: `Taste preferences must be ${LEGACY_LIMITS.TASTE_PREFERENCES} characters or fewer.` });

  if (name != null && typeof name !== "string")
    return res.status(400).json({ message: "Name must be text." });

  if (name != null && String(name).trim().length > INPUT_LIMITS.DISPLAY_NAME)
    return res.status(400).json({ message: `Name must be ${INPUT_LIMITS.DISPLAY_NAME} characters or fewer.` });

  const currentProfile = await User.findById(req.user.id).select(
    "customGoal weight height age gender activityLevel goal targetWeight weeklyRateKg"
  );
  if (!currentProfile) return res.status(404).json({ message: "User not found." });

  // Ba trường hợp của mục tiêu calo:
  //   gửi lên một con số  thì người dùng tự đặt, ghi nhớ là mục tiêu tự đặt.
  //   gửi lên null        thì người dùng bấm "Dùng tự động", quay về để app tính.
  //   không gửi gì        thì giữ nguyên lựa chọn cũ.
  const usesCustomCalorieGoal =
    typeof calorieGoal === "number" ? true : calorieGoal === null ? false : currentProfile.customGoal;

  const currentWeight = weight ?? currentProfile.weight;
  const nextTargetWeight = targetWeight !== undefined ? targetWeight : currentProfile.targetWeight;
  const requestedGoal = goal ?? currentProfile.goal;
  const shouldSyncWeightGoal = weight !== undefined || targetWeight !== undefined || goal !== undefined;
  const weightDirection = resolveWeightDirection({
    goal: requestedGoal,
    currentWeight,
    targetWeight: nextTargetWeight,
  });
  const derivedGoal = shouldSyncWeightGoal
    ? WEIGHT_GOALS[weightDirection]
    : requestedGoal;
  const adjustedGoal = derivedGoal !== requestedGoal ? derivedGoal : null;
  const nextGoal = adjustedGoal ?? requestedGoal;
  const requestedWeeklyRateKg = weeklyRateKg !== undefined ? weeklyRateKg : currentProfile.weeklyRateKg;
  const nextWeeklyRateKg = resolveRate(weightDirection, requestedWeeklyRateKg);

  // Khi để app tự tính, mục tiêu được tính lại từ hồ sơ MỚI trộn với hồ sơ cũ,
  // vì người dùng có thể chỉ sửa cân nặng mà không gửi các trường còn lại.
  let nextCalorieGoal;
  if (typeof calorieGoal === "number") {
    nextCalorieGoal = calorieGoal;
  } else if (!usesCustomCalorieGoal) {
    nextCalorieGoal = autoGoal({
      weight: currentWeight,
      height: height ?? currentProfile.height,
      age: age ?? currentProfile.age,
      gender: gender ?? currentProfile.gender,
      activityLevel: activityLevel ?? currentProfile.activityLevel,
      goal: nextGoal,
      // Cân nặng mục tiêu và tốc độ nay tham gia trực tiếp vào mục tiêu calo,
      // nên phải trộn vào đây giống các trường số đo khác.
      targetWeight: nextTargetWeight,
      weeklyRateKg: nextWeeklyRateKg,
    });
  }

  // Cân nặng mục tiêu là nguồn ƯU TIÊN quyết định hướng tăng hay giảm, còn ô mục
  // tiêu ba giá trị chỉ là nhánh dự phòng. Nếu hai thứ lệch nhau thì mục tiêu calo
  // tính một đằng, còn Coach với Kế hoạch tuần lại đọc ô goal nên khuyên một nẻo.
  // Nay đồng bộ ngay lúc lưu, và trả cờ để app NÓI cho người dùng biết đã đổi,
  // vì sửa lựa chọn của người dùng mà im lặng là điều app này không làm.
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name: name.trim() }),
      ...(gender && { gender }),
      ...(age && { age }),
      ...(weight && { weight }),
      ...(height && { height }),
      ...((adjustedGoal || goal !== undefined) && { goal: nextGoal }),
      ...(activityLevel && { activityLevel }),
      ...(conditions && { conditions }),
      ...(nextCalorieGoal != null && { calorieGoal: nextCalorieGoal }),
      customGoal: usesCustomCalorieGoal,
      ...(avatar !== undefined && { avatar }),
      ...(language && { language }),
      ...(tastePreferences !== undefined && { tastePreferences: String(tastePreferences).trim() }),
      ...(isPrivate !== undefined && { isPrivate: !!isPrivate }),
      ...(targetWeight !== undefined && { targetWeight }),
      ...((weeklyRateKg !== undefined || shouldSyncWeightGoal) && { weeklyRateKg: nextWeeklyRateKg }),
      ...(weeklyWorkoutTarget !== undefined && { weeklyWorkoutTarget }),
    },
    { returnDocument: "after" }
  ).select("-password");

  res.json({
    message: "Profile updated successfully.",
    user: updated,
    stats: buildStats(updated),
    // Chỉ có khi app tự đổi ô mục tiêu cho khớp cân nặng mục tiêu.
    ...(adjustedGoal && { adjustedGoal }),
  });
};
