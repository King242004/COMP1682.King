// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra Coach giữ đúng ngôn ngữ người dùng trong mọi nhánh response.
// Câu mẫu Việt/Anh khóa cả nhánh nhận diện và sửa nội dung bị lẫn tiếng.
const { hasLanguageMismatch, mergeTextValues, normalizeCoachText, resolveRequestedLanguage, requestedLanguage, languageSwitchReply } = require("../../src/services/coach/coachLanguage");

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

  test("keeps the current language unless the user explicitly asks to switch", () => {
    expect(resolveRequestedLanguage("Please reply in Vietnamese", "en")).toBe("vi");
    expect(resolveRequestedLanguage("Tra loi bang tieng Anh", "vi")).toBe("en");
    expect(resolveRequestedLanguage("Bạn trả trả lời tôi bằng tiếng anh đc ko", "vi")).toBe("en");
    expect(resolveRequestedLanguage("What should I eat?", "vi")).toBe("vi");
    expect(requestedLanguage("Bạn trả lời bằng tiếng anh được không?")).toBe("en");
  });

  // Bốn kiểu nói này trước đây bị bỏ sót vì không có động từ đứng trước tên ngôn ngữ.
  test.each([
    ["English please", "en"],
    ["Tiếng Anh nhé", "en"],
    ["Can we do this in English?", "en"],
    ["Từ giờ tiếng Việt thôi", "vi"],
    ["English", "en"],
    ["Chuyển sang tiếng Anh nhé", "en"],
  ])("nhận ra yêu cầu đổi ngôn ngữ không có động từ dẫn: %s", (message, expected) => {
    expect(requestedLanguage(message)).toBe(expected);
  });

  // Tên ngôn ngữ đi kèm món ăn là câu hỏi về đồ ăn, không phải xin đổi tiếng.
  test.each([
    "I only eat Vietnamese food",
    "I want Vietnamese food for lunch",
    "Tôi thích món ăn Việt Nam",
    "Phở bò bao nhiêu calo?",
    "Món này tiếng Anh gọi là gì?",
  ])("không nhầm câu về món ăn thành yêu cầu đổi ngôn ngữ: %s", (message) => {
    expect(requestedLanguage(message)).toBeNull();
  });

  test("confirms a language switch in the language the user selected", () => {
    expect(languageSwitchReply("en")).toBe("Sure, I'll reply in English from now on.");
    expect(languageSwitchReply("vi")).toBe("Được, từ giờ mình sẽ trả lời bằng tiếng Việt.");
  });
});
