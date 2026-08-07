// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra ước tính dinh dưỡng, cache và chuẩn hóa kết quả AI theo khẩu phần.
// Gemini/model được mock để khóa phép biến đổi và nhánh lỗi mà không gọi mạng.
const {
  buildNutritionEstimatePrompt,
  normalizeEstimatedNutrition,
  nutritionEstimateKey,
} = require("../../src/services/nutrition/nutritionEstimator");

describe("nutritionEstimator", () => {
  const requestedItems = [
    { name: "Rice", portion: "2 bowls", details: "" },
    { name: "Stir-fried pork", portion: "half a plate", details: "less oil" },
  ];

  test("builds one prompt from every user supplied meal item", () => {
    const prompt = buildNutritionEstimatePrompt({ items: requestedItems, language: "en" });

    expect(prompt).toContain('"name":"Rice"');
    expect(prompt).toContain('"portion":"2 bowls"');
    expect(prompt).toContain('"name":"Stir-fried pork"');
    expect(prompt).toContain('"details":"less oil"');
    expect(prompt).toContain("same number of items in the same order");
  });

  test("rounds every item and computes totals from the normalized values", () => {
    expect(normalizeEstimatedNutrition({
      items: [
        { calories: 401.6, protein: 8.26, carbs: 89.04, fat: 1.05, portionDescription: "Two bowls." },
        { calories: 299.4, protein: 24.04, carbs: 10.06, fat: 17.95, portionDescription: "Half a plate." },
      ],
    }, requestedItems)).toEqual({
      items: [
        { name: "Rice", portion: "2 bowls", calories: 402, protein: 8.3, carbs: 89, fat: 1.1, portionDescription: "Two bowls." },
        { name: "Stir-fried pork", portion: "half a plate", calories: 299, protein: 24, carbs: 10.1, fat: 18, portionDescription: "Half a plate." },
      ],
      totals: { calories: 701, protein: 32.3, carbs: 99.1, fat: 19.1 },
    });
  });

  test("keeps a complete description instead of cutting it mid-sentence", () => {
    const description = "This complete explanation is intentionally longer than one hundred and sixty characters so the app can show the AI assumptions without stopping halfway through a word or sentence for the user.";
    const estimate = normalizeEstimatedNutrition({
      items: [{ calories: 500, protein: 20, carbs: 60, fat: 15, portionDescription: description }],
    }, [requestedItems[0]]);

    expect(estimate.items[0].portionDescription).toBe(description);
  });

  test("rejects missing, extra or invalid item estimates", () => {
    expect(() => normalizeEstimatedNutrition({ items: [] }, requestedItems)).toThrow("Invalid nutrition estimate");
    expect(() => normalizeEstimatedNutrition({
      items: [{ calories: 0, protein: 1, carbs: 1, fat: 1 }],
    }, [requestedItems[0]])).toThrow("Invalid nutrition estimate");
  });

  test("uses the same cache key for harmless casing and spacing changes", () => {
    const first = nutritionEstimateKey({
      language: "vi",
      items: [{ name: " Cơm  gà xối mỡ ", portion: "2 tô", details: "Ít dầu" }],
    });
    const second = nutritionEstimateKey({
      language: "vi",
      items: [{ name: "cơm gà xối mỡ", portion: "2 TÔ", details: " ít  dầu " }],
    });

    expect(first).toBe(second);
  });

  test("uses a different cache key when the consumed portion changes", () => {
    const oneBowl = nutritionEstimateKey({
      language: "vi",
      items: [{ name: "Cơm gà xối mỡ", portion: "1 tô", details: "" }],
    });
    const twoBowls = nutritionEstimateKey({
      language: "vi",
      items: [{ name: "Cơm gà xối mỡ", portion: "2 tô", details: "" }],
    });

    expect(oneBowl).not.toBe(twoBowls);
  });
});
