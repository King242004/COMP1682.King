// File này lo chữ ký chứng minh request đến từ backend MealMate thật.
// Cách tính phải giống hệt backend/src/services/emailRelayClient.js, lệch một ký tự là hỏng.
const crypto = require("crypto");

// Chữ ký chỉ dùng được trong 5 phút, để người lạ chép lại một request cũ
// cũng không gửi lại được.
const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

const canonicalizePayload = (payload) =>
  JSON.stringify({
    to: payload.to,
    otp: payload.otp,
    purpose: payload.purpose,
    language: payload.language,
  });

const createSignature = (payload, timestamp, secret) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${canonicalizePayload(payload)}`)
    .digest("hex");

// So bằng timingSafeEqual để người tấn công không dò được chữ ký
// bằng cách đo thời gian phản hồi.
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
