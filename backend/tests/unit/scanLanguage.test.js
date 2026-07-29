const {
  hasLanguageMismatch,
  buildLanguageCorrectionPrompt,
  mergeLocalizedText,
} = require("../../src/services/scanLanguage");

describe("scan result language", () => {
  test("detects Vietnamese text in an English result", () => {
    const candidates = [
      { name: "Đậu hũ chiên sốt", portionDescription: "1 medium bowl" },
    ];

    expect(hasLanguageMismatch(candidates, "en")).toBe(true);
  });

  test("accepts an English result when English is requested", () => {
    const candidates = [
      { name: "Spicy Fried Tofu", portionDescription: "1 medium bowl" },
    ];

    expect(hasLanguageMismatch(candidates, "en")).toBe(false);
  });

  test("detects English text in a Vietnamese result", () => {
    const candidates = [
      { name: "Spicy Fried Tofu", portionDescription: "1 medium bowl" },
    ];

    expect(hasLanguageMismatch(candidates, "vi")).toBe(true);
  });

  test("replaces only text and preserves nutrition values", () => {
    const original = [{
      name: "Đậu hũ chiên sốt",
      portionDescription: "1 medium bowl",
      confidence: 0.85,
      calories: 450,
      protein: 25,
      carbs: 15,
      fat: 35,
    }];
    const localized = [{
      name: "Fried Tofu with Sauce",
      portionDescription: "1 medium bowl",
      confidence: 0.1,
      calories: 999,
      protein: 999,
      carbs: 999,
      fat: 999,
    }];

    expect(mergeLocalizedText(original, localized)).toEqual([{
      ...original[0],
      name: "Fried Tofu with Sauce",
      portionDescription: "1 medium bowl",
    }]);
    expect(buildLanguageCorrectionPrompt(original, "en")).toContain("natural English");
  });
});
