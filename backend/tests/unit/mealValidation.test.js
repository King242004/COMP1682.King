// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra validator món chuẩn hóa tên, khẩu phần, dinh dưỡng và nguồn.
// Input sai bị chặn trước model; input đúng giữ đủ trường cần lưu.
const { validateMealInput, validateMealName, validateNutritionValues } = require("../../src/validators/mealInputValidator");

describe("validateMealInput", () => {
  test("normalizes a free-text portion without requiring grams", () => {
    const result = validateMealInput({
      name: "  Rice  ",
      mealType: "lunch",
      calories: 400,
      protein: 8,
      carbs: 88,
      fat: 1,
      portionText: "  2 bowls  ",
      nutritionSource: "ai_estimate",
      date: "2026-08-04",
    }, "user-id");

    expect(result.error).toBeUndefined();
    expect(result.value).toMatchObject({ name: "Rice", portionText: "2 bowls", portionAmount: null });
  });

  test("rejects invalid nutrition before any batch insert", () => {
    const result = validateMealInput({
      name: "Rice",
      mealType: "lunch",
      calories: -1,
      date: "2026-08-04",
    }, "user-id");

    expect(result.error).toBe("Enter a valid calorie amount.");
  });

  test("applies the same finite limits to meal updates", () => {
    expect(validateNutritionValues({ calories: 500, protein: Infinity }).error)
      .toBe("Enter valid macronutrient values.");
    expect(validateNutritionValues({ calories: 10_000 }).error)
      .toBe("Enter a valid calorie amount.");
  });

  test("rejects non-text or blank names on update", () => {
    expect(validateMealName(123).error).toBe("Enter a valid meal name.");
    expect(validateMealName("   ").error).toBe("Enter a valid meal name.");
  });
});
