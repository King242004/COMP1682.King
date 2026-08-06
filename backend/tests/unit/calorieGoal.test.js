const {
  calculateBMR, calculateTDEE, dailyDeltaFromRate, resolveWeightDirection, resolveWeightGoal, resolveRate,
  buildCalorieGoal, estimateGoalDate, autoGoal, autoGoalDetail,
} = require("../../src/services/nutrition/calorieGoal");
const {
  KCAL_PER_KG_BODY_WEIGHT, WEEKLY_RATE_KG, WEIGHT_RATE_OPTIONS, CALORIE_FLOOR, ACTIVITY_MULTIPLIERS,
  MAINTAIN_WEIGHT_THRESHOLD_KG,
} = require("../../src/config/nutritionConstants");

// Hệ số vận động dùng giá trị đại diện trong Bảng 5.1 của FAO/WHO/UNU (2004).
// Hệ số Mifflin dùng đúng bài báo gốc là 9.99 và 4.92, không dùng bản làm tròn.
// Trước 4/8/2026 app dùng bộ 1.2, 1.55 và 1.725 không có nguồn, nên các con số
// kỳ vọng dưới đây đã đổi theo. Phương trình Mifflin thì không đổi.
describe("calculateTDEE (Mifflin-St Jeor + FAO PAL)", () => {
  test("male 70kg 175cm 25y moderate = 2948", () => {
    expect(calculateTDEE(70, 175, 25, "male", "moderate")).toBe(2948);
  });

  test("female 45kg 150cm 25y sedentary = 1688", () => {
    expect(calculateTDEE(45, 150, 25, "female", "sedentary")).toBe(1688);
  });

  test("unknown activity level falls back to moderate multiplier", () => {
    expect(calculateTDEE(70, 175, 25, "male", "whatever")).toBe(2948);
  });

  // Mọi hệ số phải nằm trong khoảng PAL mà FAO công bố, nếu không thì
  // trích dẫn FAO không còn đỡ được con số nữa.
  test("every multiplier sits inside its published FAO PAL band", () => {
    const bands = {
      sedentary: [1.40, 1.69],
      moderate: [1.70, 1.99],
      active: [2.00, 2.40],
    };
    for (const [level, [lo, hi]] of Object.entries(bands)) {
      const m = ACTIVITY_MULTIPLIERS[level];
      expect(m).toBeGreaterThanOrEqual(lo);
      expect(m).toBeLessThanOrEqual(hi);
    }
  });

  // BMR là phần nền, TDEE bằng BMR nhân hệ số vận động. Test này khoá
  // quan hệ đó lại để hai hàm không bao giờ trôi lệch nhau.
  test("TDEE is exactly BMR multiplied by the activity factor", () => {
    const bmr = calculateBMR(70, 175, 25, "male");
    expect(Math.round(bmr)).toBe(1675);
    expect(calculateTDEE(70, 175, 25, "male", "moderate"))
      .toBe(Math.round(bmr * ACTIVITY_MULTIPLIERS.moderate));
  });

  test("returns null when any body metric is missing", () => {
    expect(calculateTDEE(null, 175, 25, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, null, 25, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, 175, null, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, 175, 25, null, "moderate")).toBeNull();
  });
});

describe("dailyDeltaFromRate (rate replaces the old hardcoded 500 and 300)", () => {
  test("0.5 kg per week becomes 550 kcal per day", () => {
    expect(Math.round(dailyDeltaFromRate(0.5))).toBe(550);
  });

  test("delta scales linearly with the rate", () => {
    expect(dailyDeltaFromRate(1)).toBeCloseTo((1 * KCAL_PER_KG_BODY_WEIGHT) / 7);
    expect(dailyDeltaFromRate(0)).toBe(0);
  });
});

describe("resolveWeightDirection (target weight wins over the goal dropdown)", () => {
  test("target below current weight means losing", () => {
    expect(resolveWeightDirection({ goal: "gain_weight", currentWeight: 70, targetWeight: 65 })).toBe("lose");
  });

  test("target above current weight means gaining", () => {
    expect(resolveWeightDirection({ goal: "lose_weight", currentWeight: 60, targetWeight: 65 })).toBe("gain");
  });

  test("a gap under half a kg counts as maintaining", () => {
    expect(resolveWeightDirection({ goal: "lose_weight", currentWeight: 70, targetWeight: 69.8 })).toBe("maintain");
  });

  test("the half-kilogram boundary still has a direction", () => {
    expect(resolveWeightDirection({ currentWeight: 70, targetWeight: 70 - MAINTAIN_WEIGHT_THRESHOLD_KG })).toBe("lose");
    expect(resolveWeightDirection({ currentWeight: 70, targetWeight: 70 + MAINTAIN_WEIGHT_THRESHOLD_KG })).toBe("gain");
  });

  test("maps the direction to the stored profile goal", () => {
    expect(resolveWeightGoal({ currentWeight: 55, targetWeight: 62 })).toBe("gain_weight");
    expect(resolveWeightGoal({ currentWeight: 70, targetWeight: 65 })).toBe("lose_weight");
    expect(resolveWeightGoal({ currentWeight: 70, targetWeight: 70.2 })).toBe("maintain_weight");
  });

  test("falls back to the goal field when there is no target weight", () => {
    expect(resolveWeightDirection({ goal: "lose_weight" })).toBe("lose");
    expect(resolveWeightDirection({ goal: "gain_weight" })).toBe("gain");
    expect(resolveWeightDirection({ goal: "maintain_weight" })).toBe("maintain");
  });
});

describe("resolveRate (clamped into the allowed band)", () => {
  test("every displayed rate option stays inside its backend limit", () => {
    for (const direction of ["lose", "gain"]) {
      const values = WEIGHT_RATE_OPTIONS[direction].map((option) => option.value);
      expect(new Set(values).size).toBe(values.length);
      expect(values.every((value) => value > 0 && value <= WEEKLY_RATE_KG[direction].max)).toBe(true);
    }
  });

  test("uses the default rate when the user has not chosen one", () => {
    expect(resolveRate("lose", null)).toBe(WEEKLY_RATE_KG.lose.default);
    expect(resolveRate("gain", null)).toBe(WEEKLY_RATE_KG.gain.default);
  });

  test("clamps a rate that is too fast down to the band maximum", () => {
    expect(resolveRate("lose", 5)).toBe(WEEKLY_RATE_KG.lose.max);
    expect(resolveRate("gain", 5)).toBe(WEEKLY_RATE_KG.gain.max);
  });

  // NHLBI (2000) nêu mức thiếu hụt cao nhất là 1.000 kcal mỗi ngày.
  // Trần cũ 1.0 kg mỗi tuần quy ra 1.100 kcal nên đã vượt, nay hạ xuống 0.9.
  test("the fastest allowed rate stays within the 1000 kcal daily deficit", () => {
    const fastest = resolveRate("lose", 99);
    expect(Math.round(dailyDeltaFromRate(fastest))).toBeLessThanOrEqual(1000);
  });

  // Không có mức tối thiểu. Người muốn đi chậm phải được đi chậm, vì không tài
  // liệu nào quy định tốc độ giảm tối thiểu và kẹp ngược lên là ép họ đi nhanh hơn.
  test.each([0.15, 0.1, 0.05])("keeps a slow rate exactly as asked: %s kg per week", (asked) => {
    expect(resolveRate("lose", asked)).toBe(asked);
    expect(resolveRate("gain", asked)).toBe(asked);
  });

  test("the rate band no longer carries a minimum", () => {
    expect(WEEKLY_RATE_KG.lose.min).toBeUndefined();
    expect(WEEKLY_RATE_KG.gain.min).toBeUndefined();
  });

  test("a slower rate really does mean eating more", () => {
    const profile = { tdee: 3089, gender: "male", goal: "lose_weight", weight: 78, targetWeight: 70 };
    const slow = buildCalorieGoal({ ...profile, weeklyRateKg: 0.15 });
    const normal = buildCalorieGoal({ ...profile, weeklyRateKg: 0.5 });
    expect(slow.requestedRateKg).toBe(0.15);
    expect(slow.calorieGoal).toBeGreaterThan(normal.calorieGoal);
  });

  test("maintaining always means a zero rate", () => {
    expect(resolveRate("maintain", 1)).toBe(0);
  });
});

describe("buildCalorieGoal", () => {
  test("losing at the default rate subtracts 550 from TDEE", () => {
    const plan = buildCalorieGoal({ tdee: 2594, gender: "male", goal: "lose_weight" });
    expect(plan.calorieGoal).toBe(2044);
    expect(plan.direction).toBe("lose");
    expect(plan.floorApplied).toBe(false);
  });

  test("gaining at the default rate adds to TDEE", () => {
    const plan = buildCalorieGoal({ tdee: 2000, gender: "male", goal: "gain_weight" });
    expect(plan.calorieGoal).toBe(2000 + Math.round(dailyDeltaFromRate(WEEKLY_RATE_KG.gain.default)));
  });

  test("maintaining keeps TDEE unchanged", () => {
    const plan = buildCalorieGoal({ tdee: 2100, gender: "female", goal: "maintain_weight" });
    expect(plan.calorieGoal).toBe(2100);
    expect(plan.actualRateKg).toBe(0);
  });

  test("a faster rate produces a lower goal", () => {
    const slow = buildCalorieGoal({ tdee: 2594, gender: "male", goal: "lose_weight", weeklyRateKg: 0.25 });
    const fast = buildCalorieGoal({ tdee: 2594, gender: "male", goal: "lose_weight", weeklyRateKg: 1 });
    expect(fast.calorieGoal).toBeLessThan(slow.calorieGoal);
  });

  // Đây là hành vi quan trọng nhất của file: bản cũ chặn sàn rồi im lặng,
  // nên giao diện vẫn hiện tốc độ người dùng chọn dù nó không còn đúng.
  test("reports the real rate when the safety floor takes over", () => {
    const plan = buildCalorieGoal({ tdee: 1322, gender: "female", goal: "lose_weight", weeklyRateKg: 1 });
    expect(plan.calorieGoal).toBe(CALORIE_FLOOR.female);
    expect(plan.floorApplied).toBe(true);
    // Yêu cầu 1 kg bị kẹp về trần 0.9 trước khi tính.
    expect(plan.requestedRateKg).toBe(WEEKLY_RATE_KG.lose.max);
    // Chỉ còn 122 kcal thâm hụt mỗi ngày nên tốc độ thật thấp hơn hẳn mức đã chọn.
    expect(plan.actualRateKg).toBeLessThan(plan.requestedRateKg);
    expect(plan.actualRateKg).toBeCloseTo(0.11, 2);
  });

  test("men get the higher safety floor", () => {
    const plan = buildCalorieGoal({ tdee: 1900, gender: "male", goal: "lose_weight", weeklyRateKg: 1 });
    expect(plan.calorieGoal).toBe(CALORIE_FLOOR.male);
    expect(plan.floorApplied).toBe(true);
  });

  test("returns null without a TDEE", () => {
    expect(buildCalorieGoal({ tdee: null, gender: "male", goal: "lose_weight" })).toBeNull();
  });
});

describe("estimateGoalDate", () => {
  test("5 kg at 0.5 kg per week takes 70 days", () => {
    const eta = estimateGoalDate({
      weight: 70, targetWeight: 65, actualRateKg: 0.5, from: new Date("2026-08-04T00:00:00"),
    });
    expect(eta.days).toBe(70);
    expect(eta.date).toBe("2026-10-13");
    expect(eta.remainingKg).toBe(5);
  });

  test("works the same when gaining weight", () => {
    const eta = estimateGoalDate({
      weight: 60, targetWeight: 62, actualRateKg: 0.25, from: new Date("2026-08-04T00:00:00"),
    });
    expect(eta.days).toBe(56);
  });

  test("returns null when already at the target or missing data", () => {
    expect(estimateGoalDate({ weight: 70, targetWeight: 70, actualRateKg: 0.5 })).toBeNull();
    expect(estimateGoalDate({ weight: 70, targetWeight: null, actualRateKg: 0.5 })).toBeNull();
    expect(estimateGoalDate({ weight: 70, targetWeight: 65, actualRateKg: 0 })).toBeNull();
  });
});

describe("autoGoal and autoGoalDetail (end to end from a user-like object)", () => {
  test("computes the full auto goal", () => {
    // TDEE 2948 trừ 550 kcal của tốc độ mặc định 0.5 kg mỗi tuần.
    expect(
      autoGoal({ weight: 70, height: 175, age: 25, gender: "male", activityLevel: "moderate", goal: "lose_weight" })
    ).toBe(2398);
  });

  test("target weight drives the direction even when the goal field disagrees", () => {
    const detail = autoGoalDetail({
      weight: 60, height: 175, age: 25, gender: "male", activityLevel: "moderate",
      goal: "lose_weight", targetWeight: 68,
    });
    expect(detail.direction).toBe("gain");
    expect(detail.calorieGoal).toBeGreaterThan(detail.tdee);
  });

  test("detail carries an estimated finish date when a target weight is set", () => {
    const detail = autoGoalDetail({
      weight: 70, height: 175, age: 25, gender: "male", activityLevel: "moderate",
      goal: "lose_weight", targetWeight: 65, weeklyRateKg: 0.5,
    });
    expect(detail.eta).not.toBeNull();
    expect(detail.eta.remainingKg).toBe(5);
  });

  test("returns null when metrics are incomplete", () => {
    expect(autoGoal({ weight: 70 })).toBeNull();
    expect(autoGoal({})).toBeNull();
    expect(autoGoalDetail({})).toBeNull();
  });
});
