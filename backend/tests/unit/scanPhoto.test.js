// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra scan ảnh đổi lỗi hết quota AI thành HTTP 429 với mã QUOTA.
// Gemini và Cloudinary được mock để khóa contract ScanScreen đang đọc.
jest.mock("../../src/config/geminiModels", () => ({
  visionModels: ["vision-model"],
  nutritionModels: ["nutrition-model"],
}));

jest.mock("../../src/services/aiClient", () => ({ generateWithFallback: jest.fn() }));

const { generateWithFallback } = require("../../src/services/aiClient");
const { scanPhoto } = require("../../src/controllers/scanController");

function response() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

test("photo scan reports exhausted AI quota as 429", async () => {
  generateWithFallback.mockRejectedValue(new Error("AI_QUOTA_EXHAUSTED"));
  const req = {
    body: { language: "en" },
    file: { buffer: Buffer.from("image"), mimetype: "image/jpeg" },
  };
  const res = response();

  await scanPhoto(req, res);

  expect(res.status).toHaveBeenCalledWith(429);
  expect(res.json).toHaveBeenCalledWith({ message: "AI quota exhausted.", code: "QUOTA" });
});
