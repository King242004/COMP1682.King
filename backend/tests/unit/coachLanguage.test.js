const { hasLanguageMismatch, mergeTextValues, normalizeCoachText } = require("../../src/services/coachLanguage");

describe("Coach response language", () => {
  test("detects Vietnamese in an English response", () => {
    expect(hasLanguageMismatch({ reply: "Bạn nên chọn sữa chua không đường nhé." }, "en")).toBe(true);
  });

  test("accepts an English response when English is requested", () => {
    expect(hasLanguageMismatch({ reply: "Choose unsweetened yogurt with fresh berries." }, "en")).toBe(false);
  });

  test("detects an English-only response when Vietnamese is requested", () => {
    expect(hasLanguageMismatch({ reply: "You should choose a healthy meal today." }, "vi")).toBe(true);
  });

  test("merges translated strings without changing numbers", () => {
    const original = { summary: "Xin chào", tips: ["Ăn đủ bữa"], score: 72 };
    const corrected = { summary: "Hello", tips: ["Eat regular meals"], score: 99 };
    expect(mergeTextValues(original, corrected)).toEqual({
      summary: "Hello",
      tips: ["Eat regular meals"],
      score: 72,
    });
  });

  test("normalizes mismatched text through the provided generator", async () => {
    const generate = jest.fn().mockResolvedValue({
      response: { text: () => JSON.stringify({ reply: "Choose unsweetened yogurt." }) },
    });
    await expect(normalizeCoachText({ reply: "Bạn nên chọn sữa chua." }, "en", generate))
      .resolves.toEqual({ reply: "Choose unsweetened yogurt." });
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
