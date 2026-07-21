const {
  OTP_PURPOSE,
  generateOTP,
  hashOTP,
  isOTPMatch,
  normalizeEmail,
} = require("../../src/utils/otpSecurity");

describe("OTP security helpers", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "unit-test-secret";
  });

  test("generates a six-digit code with cryptographic randomInt", () => {
    expect(generateOTP()).toMatch(/^\d{6}$/);
  });

  test("normalizes email before binding a code", () => {
    const email = "  Person@Example.COM ";
    expect(normalizeEmail(email)).toBe("person@example.com");
    const digest = hashOTP(email, OTP_PURPOSE.REGISTRATION, "123456");
    expect(isOTPMatch(digest, "person@example.com", OTP_PURPOSE.REGISTRATION, "123456")).toBe(true);
  });

  test("rejects a wrong code, email or purpose", () => {
    const digest = hashOTP("person@example.com", OTP_PURPOSE.REGISTRATION, "123456");
    expect(isOTPMatch(digest, "person@example.com", OTP_PURPOSE.REGISTRATION, "654321")).toBe(false);
    expect(isOTPMatch(digest, "other@example.com", OTP_PURPOSE.REGISTRATION, "123456")).toBe(false);
    expect(isOTPMatch(digest, "person@example.com", OTP_PURPOSE.PASSWORD_RESET, "123456")).toBe(false);
  });

  test("produces no plaintext OTP in the stored digest", () => {
    const digest = hashOTP("person@example.com", OTP_PURPOSE.REGISTRATION, "123456");
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain("123456");
  });
});
