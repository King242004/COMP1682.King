const crypto = require("crypto");

const ALLOWED_PURPOSES = new Set(["registration", "password_reset"]);

const getRelayConfig = () => {
  const url = process.env.EMAIL_RELAY_URL?.trim();
  const secret = process.env.EMAIL_RELAY_SECRET?.trim();
  if (!url || !secret || secret.length < 32) return null;

  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch {
    return null;
  }

  return { url, secret };
};

const createRelaySignature = (payload, timestamp, secret) => {
  const canonicalPayload = JSON.stringify({
    to: payload.to,
    otp: payload.otp,
    purpose: payload.purpose,
  });

  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${canonicalPayload}`)
    .digest("hex");
};

const getEmailStatus = () => {
  const configured = Boolean(getRelayConfig());
  return { provider: configured ? "relay" : "none", configured };
};

async function sendOTP(to, otp, purpose = "password_reset") {
  const relayConfig = getRelayConfig();
  if (!relayConfig) throw new Error("Email relay configuration is missing or invalid");
  if (!ALLOWED_PURPOSES.has(purpose) || !/^\d{6}$/.test(String(otp))) {
    throw new Error("Invalid OTP email payload");
  }

  const payload = { to, otp: String(otp), purpose };
  const timestamp = Date.now().toString();
  const signature = createRelaySignature(payload, timestamp, relayConfig.secret);
  const response = await fetch(relayConfig.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-mealmate-timestamp": timestamp,
      "x-mealmate-signature": signature,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Email relay request failed with status ${response.status}`);
  }
}

module.exports = { getEmailStatus, sendOTP };
