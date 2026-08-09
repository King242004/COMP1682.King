// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra chọn bữa theo giờ, tìm món gần giống và tính đủ trường dinh dưỡng.
// Test khóa helper thuần dùng chung bởi màn Thêm/Sửa món.
import {
  hasAnyNutrition,
  hasCompleteNutrition,
  mealPortionLabel,
  mealSlotByHour,
  similarRecentMealName,
} from "@/features/meals/mealHelpers";
import fs from "fs";
import path from "path";

function backendMealTypeByHour(): (hour: number) => string {
  const source = fs.readFileSync(
    path.join(__dirname, "../../backend/src/controllers/coachController.js"),
    "utf8",
  );
  const start = source.indexOf("function mealTypeByHour(h) {");
  const body = source.slice(start, source.indexOf("\n}", start) + 2);
  const rules = [...body.matchAll(/if \(h < (\d+)\) return "(\w+)";/g)]
    .map((match) => ({ limit: Number(match[1]), slot: match[2] }));
  const fallback = body.match(/return "(\w+)";\s*\n\}/)?.[1];
  if (start === -1 || !rules.length || !fallback)
    throw new Error("Không đọc được mealTypeByHour bên backend");
  return (hour: number) => rules.find((rule) => hour < rule.limit)?.slot ?? fallback;
}

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

  const backend = backendMealTypeByHour();
  test.each(Array.from({ length: 24 }, (_, hour) => hour))(
    "matches the backend at hour %i",
    (hour) => expect(mealSlotByHour(hour)).toBe(backend(hour)),
  );
});

describe("mealPortionLabel", () => {
  test("prefers text and otherwise joins amount with unit", () => {
    expect(mealPortionLabel({ portionAmount: 250, portionUnit: "g", portionText: "1 tô vừa" }))
      .toBe("1 tô vừa");
    expect(mealPortionLabel({ portionAmount: 250, portionUnit: "g" })).toBe("250 g");
    expect(mealPortionLabel({})).toBe("");
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
