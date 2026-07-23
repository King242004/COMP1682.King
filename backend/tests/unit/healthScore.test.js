const { computeHealthScore } = require("../../src/services/healthScore");

function context({ eaten, burned }) {
  return {
    profile: { calorieGoal: 2000, weight: 70 },
    today: {
      totals: { calories: eaten, protein: 112 },
      totalBurned: burned,
    },
    week: { loggedDays: 7 },
  };
}

describe("health score", () => {
  test("uses net calories after exercise burn", () => {
    const withoutBurn = computeHealthScore(context({ eaten: 2600, burned: 0 }));
    const withBurn = computeHealthScore(context({ eaten: 2600, burned: 600 }));

    expect(withBurn.breakdown.calorie).toBe(40);
    expect(withBurn.score).toBeGreaterThan(withoutBurn.score);
  });

  test("does not award calorie points when no meal is logged", () => {
    const score = computeHealthScore(context({ eaten: 0, burned: 300 }));
    expect(score.breakdown.calorie).toBe(0);
  });
});
