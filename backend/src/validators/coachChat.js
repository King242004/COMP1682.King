const MAX_MESSAGE_CHARS = 2000;
const MAX_IMAGE_BASE64_CHARS = 6_000_000;
const MAX_HISTORY_TURNS = 10;
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

  const history = Array.isArray(body.history)
    ? body.history.slice(-MAX_HISTORY_TURNS).map((item) => ({
        role: item?.role === "user" ? "user" : "coach",
        text: String(item?.text || "").slice(0, MAX_MESSAGE_CHARS),
      }))
    : [];

  return { value: { message, image, mimeType, history } };
}

module.exports = { validateCoachChat };
