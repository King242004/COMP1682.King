// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm cấu hình trong .env trước khi server.js gọi app.listen.
//
// Ai gọi tới: server.js, ngay lúc khởi động
// Nhận vào:   toàn bộ biến môi trường
// Trả ra:     danh sách cảnh báo, nếu có
// Khi lỗi:    thiếu biến BẮT BUỘC thì ném lỗi và server không khởi động.
//             Thiếu biến không bắt buộc thì chỉ ghi cảnh báo rồi chạy tiếp.
//
// Vì sao chia hai mức: thiếu chuỗi kết nối database thì chạy cũng vô nghĩa,
// nhưng thiếu khóa AI thì app vẫn dùng được phần nhật ký món và cân nặng.

// ══════════════════════════════════════════════════════════
// KIỂM CẤU HÌNH LÚC KHỞI ĐỘNG
//
// Đến từ server.js, chạy TRƯỚC app.listen. Năm bước, đọc từ trên xuống
// là đúng thứ tự. Không gọi mạng, không đụng database.
// Xong thì server.js in cảnh báo rồi mới mở cổng.
// ══════════════════════════════════════════════════════════

// Bảy biến BẮT BUỘC. Thiếu một cái là server không khởi động.
// Đây đều là thứ mà thiếu nó thì app chạy cũng vô nghĩa.
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_RELAY_URL",
  "EMAIL_RELAY_SECRET",
];

// KIỂM CẤU HÌNH BƯỚC 1. Gom lỗi vào hai giỏ riêng.
// errors làm server chết, warnings chỉ in ra rồi chạy tiếp.
function validateEnvironment(env = process.env) {
  // Giỏ lỗi nặng, có cái nào là server chết ở BƯỚC 5.
  const errors = [];
  // Giỏ cảnh báo, chỉ in ra rồi chạy tiếp.
  const warnings = [];

  // KIỂM CẤU HÌNH BƯỚC 2. Bảy biến bắt buộc, thiếu cái nào ghi cái đó.
  // Gom hết rồi mới ném ở BƯỚC 5, để báo một lần đủ cả, đừng bắt sửa từng cái một.
  for (const name of REQUIRED_ENV) {
    if (!String(env[name] || "").trim()) errors.push(`${name} is required.`);
  }

  // KIỂM CẤU HÌNH BƯỚC 3. Địa chỉ email relay phải là HTTPS.
  // Bắt buộc vì mình gửi mã 6 số qua đó, đi HTTP là ai cũng đọc được trên đường.
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

  // KIỂM CẤU HÌNH BƯỚC 4. Kiểm độ dài mấy khóa bí mật.
  // Hai cái này chỉ CẢNH BÁO chứ không chặn, vì khóa ngắn vẫn chạy được,
  // chỉ là dễ bị dò hơn. Đổi JWT_SECRET là mọi người đang đăng nhập bị đá ra hết.
  const jwtSecret = String(env.JWT_SECRET || "");
  const otpSecret = String(env.OTP_SECRET || jwtSecret);
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push("JWT_SECRET should be at least 32 characters. Rotating it signs out existing sessions.");
  }
  if (otpSecret && otpSecret.length < 32) {
    warnings.push("OTP_SECRET should be at least 32 characters; it currently falls back to JWT_SECRET.");
  }

  // KIỂM CẤU HÌNH BƯỚC 4b. Khóa AI chỉ cảnh báo, KHÔNG chặn.
  // Thiếu khóa thì Quét ảnh, Coach và Kế hoạch tuần báo lỗi,
  // nhưng nhật ký món với cân nặng vẫn dùng bình thường.
  const geminiKeys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3]
    .filter((value) => String(value || "").trim());
  // Không có khóa AI thì vẫn chạy được, nhưng Quét ảnh, Coach và Kế hoạch tuần sẽ báo lỗi.
  if (geminiKeys.length === 0) warnings.push("No Gemini API key is configured; AI features will be unavailable.");

  // KIỂM CẤU HÌNH BƯỚC 5. Có lỗi thì ném, server chết tại đây.
  // Không lỗi thì trả danh sách cảnh báo cho server.js in ra.
  if (errors.length) throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  return { warnings };
}

module.exports = { validateEnvironment };
