// ═══ FILE NÀY LÀM GÌ ═══
// Tính mục tiêu calo mỗi ngày từ hồ sơ người dùng.
//
// Ai gọi tới: profileController (khi lưu hồ sơ), coachContext (đưa cho AI),
//             planController (dựng thực đơn theo mục tiêu)
// Nhận vào:   giới tính, tuổi, cân nặng, chiều cao, mức vận động, mục tiêu cân
// Trả ra:     số calo mục tiêu mỗi ngày
// Khi lỗi:    thiếu dữ liệu hồ sơ thì trả rỗng, KHÔNG bịa một con số mặc định.
//             Bịa số sẽ khiến người dùng tưởng app đã tính cho mình.
//
// Ba chặng tính: công thức Mifflin St Jeor ra năng lượng nghỉ, nhân hệ số vận động
// ra TDEE, rồi cộng trừ theo tốc độ muốn đổi cân nặng.
// Có một mức SÀN không cho tụt xuống dưới, để app không đề xuất ăn quá ít.
//
// Mọi con số dùng ở đây đều lấy từ config/nutritionConstants, không gõ thẳng vào file này.
// Mọi con số dùng ở đây đều lấy từ config/nutritionConstants, không gõ thẳng vào file này.
const {
  MIFFLIN_ST_JEOR, ACTIVITY_MULTIPLIERS, DEFAULT_ACTIVITY_LEVEL, CALORIE_FLOOR,
  KCAL_PER_KG_BODY_WEIGHT, WEEKLY_RATE_KG, WEIGHT_GOALS,
  MAINTAIN_WEIGHT_THRESHOLD_KG,
} = require("../../config/nutritionConstants");

// Tách riêng khỏi calculateTDEE để màn Hồ sơ hiện được BMR cạnh TDEE.
// Hai số chênh nhau đúng một biến là mức vận động, nên đặt cạnh nhau thì
// người dùng thấy ngay vì sao chọn mức vận động lại làm đổi mọi thứ.
// Lưu ý về giới hạn: công thức chỉ biết cân nặng, KHÔNG biết tỷ lệ cơ và mỡ.
// Hai người cùng cân nặng nhưng khác thể trạng sẽ ra cùng một BMR.
function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age || !gender) return null;
  const m = MIFFLIN_ST_JEOR;
  const offset = gender === "male" ? m.maleOffset : m.femaleOffset;
  return m.weightFactor * weight + m.heightFactor * height - m.ageFactor * age + offset;
}

function calculateTDEE(weight, height, age, gender, activityLevel) {
  const bmr = calculateBMR(weight, height, age, gender);
  if (bmr === null) return null;

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS[DEFAULT_ACTIVITY_LEVEL];
  return Math.round(bmr * multiplier);
}

// Trước đây app trừ cứng 500 và cộng cứng 300 cho mọi người. Nay con số đó
// được suy ra từ tốc độ mà chính người dùng chọn.
function dailyDeltaFromRate(weeklyRateKg) {
  const rate = Number(weeklyRateKg) || 0;
  return (rate * KCAL_PER_KG_BODY_WEIGHT) / 7;
}

// Ưu tiên hai số cân nặng vì đó là ý muốn cụ thể. Chỉ khi chưa đặt cân nặng
// mục tiêu mới quay lại đọc ô mục tiêu ba giá trị.
function resolveWeightDirection({ goal, currentWeight, targetWeight }) {
  if (currentWeight && targetWeight) {
    // Chênh dưới nửa kg thì coi như đang muốn giữ cân.
    const weightDifferenceKg = targetWeight - currentWeight;
    if (Math.abs(weightDifferenceKg) < MAINTAIN_WEIGHT_THRESHOLD_KG) return "maintain";
    return weightDifferenceKg < 0 ? "lose" : "gain";
  }
  if (goal === WEIGHT_GOALS.lose) return "lose";
  if (goal === WEIGHT_GOALS.gain) return "gain";
  return "maintain";
}

function resolveWeightGoal(profile) {
  return WEIGHT_GOALS[resolveWeightDirection(profile)];
}

function resolveRate(weightDirection, weeklyRateKg) {
  if (weightDirection === "maintain") return 0;
  const band = weightDirection === "lose" ? WEEKLY_RATE_KG.lose : WEEKLY_RATE_KG.gain;
  const asked = Number(weeklyRateKg);
  if (!asked || asked <= 0) return band.default;
  // CHỈ kẹp trần. Không kẹp đáy, vì đi chậm hơn không gây hại và không tài liệu
  // nào quy định tốc độ tối thiểu. Kẹp đáy là sửa lựa chọn của người dùng
  // theo hướng kém an toàn hơn.
  return Math.min(band.max, asked);
}

// Đây là hàm chính của file, và là chỗ đáng đọc kỹ nhất khi bảo vệ.
// Bước 4 là chỗ quan trọng nhất. Bản cũ chặn sàn rồi im lặng, nên một người
// nhỏ con chọn tốc độ 1 kg mỗi tuần vẫn thấy app ghi 1 kg mỗi tuần trong khi
// mức thâm hụt thật chỉ đủ cho khoảng nửa con số đó. Ngày dự kiến vì thế sai gần gấp đôi.
// Nay hàm trả về cả tốc độ đã yêu cầu lẫn tốc độ thật để màn hình hiện đúng.
function buildCalorieGoal({ tdee, gender, goal, weight, targetWeight, weeklyRateKg }) {
  if (!tdee) return null;

  const weightDirection = resolveWeightDirection({ goal, currentWeight: weight, targetWeight });
  const requestedRateKg = resolveRate(weightDirection, weeklyRateKg);
  const requestedDelta = dailyDeltaFromRate(requestedRateKg);

  const unclampedCalorieGoal = weightDirection === "lose"
    ? tdee - requestedDelta
    : weightDirection === "gain"
      ? tdee + requestedDelta
      : tdee;
  const floor = gender === "male" ? CALORIE_FLOOR.male : CALORIE_FLOOR.female;
  const calorieGoal = Math.round(Math.max(floor, unclampedCalorieGoal));
  const floorApplied = calorieGoal > Math.round(unclampedCalorieGoal);

  // Mức chênh còn lại SAU khi chặn sàn mới là mức chênh thật sự có hiệu lực.
  const actualDelta = Math.abs(tdee - calorieGoal);
  const actualRateKg = weightDirection === "maintain"
    ? 0
    : Math.round(((actualDelta * 7) / KCAL_PER_KG_BODY_WEIGHT) * 100) / 100;

  return { calorieGoal, direction: weightDirection, requestedRateKg, actualRateKg, floorApplied, floor, tdee };
}

// Luôn dùng tốc độ THẬT chứ không dùng tốc độ người dùng chọn, nếu không
// ngày dự kiến sẽ sai mỗi khi mức sàn an toàn được áp dụng.
function estimateGoalDate({ weight, targetWeight, actualRateKg, from = new Date() }) {
  if (!weight || !targetWeight || !actualRateKg) return null;
  const remainingKg = Math.abs(targetWeight - weight);
  if (remainingKg < MAINTAIN_WEIGHT_THRESHOLD_KG) return null;

  const days = Math.ceil((remainingKg / actualRateKg) * 7);
  const date = new Date(from.getTime());
  date.setDate(date.getDate() + days);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { days, date: key, remainingKg: Math.round(remainingKg * 10) / 10 };
}

// Gộp các bước trên thành một. Đây là hàm mà profileController
// và weightController gọi khi người dùng để app tự tính mục tiêu calo.
// Trả về đủ thông tin chứ không chỉ một con số, để màn hình giải thích được.
function autoGoalDetail(profile) {
  const tdee = calculateTDEE(profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel);
  if (!tdee) return null;

  const plan = buildCalorieGoal({
    tdee,
    gender: profile.gender,
    goal: profile.goal,
    weight: profile.weight,
    targetWeight: profile.targetWeight,
    weeklyRateKg: profile.weeklyRateKg,
  });
  const eta = estimateGoalDate({
    weight: profile.weight,
    targetWeight: profile.targetWeight,
    actualRateKg: plan.actualRateKg,
  });
  return { ...plan, eta };
}

// Bản rút gọn chỉ trả về con số, giữ nguyên cách gọi cũ của các controller.
function autoGoal(profile) {
  const detail = autoGoalDetail(profile);
  return detail ? detail.calorieGoal : null;
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  dailyDeltaFromRate,
  resolveWeightDirection,
  resolveWeightGoal,
  resolveRate,
  buildCalorieGoal,
  estimateGoalDate,
  autoGoalDetail,
  autoGoal,
};
