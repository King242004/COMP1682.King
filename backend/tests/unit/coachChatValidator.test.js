const { validateCoachChat } = require("../../src/validators/coachChat");

describe("validateCoachChat", () => {
  test("requires either text or an image", () => {
    expect(validateCoachChat({}).error).toBe("Message or image is required.");
  });

  test("normalizes text and keeps only the latest ten history turns", () => {
    const history = Array.from({ length: 12 }, (_, index) => ({ role: "user", text: `turn-${index}` }));
    const result = validateCoachChat({ message: "  hello  ", history });
    expect(result.value.message).toBe("hello");
    expect(result.value.history).toHaveLength(10);
    expect(result.value.history[0].text).toBe("turn-2");
  });

  test("rejects oversized text, images and unsupported MIME types", () => {
    expect(validateCoachChat({ message: "x".repeat(2001) }).error).toMatch(/2000/);
    expect(validateCoachChat({ image: "x".repeat(6_000_001) }).error).toBe("Image is too large.");
    expect(validateCoachChat({ image: "abc", mimeType: "image/svg+xml" }).error).toBe("Unsupported image type.");
  });

  test("rejects non-string payloads instead of throwing", () => {
    expect(validateCoachChat({ message: 123 }).error).toBe("Message must be text.");
    expect(validateCoachChat({ image: {} }).error).toBe("Image data is invalid.");
  });
});
