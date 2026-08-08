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

// ══════════════════════════════════════════════════════════
// HẰNG SỐ VÀ HÀM AN TOÀN CHO MÃ 6 SỐ
//
// Không phải luồng. Mấy hằng số cấu hình, và mấy hàm tính thuần.
// Đến từ otpService, authController, accountController. Gọi cái nào cũng được.
// ══════════════════════════════════════════════════════════

// Hai lý do dùng mã. Băm mã có nhét lý do vào, nên mã của luồng đăng ký
// KHÔNG dùng lại được cho luồng quên mật khẩu.
const OTP_PURPOSE = Object.freeze({
  REGISTRATION: "registration",
  PASSWORD_RESET: "password_reset",
});

// Mã sống 10 phút rồi hết hiệu lực.
const OTP_TTL_MS = 10 * 60 * 1000;
// Gõ sai quá 5 lần là mã chết luôn, phải xin mã mới. Chặn dò mò từng số.
const OTP_MAX_ATTEMPTS = 5;
// Chờ 1 phút mới cho xin mã lần nữa. Chặn spam email.
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
// Mọi phản hồi mất ÍT NHẤT 1.2 giây, kể cả khi biết ngay là sai.
// Không có mức sàn này thì người tấn công đo thời gian trả lời là đoán được
// email nào có tài khoản, vì email không tồn tại sẽ trả về nhanh hơn hẳn.
const OTP_RESPONSE_FLOOR_MS = 1200;

// Đưa email về một dạng chuẩn: cắt khoảng trắng, hạ chữ thường.
// Phải dùng ở MỌI chỗ đụng tới email, kẻo "A@x.com" với "a@x.com" ra hai chuỗi băm khác nhau.
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
