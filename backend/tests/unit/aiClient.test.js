// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra aiClient thử model dự phòng theo thứ tự và chặn đúng thời gian chờ.
// Không gọi Gemini thật; test khóa kết quả hoặc lỗi cuối cùng được truyền ra.
// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra aiClient thử model dự phòng theo thứ tự và chặn đúng thời gian chờ.
// Không gọi Gemini thật; test khóa kết quả hoặc lỗi cuối cùng được truyền ra.
const { generateWithFallback, withTimeout } = require("../../src/services/aiClient");

describe("AI fallback", () => {
  test("returns the first successful model result", async () => {
    const result = { response: { text: () => "ok" } };
    const models = [
      { generateContent: jest.fn().mockRejectedValue(new Error("quota")) },
      { __keyIndex: 1, generateContent: jest.fn().mockResolvedValue(result) },
    ];

    await expect(generateWithFallback(models, "prompt")).resolves.toBe(result);
    expect(result).not.toHaveProperty("aiQuotaLow");
  });

  test("throws the final model error when every fallback fails", async () => {
    const models = [
      { generateContent: jest.fn().mockRejectedValue(new Error("first")) },
      { generateContent: jest.fn().mockRejectedValue(new Error("last")) },
    ];
    await expect(generateWithFallback(models, "prompt")).rejects.toThrow("last");
  });

  test("reports quota only when every fallback is quota-limited", async () => {
    const models = [
      { generateContent: jest.fn().mockRejectedValue(new Error("429 quota")) },
      { generateContent: jest.fn().mockRejectedValue(new Error("RESOURCE_EXHAUSTED")) },
    ];
    await expect(generateWithFallback(models, "prompt")).rejects.toThrow("AI_QUOTA_EXHAUSTED");
  });

  test("withTimeout caps a stalled promise", async () => {
    await expect(withTimeout(new Promise(() => {}), 5)).rejects.toThrow("timed out");
  });
});
// Tests AI timeout and model fallback behavior.
