import {
  estimateCalorieGoal,
  resolveDraftWeightDirection,
  WEIGHT_GOAL_BY_DIRECTION,
} from "../src/config/nutritionCalculations";

describe("resolveDraftWeightDirection", () => {
  test("still previews gain and loss when an older API response has no maintain threshold", () => {
    expect(resolveDraftWeightDirection(60, 65)).toBe("gain");
    expect(resolveDraftWeightDirection(60, 55)).toBe("lose");
  });

  test("uses the backend threshold when it is available", () => {
    expect(resolveDraftWeightDirection(60, 60.2, 0.5)).toBe("maintain");
    expect(resolveDraftWeightDirection(55, 62, 0.5)).toBe("gain");
  });

  test("maps every UI direction to the stored profile goal", () => {
    expect(WEIGHT_GOAL_BY_DIRECTION).toEqual({
      lose: "lose_weight",
      gain: "gain_weight",
      maintain: "maintain_weight",
    });
  });
});

describe("estimateCalorieGoal", () => {
  test("uses the selected weekly pace instead of a fixed calorie offset", () => {
    expect(estimateCalorieGoal(2500, "male", "lose_weight", 0.25)).toBe(2225);
    expect(estimateCalorieGoal(2500, "male", "gain_weight", 0.5)).toBe(3050);
    expect(estimateCalorieGoal(2500, "male", "maintain_weight", 0.5)).toBe(2500);
  });
});
