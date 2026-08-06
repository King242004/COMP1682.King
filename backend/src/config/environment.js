// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm cấu hình trong .env TRƯỚC khi backend nhận request đầu tiên.
//
// Ai gọi tới: server.js, ngay lúc khởi động
// Nhận vào:   toàn bộ biến môi trường
// Trả ra:     danh sách cảnh báo, nếu có
// Khi lỗi:    thiếu biến BẮT BUỘC thì ném lỗi và server không khởi động.
//             Thiếu biến không bắt buộc thì chỉ ghi cảnh báo rồi chạy tiếp.
//
// Vì sao chia hai mức: thiếu chuỗi kết nối database thì chạy cũng vô nghĩa,
// nhưng thiếu khóa AI thì app vẫn dùng được phần nhật ký món và cân nặng.
//
// Kiểm tra biến môi trường trước khi backend nhận request.
// server.js gọi file này; lỗi bắt buộc sẽ dừng khởi động, cảnh báo chỉ được ghi log.
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_RELAY_URL",
  "EMAIL_RELAY_SECRET",
];

function validateEnvironment(env = process.env) {
  const errors = [];
  const warnings = [];

  for (const name of REQUIRED_ENV) {
    if (!String(env[name] || "").trim()) errors.push(`${name} is required.`);
  }

  const relayUrl = String(env.EMAIL_RELAY_URL || "").trim();
  if (relayUrl) {
    try {
      if (new URL(relayUrl).protocol !== "https:") errors.push("EMAIL_RELAY_URL must use HTTPS.");
    } catch {
      errors.push("EMAIL_RELAY_URL must be a valid URL.");
    }
  }

  if (String(env.EMAIL_RELAY_SECRET || "").length < 32) {
    errors.push("EMAIL_RELAY_SECRET must be at least 32 characters.");
  }

  const jwtSecret = String(env.JWT_SECRET || "");
  const otpSecret = String(env.OTP_SECRET || jwtSecret);
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push("JWT_SECRET should be at least 32 characters. Rotating it signs out existing sessions.");
  }
  if (otpSecret && otpSecret.length < 32) {
    warnings.push("OTP_SECRET should be at least 32 characters; it currently falls back to JWT_SECRET.");
  }

  const geminiKeys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3]
    .filter((value) => String(value || "").trim());
  // Không có khóa AI thì vẫn chạy được, nhưng Quét ảnh, Coach và Kế hoạch tuần sẽ báo lỗi.
  if (geminiKeys.length === 0) warnings.push("No Gemini API key is configured; AI features will be unavailable.");

  if (errors.length) throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  return { warnings };
}

module.exports = { validateEnvironment };
