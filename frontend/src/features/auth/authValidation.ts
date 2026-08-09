// ═══ FILE NÀY LÀM GÌ ═══
// Ba phép kiểm dùng chung cho Đăng nhập, Đăng ký và Quên mật khẩu.
//
// Ai gọi tới: LoginScreen, RegisterScreen, ForgotPasswordScreen
// Nhận vào:   email, mã 6 số, hoặc mật khẩu người dùng gõ
// Trả ra:     đúng hoặc sai, riêng mật khẩu trả thêm câu lỗi đúng luật bị phạm
// Khi lỗi:    kiểm ngay tại app để báo lỗi mà không tốn một lượt gọi mạng
//
// Nhớ: backend VẪN kiểm lại đủ cả ba, vì phần kiểm ở app có thể bị bỏ qua.
//      Luật mật khẩu ở đây phải khớp isValidPassword trong
//      backend/src/validators/accountInputValidator.js.
import type { Strings } from "@/i18n";

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const isValidOtp = (value: string) => /^\d{6}$/.test(value.trim());

// Độ dài tối thiểu, tách riêng vì màn Đăng nhập chỉ kiểm mỗi cái này.
// Đăng nhập KHÔNG kiểm chữ hoa với chữ số, vì tài khoản tạo trước khi có luật
// mạnh vẫn phải đăng nhập được; luật mạnh chỉ áp cho mật khẩu ĐẶT MỚI.
export const PASSWORD_MIN_LENGTH = 6;

// Ba luật của mật khẩu đặt mới, khai ĐÚNG MỘT LẦN ở đây.
// Trả về luật bị phạm ĐẦU TIÊN, hoặc null khi mật khẩu đạt.
// Trước ngày 9/8/2026 ba màn vừa gọi isStrongPassword vừa chép tay lại ba luật
// này để lấy câu lỗi riêng, nên cùng một luật nằm ở bốn nơi.
export type PasswordIssue = "tooShort" | "needUpper" | "needNumber";

export function passwordIssue(value: string): PasswordIssue | null {
  if (value.length < PASSWORD_MIN_LENGTH) return "tooShort";
  if (!/[A-Z]/.test(value)) return "needUpper";
  if (!/[0-9]/.test(value)) return "needNumber";
  return null;
}

export const isStrongPassword = (value: string) => passwordIssue(value) === null;

// Đổi luật bị phạm thành câu cho người dùng đọc. Để ở đây luôn nên ba màn
// không phải tự dựng lấy chuỗi lỗi, và không màn nào lỡ dùng câu khác nhau.
export function passwordErrorMessage(value: string, t: Strings): string | null {
  const issue = passwordIssue(value);
  if (!issue) return null;
  if (issue === "tooShort") return t.auth.passwordTooShort;
  if (issue === "needUpper") return t.auth.passwordNeedUpper;
  return t.auth.passwordNeedNumber;
}
