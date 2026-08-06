// Ba phép kiểm dùng chung cho các màn Đăng nhập, Đăng ký và Quên mật khẩu.
// Kiểm ngay tại app để báo lỗi mà không tốn một lượt gọi mạng.
// Backend VẪN kiểm lại đủ cả ba, vì phần kiểm ở app có thể bị bỏ qua.
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const isValidOtp = (value: string) => /^\d{6}$/.test(value.trim());
export const isStrongPassword = (value: string) =>
  value.length >= 6 && /[A-Z]/.test(value) && /[0-9]/.test(value);
