const { sendOTP } = require("../../src/config/mailer");

describe("Brevo OTP email payload", () => {
  beforeEach(() => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_SENDER_EMAIL = "sender@example.com";
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("uses email-verification content for registration", async () => {
    await sendOTP("person@example.com", "123456", "registration");
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(payload.subject).toBe("MealMate - Verify your email");
    expect(payload.htmlContent).toContain("EMAIL VERIFICATION");
    expect(payload.htmlContent).toContain("123456");
    expect(payload.htmlContent).not.toContain("PASSWORD RESET");
    expect(payload.textContent).toContain("MealMate email verification");
  });

  test("keeps password-reset content isolated from registration", async () => {
    await sendOTP("person@example.com", "654321", "password_reset");
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(payload.subject).toBe("MealMate - Reset your password");
    expect(payload.htmlContent).toContain("PASSWORD RESET");
    expect(payload.htmlContent).toContain("654321");
    expect(payload.htmlContent).not.toContain("EMAIL VERIFICATION");
  });
});
