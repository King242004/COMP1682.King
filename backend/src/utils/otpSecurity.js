const { createHmac, randomInt, timingSafeEqual } = require("crypto");

const OTP_PURPOSE = Object.freeze({
  REGISTRATION: "registration",
  PASSWORD_RESET: "password_reset",
});

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_RESPONSE_FLOOR_MS = 1200;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function hashOTP(email, purpose, code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("OTP hashing secret is missing");

  return createHmac("sha256", secret)
    .update(`${purpose}:${normalizeEmail(email)}:${String(code).trim()}`)
    .digest("hex");
}

function isOTPMatch(codeHash, email, purpose, candidate) {
  if (!codeHash || !candidate) return false;
  const expected = Buffer.from(codeHash, "hex");
  const actual = Buffer.from(hashOTP(email, purpose, candidate), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function waitForResponseFloor(startedAt) {
  const remaining = OTP_RESPONSE_FLOOR_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

module.exports = {
  OTP_MAX_ATTEMPTS,
  OTP_PURPOSE,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  generateOTP,
  hashOTP,
  isOTPMatch,
  normalizeEmail,
  waitForResponseFloor,
};
