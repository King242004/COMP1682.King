// Unit tests: TDEE math + auto calorie goal (safety floors) — pure functions.
const { calculateTDEE, goalFromTDEE, autoGoal } = require("../../src/services/calorieGoal");

describe("calculateTDEE (Mifflin-St Jeor)", () => {
  test("male 70kg 175cm 25y moderate = 2594", () => {
    expect(calculateTDEE(70, 175, 25, "male", "moderate")).toBe(2594);
  });

  test("female 45kg 150cm 25y sedentary = 1322", () => {
    expect(calculateTDEE(45, 150, 25, "female", "sedentary")).toBe(1322);
  });

  test("unknown activity level falls back to moderate multiplier", () => {
    expect(calculateTDEE(70, 175, 25, "male", "whatever")).toBe(2594);
  });

  test("returns null when any body metric is missing", () => {
    expect(calculateTDEE(null, 175, 25, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, null, 25, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, 175, null, "male", "moderate")).toBeNull();
    expect(calculateTDEE(70, 175, 25, null, "moderate")).toBeNull();
  });
});

describe("goalFromTDEE (goal adjustment + safety floor)", () => {
  test("lose_weight subtracts 500", () => {
    expect(goalFromTDEE(2594, "lose_weight", "male")).toBe(2094);
  });

  test("gain_muscle adds 300", () => {
    expect(goalFromTDEE(2000, "gain_muscle", "male")).toBe(2300);
  });

  test("eat_healthy keeps TDEE", () => {
    expect(goalFromTDEE(2100, "eat_healthy", "female")).toBe(2100);
  });

  test("safety floor 1200 kcal for women (small person cutting)", () => {
    // 1322 - 500 = 822 → clamped to 1200
    expect(goalFromTDEE(1322, "lose_weight", "female")).toBe(1200);
  });

  test("safety floor 1500 kcal for men", () => {
    // 1900 - 500 = 1400 → clamped to 1500
    expect(goalFromTDEE(1900, "lose_weight", "male")).toBe(1500);
  });
});

describe("autoGoal (end to end from a user-like object)", () => {
  test("computes the full auto goal", () => {
    expect(
      autoGoal({ weight: 70, height: 175, age: 25, gender: "male", activityLevel: "moderate", goal: "lose_weight" })
    ).toBe(2094);
  });

  test("returns null when metrics are incomplete", () => {
    expect(autoGoal({ weight: 70 })).toBeNull();
    expect(autoGoal({})).toBeNull();
  });
});
