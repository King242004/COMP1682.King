// ═══ FILE NÀY LÀM GÌ ═══
// Chứa các quy tắc an toàn cho mã xác minh 6 số, và các con số cấu hình.
//
// Ai gọi tới: otpService, authController, accountController
// Nhận vào:   mã người dùng gõ, và mã đã băm lưu trong database
// Trả ra:     mã mới sinh ra, mã đã băm, hoặc kết quả so khớp đúng sai
// Khi lỗi:    không có nhánh lỗi, đây chỉ là các hàm tính toán thuần
//
// Ba điểm an toàn hay bị hỏi khi bảo vệ:
//   randomInt sinh số ngẫu nhiên an toàn, không dùng Math.random.
//   Mã lưu xuống database ở dạng đã băm, không lưu số gốc.
//   timingSafeEqual so khớp mất thời gian như nhau dù đúng hay sai,
//     nên kẻ tấn công không đoán được mã qua tốc độ trả lời.
const { createHmac, randomInt, timingSafeEqual } = require("crypto");

// Bốn con số cấu hình cho mã xác minh:
// Bốn con số cấu hình: mã sống 10 phút, sai tối đa 5 lần,
// chờ 1 phút giữa hai lần gửi, và mọi phản hồi mất ít nhất 1.2 giây.
const OTP_PURPOSE = Object.freeze({
  REGISTRATION: "registration",
  PASSWORD_RESET: "password_reset",
});

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_RESPONSE_FLOOR_MS = 1200;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

// Sinh mã 6 số bằng bộ sinh ngẫu nhiên an toàn của hệ thống,
// không dùng Math.random vì kết quả của nó đoán trước được.
function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

// Database KHÔNG bao giờ lưu mã thật, nên lộ database cũng không đọc được mã.
// Băm kèm email và lý do để mã của luồng đăng ký không dùng lại được
// cho luồng quên mật khẩu.
function hashOTP(email, purpose, code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("OTP hashing secret is missing");

  return createHmac("sha256", secret)
    .update(`${purpose}:${normalizeEmail(email)}:${String(code).trim()}`)
    .digest("hex");
}

// So mã người dùng gõ với chuỗi băm đã lưu.
// So bằng timingSafeEqual chứ không dùng dấu bằng thường, vì dấu bằng thường
// dừng ngay khi gặp ký tự khác nhau. Người tấn công đo thời gian phản hồi
// có thể dò ra từng ký tự của mã.
function isOTPMatch(codeHash, email, purpose, candidate) {
  if (!codeHash || !candidate) return false;
  const expected = Buffer.from(codeHash, "hex");
  const actual = Buffer.from(hashOTP(email, purpose, candidate), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Chờ cho đủ 1.2 giây rồi mới trả lời.
// Nếu không chờ, email đã có tài khoản sẽ trả lời chậm hơn email chưa có,
// vì nó phải gửi mail thật. Người lạ đo thời gian là biết email nào đã đăng ký.
async function waitForResponseFloor(startedAt) {
  const remaining = OTP_RESPONSE_FLOOR_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

module.exports = {
  OTP_MAX_ATTEMPTS,
  OTP_PURPOSE,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  generateOTP,
  hashOTP,
  isOTPMatch,
  normalizeEmail,
  waitForResponseFloor,
};
