const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_RELAY_URL",
  "EMAIL_RELAY_SECRET",
];

function validateEnvironment(env = process.env) {
  const errors = [];
  const warnings = [];

  for (const name of REQUIRED_ENV) {
    if (!String(env[name] || "").trim()) errors.push(`${name} is required.`);
  }

  const relayUrl = String(env.EMAIL_RELAY_URL || "").trim();
  if (relayUrl) {
    try {
      if (new URL(relayUrl).protocol !== "https:") errors.push("EMAIL_RELAY_URL must use HTTPS.");
    } catch {
      errors.push("EMAIL_RELAY_URL must be a valid URL.");
    }
  }

  if (String(env.EMAIL_RELAY_SECRET || "").length < 32) {
    errors.push("EMAIL_RELAY_SECRET must be at least 32 characters.");
  }

  const jwtSecret = String(env.JWT_SECRET || "");
  const otpSecret = String(env.OTP_SECRET || jwtSecret);
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push("JWT_SECRET should be at least 32 characters. Rotating it signs out existing sessions.");
  }
  if (otpSecret && otpSecret.length < 32) {
    warnings.push("OTP_SECRET should be at least 32 characters; it currently falls back to JWT_SECRET.");
  }

  const geminiKeys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3, env.GEMINI_API_KEY_4]
    .filter((value) => String(value || "").trim());
  if (geminiKeys.length === 0) warnings.push("No Gemini API key is configured; AI features will be unavailable.");

  if (errors.length) throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  return { warnings };
}

module.exports = { validateEnvironment };
