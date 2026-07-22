const crypto = require("crypto");

const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

const canonicalizePayload = (payload) =>
  JSON.stringify({
    to: payload.to,
    otp: payload.otp,
    purpose: payload.purpose,
  });

const createSignature = (payload, timestamp, secret) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${canonicalizePayload(payload)}`)
    .digest("hex");

const verifySignature = (payload, timestamp, signature, secret, now = Date.now()) => {
  if (
    typeof timestamp !== "string" ||
    typeof signature !== "string" ||
    typeof secret !== "string" ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const requestTime = Number(timestamp);
  if (!Number.isSafeInteger(requestTime) || Math.abs(now - requestTime) > MAX_REQUEST_AGE_MS) {
    return false;
  }

  const expected = Buffer.from(createSignature(payload, timestamp, secret), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

module.exports = { createSignature, verifySignature };
