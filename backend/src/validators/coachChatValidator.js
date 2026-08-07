// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm dữ liệu POST /coach/chat trước coachController.chat đọc lịch sử hoặc gọi AI.
//
// Ai gọi tới: coachController, ngay dòng đầu của hàm chat
// Nhận vào:   tin nhắn và ảnh người dùng gửi
// Trả ra:     dữ liệu đã sạch, hoặc một câu báo lỗi
// Khi lỗi:    tin quá dài hoặc ảnh quá nặng thì chặn ngay,
//             không gọi AI, nên không tốn lượt Gemini vô ích
// Tách riêng để coachController.chat chỉ lo phần gọi AI, và unit test có thể
// kiểm dữ liệu mà không cần khởi động backend/server.js.
const { LEGACY_LIMITS } = require("../config/inputLimits");

// Trần tin nhắn người dùng gửi trong một lượt.
const MAX_MESSAGE_CHARS = LEGACY_LIMITS.COACH_MESSAGE;
const MAX_IMAGE_BASE64_CHARS = 6_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function validateCoachChat(body = {}) {
  if (body.message != null && typeof body.message !== "string") {
    return { error: "Message must be text." };
  }
  if (body.image != null && typeof body.image !== "string") {
    return { error: "Image data is invalid." };
  }

  const message = String(body.message || "").trim();
  const image = String(body.image || "");
  const mimeType = String(body.mimeType || "image/jpeg").toLowerCase();

  if (!message && !image) return { error: "Message or image is required." };
  if (message.length > MAX_MESSAGE_CHARS) {
    return { error: `Message must be ${MAX_MESSAGE_CHARS} characters or fewer.` };
  }
  if (image.length > MAX_IMAGE_BASE64_CHARS) return { error: "Image is too large." };
  if (image && !ALLOWED_IMAGE_TYPES.has(mimeType)) return { error: "Unsupported image type." };

  const source = body.source === "community" ? "community" : null;
  const language = body.language === "vi" ? "vi" : "en";
  const localDate = String(body.localDate || "");
  const localHour = Number(body.localHour);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return { error: "Local date must be in format YYYY-MM-DD." };
  if (!Number.isInteger(localHour) || localHour < 0 || localHour > 23) return { error: "Local hour must be between 0 and 23." };

  return { value: { message, image, mimeType, source, language, localDate, localHour } };
}

module.exports = { validateCoachChat };
