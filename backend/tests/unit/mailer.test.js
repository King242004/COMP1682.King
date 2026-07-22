jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require("nodemailer");
const { getEmailStatus, sendOTP } = require("../../src/config/mailer");

const EMAIL_ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM_EMAIL",
  "SMTP_FROM_NAME",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
];

describe("OTP email delivery", () => {
  let sendMail;

  beforeEach(() => {
    EMAIL_ENV_KEYS.forEach((key) => delete process.env[key]);
    sendMail = jest.fn().mockResolvedValue({ messageId: "test-message" });
    nodemailer.createTransport.mockReturnValue({ sendMail });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    EMAIL_ENV_KEYS.forEach((key) => delete process.env[key]);
    jest.restoreAllMocks();
    jest.clearAllMocks();
    delete global.fetch;
  });

  test("prefers SMTP and uses email-verification content", async () => {
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mealmatecare@gmail.com";
    process.env.SMTP_PASSWORD = "app-password";
    process.env.SMTP_FROM_NAME = "MealMate";

    await sendOTP("person@example.com", "123456", "registration");

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
      })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: "MealMate", address: "mealmatecare@gmail.com" },
        to: "person@example.com",
        subject: "MealMate - Verify your email",
        html: expect.stringContaining("EMAIL VERIFICATION"),
        text: expect.stringContaining("MealMate email verification"),
      })
    );
    expect(sendMail.mock.calls[0][0].html).toContain("123456");
    expect(global.fetch).not.toHaveBeenCalled();
    expect(getEmailStatus()).toEqual({
      provider: "smtp",
      configured: true,
      fallbackConfigured: false,
    });
  });

  test("uses Brevo when SMTP is not configured", async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_SENDER_EMAIL = "sender@example.com";

    await sendOTP("person@example.com", "654321", "password_reset");
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(payload.subject).toBe("MealMate - Reset your password");
    expect(payload.htmlContent).toContain("PASSWORD RESET");
    expect(payload.htmlContent).toContain("654321");
    expect(payload.htmlContent).not.toContain("EMAIL VERIFICATION");
    expect(sendMail).not.toHaveBeenCalled();
  });

  test("falls back to Brevo when SMTP delivery fails", async () => {
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_USER = "mealmatecare@gmail.com";
    process.env.SMTP_PASSWORD = "app-password";
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_SENDER_EMAIL = "sender@example.com";
    sendMail.mockRejectedValue(new Error("SMTP unavailable"));
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await sendOTP("person@example.com", "123456", "registration");

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "SMTP delivery failed; trying Brevo fallback:",
      "SMTP unavailable"
    );
  });

  test("rejects delivery when no provider is configured", async () => {
    await expect(
      sendOTP("person@example.com", "123456", "registration")
    ).rejects.toThrow("Email configuration is missing");

    expect(getEmailStatus()).toEqual({
      provider: "none",
      configured: false,
      fallbackConfigured: false,
    });
  });
});
