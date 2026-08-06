// File này giữ các hằng số dinh dưỡng mà GIAO DIỆN cần để hiện số.
// Quy tắc giống bản backend: một hằng số phải đi kèm một dòng nói rõ nguồn.
// Bản gốc của các hằng số này nằm ở backend/src/config/nutritionConstants.js.
// Backend là nơi tính toán chính thức, file này chỉ để màn hình vẽ được mục tiêu
// ngay khi vừa mở app, trước lúc hồ sơ kịp tải về. Sửa một bên thì phải sửa bên kia.
// Hướng phát triển tiếp là để backend trả sẵn mọi mục tiêu và bỏ hẳn file này.

// Số kcal mà một gam mỗi chất sinh năng lượng tạo ra.
// Nguồn: hệ số Atwater tổng quát, FAO (2003), Food and Nutrition Paper 77.
export const ATWATER_KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

// Lượng đạm cần mỗi ngày, tính theo gam trên mỗi kg cân nặng.
// Nguồn: Jäger và cộng sự (2017), ISSN Position Stand, khuyến nghị 1.4 tới 2.0 g mỗi kg.
export const PROTEIN_G_PER_KG = 1.6;

// Tỷ lệ calo đến từ chất béo.
// Nguồn: AMDR trong bộ Dietary Reference Intakes, khoảng cho chất béo là 20 tới 35%.
export const FAT_RATIO_OF_CALORIES = 0.25;

// Trần tỷ lệ calo đến từ đạm, theo cùng bộ AMDR, khoảng cho đạm là 10 tới 35%.
export const PROTEIN_MAX_RATIO_OF_CALORIES = 0.35;

// Đường lùi khi chưa biết cân nặng, chỉ dùng cho mục tiêu đạm.
// Nguồn: cùng bộ AMDR, khoảng cho đạm là 10 tới 35% calo, lấy 25% nằm trong khoảng.
export const PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN = 0.25;

// Khoảng tốc độ đổi cân nặng cho người dùng chọn, tính bằng kg mỗi tuần.
// Nguồn: NHLBI (2000), NIH Pub. 00-4084. Trần 0.9 vì 1.0 kg mỗi tuần quy ra
// thiếu hụt 1.100 kcal mỗi ngày, vượt mức 1.000 kcal cao nhất tài liệu nêu.
// Không có mức tối thiểu: không tài liệu nào quy định phải giảm ít nhất bao nhiêu
// mỗi tuần, nên app chỉ chặn trần chứ không ép người muốn đi chậm phải đi nhanh.
export const WEEKLY_RATE_KG = {
  lose: { max: 0.9, default: 0.5 },
  gain: { max: 0.5, default: 0.25 },
};

// Hệ số của công thức tính năng lượng lúc nghỉ.
// Nguồn: Mifflin và cộng sự (1990), dùng đúng hệ số 9.99 và 4.92 trong bài báo gốc
// chứ không dùng bản làm tròn thành 10 và 5.
export const MIFFLIN_ST_JEOR = {
  weightFactor: 9.99, heightFactor: 6.25, ageFactor: 4.92, maleOffset: 5, femaleOffset: -161,
};

// Hệ số nhân theo mức vận động.
// Nguồn: FAO/WHO/UNU (2004) Human energy requirements. Ba con số này là giá trị
// đại diện do CHÍNH FAO tính ra trong Bảng 5.1, không phải dự án tự chọn.
// Ba khoảng phân loại tương ứng là 1.40 tới 1.69, 1.70 tới 1.99 và 2.00 tới 2.40.
// PAL đã tính cả tập luyện, nên không cộng thêm calo buổi tập vào mục tiêu.
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.53, moderate: 1.76, active: 2.25,
};
export const DEFAULT_ACTIVITY_LEVEL = "moderate";

export type WeightDirection = "lose" | "gain" | "maintain";
export const WEIGHT_GOAL_BY_DIRECTION = {
  lose: "lose_weight",
  gain: "gain_weight",
  maintain: "maintain_weight",
} as const;
export type WeightGoal = (typeof WEIGHT_GOAL_BY_DIRECTION)[WeightDirection];

// Chỉ dùng để xem trước trên giao diện. Backend vẫn là nơi quyết định chính thức.
// Nếu response cũ chưa có ngưỡng giữ cân, giao diện vẫn phân biệt được tăng/giảm
// thay vì chặn mọi cân mục tiêu.
export function resolveDraftWeightDirection(
  currentWeight: number | null,
  targetWeight: number | null,
  maintainThresholdKg?: number,
): WeightDirection | null {
  if (currentWeight == null || targetWeight == null || !Number.isFinite(targetWeight)) return null;
  const differenceKg = targetWeight - currentWeight;
  if (differenceKg === 0 || (maintainThresholdKg != null && Math.abs(differenceKg) < maintainThresholdKg)) {
    return "maintain";
  }
  return differenceKg < 0 ? "lose" : "gain";
}

// Bản chính thức nằm ở backend. Frontend chỉ dùng các giới hạn này để báo lỗi
// trước khi gửi, còn backend vẫn là nơi quyết định dữ liệu có hợp lệ hay không.
export const PROFILE_LIMITS = {
  weightKg: { min: 20, max: 300 },
  calorieGoal: { min: 800, max: 10000 },
} as const;

// Mức calo thấp nhất app cho phép đặt làm mục tiêu.
// Nguồn: NHLBI (2000), NIH Pub. 00-4084, nêu 1.000 tới 1.200 kcal cho nữ
// và 1.200 tới 1.600 kcal cho nam. Đây là giới hạn phạm vi của phần mềm,
// không phải tuyên bố y khoa rằng dưới mức này là không an toàn.
export const CALORIE_FLOOR = { male: 1500, female: 1200 };

// Số kcal ứng với một kg thay đổi cân nặng.
// Nguồn: Wishnofsky (1958). Giới hạn đã biết: Hall và Chow (2013) chỉ ra quy tắc
// này ước lượng quá cao khi áp cho dài hạn. App chỉ dùng nó để đặt mục tiêu ban đầu
// và tính lại mỗi lần người dùng ghi cân nặng mới.
export const KCAL_PER_KG_BODY_WEIGHT = 7700;

// Chỉ dùng để xem trước trong lúc thiết lập. Con số chính thức do backend tính.
export function estimateTDEE(
  weightKg: number, heightCm: number, age: number,
  gender: "male" | "female", activityLevel: string,
): number | null {
  if (!weightKg || !heightCm || !age || !gender) return null;
  const m = MIFFLIN_ST_JEOR;
  const offset = gender === "male" ? m.maleOffset : m.femaleOffset;
  const bmr = m.weightFactor * weightKg + m.heightFactor * heightCm - m.ageFactor * age + offset;
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS[DEFAULT_ACTIVITY_LEVEL]));
}

// Bản cũ trừ cứng 500 và cộng cứng 300. Nay cả hai đều suy ra từ tốc độ
// trong WEEKLY_RATE_KG, nên không còn độ lệch calo viết cứng trong màn hình.
export function estimateCalorieGoal(
  tdee: number | null,
  gender: "male" | "female",
  goal: string,
  weeklyRateKg?: number | null,
): number | null {
  if (!tdee) return null;
  const floor = gender === "male" ? CALORIE_FLOOR.male : CALORIE_FLOOR.female;
  if (goal === "lose_weight") {
    const rate = weeklyRateKg && weeklyRateKg > 0
      ? Math.min(weeklyRateKg, WEEKLY_RATE_KG.lose.max)
      : WEEKLY_RATE_KG.lose.default;
    const delta = (rate * KCAL_PER_KG_BODY_WEIGHT) / 7;
    return Math.round(Math.max(floor, tdee - delta));
  }
  if (goal === "gain_weight") {
    const rate = weeklyRateKg && weeklyRateKg > 0
      ? Math.min(weeklyRateKg, WEEKLY_RATE_KG.gain.max)
      : WEEKLY_RATE_KG.gain.default;
    const delta = (rate * KCAL_PER_KG_BODY_WEIGHT) / 7;
    return Math.round(Math.max(floor, tdee + delta));
  }
  return Math.round(Math.max(floor, tdee));
}

export type MacroTargets = {
  protein: number;
  carbs: number;
  fat: number;
};

// Bản cũ là macroGoals trong ui/theme.ts, chia cứng 30, 45 và 25 phần trăm
// cho mọi người. Ba tỷ lệ đó không có nguồn, và logic dinh dưỡng cũng không
// nên nằm trong file định nghĩa màu sắc.
export function macroTargets(calorieGoal: number | null | undefined, weightKg?: number | null): MacroTargets | null {
  const goal = Number(calorieGoal);
  if (!goal || goal <= 0) return null;

  const hasWeight = Number(weightKg) > 0;
  const rawProteinG = hasWeight
    ? Number(weightKg) * PROTEIN_G_PER_KG
    : (goal * PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN) / ATWATER_KCAL_PER_GRAM.protein;

  // Kẹp đạm ở trần AMDR, vì đạm neo vào cân nặng nên không tự co lại
  // khi mục tiêu calo bị mức sàn chặn.
  const proteinCeilingG = (goal * PROTEIN_MAX_RATIO_OF_CALORIES) / ATWATER_KCAL_PER_GRAM.protein;
  const proteinG = Math.min(rawProteinG, proteinCeilingG);

  const fatG = (goal * FAT_RATIO_OF_CALORIES) / ATWATER_KCAL_PER_GRAM.fat;

  const usedKcal = proteinG * ATWATER_KCAL_PER_GRAM.protein + fatG * ATWATER_KCAL_PER_GRAM.fat;
  const carbsG = Math.max(0, (goal - usedKcal) / ATWATER_KCAL_PER_GRAM.carbs);

  return {
    protein: Math.round(proteinG),
    carbs: Math.round(carbsG),
    fat: Math.round(fatG),
  };
}
