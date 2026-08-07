// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra giới hạn và kiểu dữ liệu của tin nhắn, ảnh và nguồn gửi tới Coach.
// Input đúng được chuẩn hóa; input sai phải bị chặn đúng lý do.
const { validateCoachChat } = require("../../src/validators/coachChatValidator");

describe("validateCoachChat", () => {
  const local = { localDate: "2026-08-05", localHour: 19 };
  test("requires either text or an image", () => {
    expect(validateCoachChat(local).error).toBe("Message or image is required.");
  });

  test("normalizes text and ignores client-supplied history", () => {
    const history = Array.from({ length: 12 }, (_, index) => ({ role: "user", text: `turn-${index}` }));
    const result = validateCoachChat({ ...local, message: "  hello  ", history, source: "community", language: "vi" });
    expect(result.value.message).toBe("hello");
    expect(result.value.history).toBeUndefined();
    expect(result.value.source).toBe("community");
    expect(result.value.language).toBe("vi");
  });

  test("defaults unsupported or missing languages to English", () => {
    expect(validateCoachChat({ ...local, message: "hello" }).value.language).toBe("en");
    expect(validateCoachChat({ ...local, message: "hello", language: "fr" }).value.language).toBe("en");
  });

  test("rejects oversized text, images and unsupported MIME types", () => {
    expect(validateCoachChat({ ...local, message: "x".repeat(2001) }).error).toMatch(/2000/);
    expect(validateCoachChat({ ...local, image: "x".repeat(6_000_001) }).error).toBe("Image is too large.");
    expect(validateCoachChat({ ...local, image: "abc", mimeType: "image/svg+xml" }).error).toBe("Unsupported image type.");
  });

  test("rejects non-string payloads instead of throwing", () => {
    expect(validateCoachChat({ ...local, message: 123 }).error).toBe("Message must be text.");
    expect(validateCoachChat({ ...local, image: {} }).error).toBe("Image data is invalid.");
  });

  test("requires a valid client-local date and hour", () => {
    expect(validateCoachChat({ message: "hello", localHour: 9 }).error).toMatch(/Local date/);
    expect(validateCoachChat({ message: "hello", localDate: "2026-08-05", localHour: 24 }).error).toMatch(/Local hour/);
  });
});
