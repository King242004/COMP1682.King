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
  "EMAIL_RELAY_URL",
  "EMAIL_RELAY_SECRET",
];

const configureSmtp = () => {
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "mealmatecare@gmail.com";
  process.env.SMTP_PASSWORD = "app-password";
  process.env.SMTP_FROM_NAME = "MealMate";
};

const configureRelay = () => {
  process.env.EMAIL_RELAY_URL = "https://mealmate-email.vercel.app/api/send-email";
  process.env.EMAIL_RELAY_SECRET = "a-secure-shared-secret";
};

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
    configureSmtp();

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

  test("sends a signed HTTPS relay request", async () => {
    configureRelay();

    await sendOTP("person@example.com", "123456", "registration");
    const [url, request] = global.fetch.mock.calls[0];
    const payload = JSON.parse(request.body);

    expect(url).toBe("https://mealmate-email.vercel.app/api/send-email");
    expect(request.headers["x-mealmate-timestamp"]).toMatch(/^\d+$/);
    expect(request.headers["x-mealmate-signature"]).toMatch(/^[a-f0-9]{64}$/);
    expect(payload).toEqual(
      expect.objectContaining({
        to: "person@example.com",
        subject: "MealMate - Verify your email",
        html: expect.stringContaining("123456"),
      })
    );
    expect(getEmailStatus()).toEqual({
      provider: "relay",
      configured: true,
      fallbackConfigured: false,
    });
  });

  test("uses the relay when direct SMTP fails", async () => {
    configureSmtp();
    configureRelay();
    sendMail.mockRejectedValue(new Error("SMTP unavailable"));
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await sendOTP("person@example.com", "123456", "registration");

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "SMTP delivery failed; trying HTTPS relay:",
      "SMTP unavailable"
    );
    expect(getEmailStatus()).toEqual({
      provider: "smtp",
      configured: true,
      fallbackConfigured: true,
    });
  });

  test("surfaces relay failures instead of hiding them", async () => {
    configureRelay();
    global.fetch.mockResolvedValue({ ok: false, status: 502 });

    await expect(
      sendOTP("person@example.com", "123456", "registration")
    ).rejects.toThrow("Email relay request failed with status 502");

    expect(global.fetch).toHaveBeenCalledTimes(1);
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
