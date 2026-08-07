// ═══ FILE NÀY LÀM GÌ ═══
// Bộ đếm số lần gọi; middleware trong từng route chặn request quá dày trước hàm controller.
//
// Ai gọi tới: authRoutes, accountRoutes, coachRoutes
// Nhận vào:   request đi vào
// Trả ra:     không trả gì nếu còn lượt, cho đi tiếp
// Khi lỗi:    hết lượt thì trả 429 và bảo thử lại sau
//
// Cửa sổ đếm là 15 phút.
// authLimiter chặn dò mật khẩu, gắn cho cả nhóm đăng nhập đăng ký.
// registrationOtpLimiter và passwordOtpLimiter chặn spam gửi email mã xác minh.
// aiLimiter đếm riêng theo từng người dùng nên bắt buộc phải đặt SAU cửa đăng nhập.
const rateLimit = require("express-rate-limit");

function createLimiter(limit, message, options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message },
    ...options,
  });
}

const authLimiter = createLimiter(30, "Too many attempts. Please try again later.");
const registrationOtpLimiter = createLimiter(5, "Too many verification requests. Please try again later.");
const passwordOtpLimiter = createLimiter(10, "Too many attempts. Please try again later.");
const aiLimiter = createLimiter(30, "Too many AI requests. Please try again later.", {
  keyGenerator: (req) => `user:${req.user.id}`,
});

module.exports = { aiLimiter, authLimiter, passwordOtpLimiter, registrationOtpLimiter };
