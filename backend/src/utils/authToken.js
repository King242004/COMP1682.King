// ═══ FILE NÀY LÀM GÌ ═══
// Tạo thẻ đăng nhập JWT. Chỉ một việc đó thôi.
//
// Ai gọi tới: authController (đăng ký, đăng nhập), accountController (đổi mật khẩu)
// Nhận vào:   mã người dùng và số phiên bản thẻ
// Trả ra:     một chuỗi thẻ, sống 30 ngày
// Khi lỗi:    thiếu JWT_SECRET trong .env thì ném lỗi ngay lúc tạo thẻ
//
// Tạo JWT cho đăng ký, đăng nhập và đổi mật khẩu.
// authenticateUser đọc id cùng tokenVersion; phiên cũ hết hiệu lực khi version trong User tăng.
const jwt = require("jsonwebtoken");

const createAuthToken = (id, tokenVersion = 0) =>
  jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = { createAuthToken };
