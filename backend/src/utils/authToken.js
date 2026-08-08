// ═══ FILE NÀY LÀM GÌ ═══
// Tạo thẻ đăng nhập JWT. Chỉ một việc đó thôi.
//
// Ai gọi tới: authController (đăng ký, đăng nhập), accountController (đổi mật khẩu)
// Nhận vào:   mã người dùng và số phiên bản thẻ
// Trả ra:     một chuỗi thẻ, sống 30 ngày
// Khi lỗi:    thiếu JWT_SECRET trong .env thì ném lỗi ngay lúc tạo thẻ
//
// Nhớ: thẻ có nhét tokenVersion vào trong. authenticateUser so số đó với số
//      trong User, lệch là từ chối. Nhờ vậy đổi mật khẩu xong chỉ cần tăng số
//      trong User là MỌI thẻ cũ chết hết, không phải đi tìm từng thẻ mà xóa.
const jwt = require("jsonwebtoken");

// Ký thẻ sống 30 ngày. Thiếu JWT_SECRET thì jwt.sign tự ném lỗi,
// không bắt ở đây, để lỗi nổi lên ngay lúc thử tạo thẻ đầu tiên.
const createAuthToken = (id, tokenVersion = 0) =>
  jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = { createAuthToken };
