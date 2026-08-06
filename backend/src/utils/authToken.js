// Tạo JWT cho đăng ký, đăng nhập và đổi mật khẩu.
// authenticateUser đọc id cùng tokenVersion; phiên cũ hết hiệu lực khi version trong User tăng.
const jwt = require("jsonwebtoken");

const createAuthToken = (id, tokenVersion = 0) =>
  jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = { createAuthToken };
