// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra chọn bữa theo giờ, tìm món gần giống và tính đủ trường dinh dưỡng.
// Test khóa helper thuần dùng chung bởi màn Thêm/Sửa món.
import {
  hasAnyNutrition,
  hasCompleteNutrition,
  mealSlotByHour,
  similarRecentMealName,
} from "@/features/meals/mealHelpers";

describe("mealSlotByHour", () => {
  test.each([
    [0, "breakfast"],
    [10, "breakfast"],
    [11, "lunch"],
    [13, "lunch"],
    [14, "snack"],
    [16, "snack"],
    [17, "dinner"],
    [20, "dinner"],
    [21, "snack"],
    [23, "snack"],
  ])("maps hour %i to %s", (hour, expected) => {
    expect(mealSlotByHour(hour)).toBe(expected);
  });
});

describe("similarRecentMealName", () => {
  const recent = [
    { name: "Cơm gà xối mỡ" },
    { name: "Bún bò Huế" },
  ];

  test("suggests a recent name for a small typo or missing accents", () => {
    expect(similarRecentMealName("com ga xoi mo", recent)?.name).toBe("Cơm gà xối mỡ");
    expect(similarRecentMealName("cơm gà xối mơ", recent)?.name).toBe("Cơm gà xối mỡ");
  });

  test("does not suggest for an exact or unrelated name", () => {
    expect(similarRecentMealName("Cơm gà xối mỡ", recent)).toBeUndefined();
    expect(similarRecentMealName("Phở bò tái", recent)).toBeUndefined();
  });
});

describe("nutrition completeness", () => {
  test("ignores non-nutrition fields on an Add Meal draft", () => {
    const draft = {
      calories: "450",
      protein: "20",
      carbs: "60",
      fat: "10",
      showNutritionFields: false,
    };

    expect(hasCompleteNutrition(draft)).toBe(true);
    expect(hasAnyNutrition(draft)).toBe(true);
  });

  test("requires positive calories and all three non-negative macros", () => {
    expect(hasCompleteNutrition({ calories: "450", protein: "20", carbs: "60", fat: "10" })).toBe(true);
    expect(hasCompleteNutrition({ calories: "0", protein: "20", carbs: "60", fat: "10" })).toBe(false);
    expect(hasCompleteNutrition({ calories: "450", protein: "", carbs: "60", fat: "10" })).toBe(false);
    expect(hasAnyNutrition({ calories: "", protein: "", carbs: "1", fat: "" })).toBe(true);
  });
});
// Tests meal timing and matching helpers.
