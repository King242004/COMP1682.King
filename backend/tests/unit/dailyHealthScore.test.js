// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra công thức điểm sức khỏe và từng phần calo, đạm, tập, đều đặn.
// Test bảo đảm điểm số cố định ở server, không phụ thuộc câu trả lời Gemini.
const { computeHealthScore } = require("../../src/services/coach/dailyHealthScore");

function context({ eaten, burned, loggedDays = 7, eligibleDays = 7 }) {
  return {
    profile: { calorieGoal: 2000, weight: 70 },
    today: {
      totals: { calories: eaten, protein: 112 },
      totalBurned: burned,
    },
    week: { loggedDays, eligibleDays },
  };
}

describe("health score", () => {
  test("keeps intake scoring independent from exercise burn", () => {
    const withoutBurn = computeHealthScore(context({ eaten: 2600, burned: 0 }));
    const withBurn = computeHealthScore(context({ eaten: 2600, burned: 600 }));

    expect(withBurn.breakdown.calorie).toBe(withoutBurn.breakdown.calorie);
    expect(withBurn.breakdown.activity).toBeGreaterThan(withoutBurn.breakdown.activity);
  });

  test("does not award calorie points when no meal is logged", () => {
    const score = computeHealthScore(context({ eaten: 0, burned: 300 }));
    expect(score.breakdown.calorie).toBe(0);
  });

  // Điểm đều đặn chia cho số ngày tài khoản ĐÃ TỒN TẠI, không chia cứng cho 7.
  // Đòi dữ liệu của những ngày người dùng còn chưa cài app là phạt oan người mới.
  describe("consistency uses the days the account could have logged", () => {
    test("a two day old account that logged both days gets full marks", () => {
      const plan = computeHealthScore(context({ eaten: 2000, burned: 0, loggedDays: 2, eligibleDays: 2 }));
      expect(plan.breakdown.consistency).toBe(plan.weights.consistency);
    });

    test("a brand new account does not divide by zero", () => {
      const plan = computeHealthScore(context({ eaten: 2000, burned: 0, loggedDays: 1, eligibleDays: 0 }));
      expect(Number.isFinite(plan.breakdown.consistency)).toBe(true);
      expect(plan.breakdown.consistency).toBe(plan.weights.consistency);
    });

    test("a new account that skipped days is still marked down", () => {
      const plan = computeHealthScore(context({ eaten: 2000, burned: 0, loggedDays: 1, eligibleDays: 4 }));
      expect(plan.breakdown.consistency).toBe(Math.round(plan.weights.consistency / 4));
    });

    test("an established account is scored exactly as before", () => {
      const plan = computeHealthScore(context({ eaten: 2000, burned: 0, loggedDays: 3, eligibleDays: 7 }));
      expect(plan.breakdown.consistency).toBe(Math.round((plan.weights.consistency * 3) / 7));
    });

    test("consistency never exceeds its weight", () => {
      const plan = computeHealthScore(context({ eaten: 2000, burned: 0, loggedDays: 9, eligibleDays: 2 }));
      expect(plan.breakdown.consistency).toBe(plan.weights.consistency);
    });
  });
});
