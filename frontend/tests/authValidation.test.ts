// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra email, OTP sáu số và mật khẩu theo đúng luật form xác thực.
// Test khóa helper thuần, không gọi mạng hay dựng màn hình.
import { isStrongPassword, isValidEmail, isValidOtp } from "@/features/auth/authValidation";

test("auth fields follow the app rules", () => {
  expect(isValidEmail("person@example.com")).toBe(true);
  expect(isValidEmail("person@invalid")).toBe(false);
  expect(isValidOtp("123456")).toBe(true);
  expect(isValidOtp("12345")).toBe(false);
  expect(isStrongPassword("Meal123")).toBe(true);
  expect(isStrongPassword("meal123")).toBe(false);
});
