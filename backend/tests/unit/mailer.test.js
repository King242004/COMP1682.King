const crypto = require("crypto");
const { getEmailStatus, sendOTP } = require("../../src/config/mailer");

const relayUrl = "https://mealmate-email.vercel.app/api/send-email";
const relaySecret = "a-secure-relay-secret-with-at-least-32-characters";

const configureRelay = () => {
  process.env.EMAIL_RELAY_URL = relayUrl;
  process.env.EMAIL_RELAY_SECRET = relaySecret;
};

describe("OTP email relay", () => {
  beforeEach(() => {
    delete process.env.EMAIL_RELAY_URL;
    delete process.env.EMAIL_RELAY_SECRET;
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    delete process.env.EMAIL_RELAY_URL;
    delete process.env.EMAIL_RELAY_SECRET;
    jest.clearAllMocks();
    delete global.fetch;
  });

  test("sends a compact signed registration request", async () => {
    configureRelay();

    await sendOTP("person@example.com", "123456", "registration");
    const [url, request] = global.fetch.mock.calls[0];
    const payload = JSON.parse(request.body);
    const timestamp = request.headers["x-mealmate-timestamp"];
    const expectedSignature = crypto
      .createHmac("sha256", relaySecret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest("hex");

    expect(url).toBe(relayUrl);
    expect(payload).toEqual({
      to: "person@example.com",
      otp: "123456",
      purpose: "registration",
    });
    expect(request.headers["x-mealmate-signature"]).toBe(expectedSignature);
    expect(getEmailStatus()).toEqual({ provider: "relay", configured: true });
  });

  test("supports password-reset requests", async () => {
    configureRelay();

    await sendOTP("person@example.com", 654321, "password_reset");

    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
      to: "person@example.com",
      otp: "654321",
      purpose: "password_reset",
    });
  });

  test("surfaces relay failures", async () => {
    configureRelay();
    global.fetch.mockResolvedValue({ ok: false, status: 502 });

    await expect(
      sendOTP("person@example.com", "123456", "registration")
    ).rejects.toThrow("Email relay request failed with status 502");
  });

  test("rejects invalid payloads before making a request", async () => {
    configureRelay();

    await expect(sendOTP("person@example.com", "12345", "registration")).rejects.toThrow(
      "Invalid OTP email payload"
    );
    await expect(sendOTP("person@example.com", "123456", "unknown")).rejects.toThrow(
      "Invalid OTP email payload"
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("rejects missing or insecure relay configuration", async () => {
    await expect(
      sendOTP("person@example.com", "123456", "registration")
    ).rejects.toThrow("Email relay configuration is missing or invalid");
    expect(getEmailStatus()).toEqual({ provider: "none", configured: false });

    process.env.EMAIL_RELAY_URL = "http://insecure.example.com/api/send-email";
    process.env.EMAIL_RELAY_SECRET = relaySecret;
    await expect(
      sendOTP("person@example.com", "123456", "registration")
    ).rejects.toThrow("Email relay configuration is missing or invalid");
  });
});
