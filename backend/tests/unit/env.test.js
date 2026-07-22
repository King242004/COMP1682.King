const { validateEnvironment } = require("../../src/config/env");

const validEnv = {
  MONGODB_URI: "mongodb://localhost:27017/mealmate",
  JWT_SECRET: "j".repeat(32),
  OTP_SECRET: "o".repeat(32),
  CLOUDINARY_CLOUD_NAME: "cloud",
  CLOUDINARY_API_KEY: "key",
  CLOUDINARY_API_SECRET: "secret",
  EMAIL_RELAY_URL: "https://example.vercel.app/api/send-email",
  EMAIL_RELAY_SECRET: "r".repeat(32),
  GEMINI_API_KEY: "gemini-key",
};

describe("validateEnvironment", () => {
  test("accepts a complete production configuration", () => {
    expect(validateEnvironment(validEnv)).toEqual({ warnings: [] });
  });

  test("reports all missing required variables together", () => {
    expect(() => validateEnvironment({})).toThrow(/MONGODB_URI is required/);
    expect(() => validateEnvironment({})).toThrow(/EMAIL_RELAY_SECRET is required/);
  });

  test("rejects an insecure relay URL and a short relay secret", () => {
    expect(() => validateEnvironment({
      ...validEnv,
      EMAIL_RELAY_URL: "http://example.com/send",
      EMAIL_RELAY_SECRET: "short",
    })).toThrow(/must use HTTPS/);
  });

  test("warns without crashing when JWT and OTP secrets are short", () => {
    const result = validateEnvironment({ ...validEnv, JWT_SECRET: "short-but-present", OTP_SECRET: "" });
    expect(result.warnings).toHaveLength(2);
  });
});
