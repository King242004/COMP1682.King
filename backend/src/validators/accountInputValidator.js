// ═══ FILE NÀY LÀM GÌ ═══
// Ba luật kiểm dữ liệu tài khoản: email, mật khẩu, và tên hiển thị.
//
// Ai gọi tới: authController (đăng ký, đăng nhập), accountController
//             (đổi tên, đổi mật khẩu, đặt lại mật khẩu)
// Nhận vào:   chuỗi người dùng gõ
// Trả ra:     đúng hoặc sai
// Khi lỗi:    không ném gì, chỉ trả false cho nơi gọi tự dựng câu báo
//
// Vì sao tách ra: trước đây ba luật này viết ở hai controller, và riêng luật
// mật khẩu bị chép tay TÁM chỗ tính cả frontend. Lệch một chỗ là có đường
// đăng ký nhận mật khẩu yếu hơn đường đặt lại mật khẩu.
// Bản ở app chỉ để báo lỗi sớm cho người dùng; bản trong file này mới có thẩm quyền.
const { INPUT_LIMITS } = require("../config/inputLimits");

// Chặn trần độ dài email vì trường này có unique index, mà khóa index của MongoDB
// giới hạn 1024 byte nên chuỗi quá dài sẽ làm lỗi index thay vì ra câu báo lỗi tử tế.
const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= INPUT_LIMITS.EMAIL &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Ít nhất 6 ký tự, có một chữ hoa và một chữ số.
// Trần 64 vì bcrypt chỉ băm 72 byte đầu và bỏ im lặng phần dư, nghĩa là mật khẩu
// dài hơn sẽ có một phần đuôi không hề có tác dụng.
const isValidPassword = (pw) =>
  typeof pw === "string" &&
  pw.length >= 6 &&
  pw.length <= INPUT_LIMITS.PASSWORD &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw);

// Chỉ cho chữ cái và khoảng trắng. \p{L} khớp MỌI chữ cái Unicode,
// nên tên có dấu tiếng Việt vẫn qua được.
const isValidName = (name) =>
  typeof name === "string" &&
  name.trim().length >= 2 &&
  name.trim().length <= INPUT_LIMITS.DISPLAY_NAME &&
  /^[\p{L}\s]+$/u.test(name.trim());

// Ngôn ngữ email chỉ nhận vi hoặc en, giá trị lạ thì về tiếng Anh.
const resolveEmailLanguage = (value) => (value === "vi" ? "vi" : "en");

module.exports = { isValidEmail, isValidName, isValidPassword, resolveEmailLanguage };
