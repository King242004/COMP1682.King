import { isStrongPassword, isValidEmail, isValidOtp } from "@/features/auth/authValidation";

test("auth fields follow the app rules", () => {
  expect(isValidEmail("person@example.com")).toBe(true);
  expect(isValidEmail("person@invalid")).toBe(false);
  expect(isValidOtp("123456")).toBe(true);
  expect(isValidOtp("12345")).toBe(false);
  expect(isStrongPassword("Meal123")).toBe(true);
  expect(isStrongPassword("meal123")).toBe(false);
});
