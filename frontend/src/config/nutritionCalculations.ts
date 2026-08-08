// ═══ FILE NÀY LÀM GÌ ═══
// Giữ các hằng số dinh dưỡng mà GIAO DIỆN cần để vẽ số lên màn hình.
//
// Ai gọi tới: Trang chủ, Tiến trình, Hồ sơ, màn Mục tiêu
// Nhận vào:   không nhận gì, đây là bảng số khai sẵn
// Trả ra:     các hằng số và hàm tính phụ
// Khi lỗi:    không có nhánh lỗi; calorieGoal.autoGoal là phép tính lưu chính thức
// Quy tắc giống backend/src/config/nutritionConstants.js: một hằng số phải có nguồn.
// Bản gốc của các hằng số này nằm ở backend/src/config/nutritionConstants.js.
// backend/src/services/nutrition/calorieGoal.js tính giá trị lưu chính thức;
// file này chỉ để màn hình vẽ được mục tiêu
// ngay khi vừa mở app, trước lúc hồ sơ kịp tải về. Sửa một bên thì phải sửa bên kia.
// Khi profileController trả sẵn mọi mục tiêu xem trước, có thể bỏ bản tính song song ở file này.

// Số kcal mà một gam mỗi chất sinh năng lượng tạo ra.
// Nguồn: hệ số Atwater tổng quát, FAO (2003), Food and Nutrition Paper 77.
// ══════════════════════════════════════════════════════════
// HẰNG SỐ VÀ CÔNG THỨC DINH DƯỠNG
//
// Không phải luồng. Một chỗ duy nhất giữ mọi hằng số và công thức của app,
// để không nơi nào gõ lại một con số rồi lệch với nơi khác.
//
// Nhớ: mấy hàm ở đây chỉ để XEM TRƯỚC trên màn. Con số chính thức luôn do
//      backend tính lại trong services/nutrition/calorieGoal.js, và có thể lệch
//      khi backend áp mức sàn calo.
// ══════════════════════════════════════════════════════════

export const ATWATER_KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

// Lượng đạm cần mỗi ngày, tính theo gam trên mỗi kg cân nặng.
// Nguồn: Jäger và cộng sự (2017), ISSN Position Stand, khuyến nghị 1.4 tới 2.0 g mỗi kg.
export const PROTEIN_G_PER_KG = 1.6;

// Tỷ lệ calo đến từ chất béo.
// Nguồn chính: Quyết định 2615/QĐ-BYT ngày 16/6/2016 của Bộ Y tế, "Nhu cầu dinh
// dưỡng khuyến nghị cho người Việt Nam", Viện Dinh dưỡng, mục 2.3: năng lượng từ
// lipid của người trưởng thành TỐI ĐA KHÔNG QUÁ 25 phần trăm tổng năng lượng.
// ĐỌC CHO ĐÚNG: theo nguồn Việt Nam thì 25 là TRẦN chứ không phải mức giữa, nên
// app đang đứng đúng ở mức trần. Vẫn hợp lệ vì tài liệu nói không quá 25, nhưng
// đừng mô tả đây là "chọn mức giữa cho an toàn".
// Nguồn phụ: AMDR trong bộ Dietary Reference Intakes cho khoảng 20 tới 35%,
// và 25 nằm giữa khoảng đó. Dùng nguồn Việt Nam làm chính vì app nhắm người Việt.
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

// Bản chính thức nằm ở backend/src/config/nutritionConstants.js. Frontend dùng các
// giới hạn này để báo lỗi sớm; profileController.updateProfile vẫn kiểm request.
// Phải khai đủ bốn trường như file nguồn. Màn nào cần kiểm khoảng giá trị thì đọc
// ở đây, đừng gõ tay lại con số để tránh hai bản lệch nhau.
// Có tests/profileLimits.test.ts khoá hai bên khớp nhau.
export const PROFILE_LIMITS = {
  age: { min: 10, max: 120 },
  weightKg: { min: 20, max: 300 },
  heightCm: { min: 50, max: 250 },
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

export type MacroTargets = {
  protein: number;
  carbs: number;
  fat: number;
};

// Hết phần khai báo ở trên. Từ đây trở xuống là các phép tính theo đúng luồng
// màn hình cần dùng: xác định hướng cân → ước tính năng lượng → chia mục tiêu macro.

// Chỉ dùng để xem trước; profileController.updateProfile gọi calorieGoal.autoGoal
// để quyết định giá trị được lưu.
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

// Chỉ dùng để XEM TRƯỚC trong lúc thiết lập.
// Con số lưu chính thức do backend/src/services/nutrition/calorieGoal.js tính.
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
  // Mức SÀN calo, khác nhau theo giới tính. Mọi nhánh bên dưới đều kẹp ở mức này,
  // nên giảm cân nhanh cỡ nào thì mục tiêu cũng không tụt xuống dưới sàn.
  const floor = gender === "male" ? CALORIE_FLOOR.male : CALORIE_FLOOR.female;
  if (goal === "lose_weight") {
    const rate = weeklyRateKg && weeklyRateKg > 0
      ? Math.min(weeklyRateKg, WEEKLY_RATE_KG.lose.max)
      : WEEKLY_RATE_KG.lose.default;
    // Đổi kg mỗi tuần ra kcal cần hụt mỗi NGÀY, nên chia cho 7.
    const delta = (rate * KCAL_PER_KG_BODY_WEIGHT) / 7;
    return Math.round(Math.max(floor, tdee - delta));
  }
  if (goal === "gain_weight") {
    const rate = weeklyRateKg && weeklyRateKg > 0
      ? Math.min(weeklyRateKg, WEEKLY_RATE_KG.gain.max)
      : WEEKLY_RATE_KG.gain.default;
    // Cùng cách tính với nhánh giảm cân, chỉ khác dấu: cộng thêm thay vì trừ đi.
    const delta = (rate * KCAL_PER_KG_BODY_WEIGHT) / 7;
    return Math.round(Math.max(floor, tdee + delta));
  }
  return Math.round(Math.max(floor, tdee));
}

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
  // Lấy số nhỏ hơn giữa đạm theo cân nặng và trần đạm theo calo.
  const proteinG = Math.min(rawProteinG, proteinCeilingG);

  // Chất béo lấy theo TỶ LỆ phần trăm calo, không neo vào cân nặng như đạm.
  const fatG = (goal * FAT_RATIO_OF_CALORIES) / ATWATER_KCAL_PER_GRAM.fat;

  // Tinh bột lấy phần calo CÒN LẠI, tính sau cùng chứ không đặt tỷ lệ riêng.
  // Nhờ vậy ba chất cộng lại luôn vừa khít mục tiêu calo, không dư không thiếu.
  const usedKcal = proteinG * ATWATER_KCAL_PER_GRAM.protein + fatG * ATWATER_KCAL_PER_GRAM.fat;
  // Kẹp ở 0 phòng khi đạm với béo đã ăn hết mục tiêu, tránh ra số âm.
  const carbsG = Math.max(0, (goal - usedKcal) / ATWATER_KCAL_PER_GRAM.carbs);

  return {
    protein: Math.round(proteinG),
    carbs: Math.round(carbsG),
    fat: Math.round(fatG),
  };
}
