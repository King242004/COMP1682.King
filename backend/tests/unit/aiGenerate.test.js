const { generateWithFallback, withTimeout } = require("../../src/services/aiGenerate");

describe("AI fallback", () => {
  test("returns the first successful model result", async () => {
    const result = { response: { text: () => "ok" } };
    const models = [
      { generateContent: jest.fn().mockRejectedValue(new Error("quota")) },
      { __keyIndex: 1, generateContent: jest.fn().mockResolvedValue(result) },
    ];

    await expect(generateWithFallback(models, "prompt")).resolves.toBe(result);
    expect(result.aiQuotaLow).toBe(true);
  });

  test("throws the final model error when every fallback fails", async () => {
    const models = [
      { generateContent: jest.fn().mockRejectedValue(new Error("first")) },
      { generateContent: jest.fn().mockRejectedValue(new Error("last")) },
    ];
    await expect(generateWithFallback(models, "prompt")).rejects.toThrow("last");
  });

  test("withTimeout caps a stalled promise", async () => {
    await expect(withTimeout(new Promise(() => {}), 5)).rejects.toThrow("timed out");
  });
});
