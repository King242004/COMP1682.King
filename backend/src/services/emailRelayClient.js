// ═══ FILE NÀY LÀM GÌ ═══
// Gửi mã xác minh 6 số qua email, bằng cách nhờ một dịch vụ chuyển tiếp riêng.
//
// Ai gọi tới: authController (đăng ký), accountController (quên mật khẩu)
// Nhận vào:   email nhận, mã 6 số, loại việc, và ngôn ngữ
// Trả ra:     kết quả gửi thành công hay không
// Khi lỗi:    thiếu cấu hình relay hoặc relay không trả lời thì báo lỗi,
//             authController.sendRegistrationOTP hoặc accountController.sendPasswordOTP trả lỗi thử lại
//
// Vì sao không gửi thẳng bằng SMTP: máy chủ Render chặn cổng SMTP,
// nên phải đi qua một dịch vụ trung gian gọi bằng HTTPS.
// Mỗi lần gọi đều ký bằng khóa bí mật để relay biết đúng là app mình gọi.
const crypto = require("crypto");

const ALLOWED_PURPOSES = new Set(["registration", "password_reset"]);
const ALLOWED_LANGUAGES = new Set(["vi", "en"]);

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

// Chữ ký này phải giống hệt cách tính bên email-relay/src/requestSignature.js.
// Lệch một ký tự là bên kia từ chối nhận.
const createRelaySignature = (payload, timestamp, secret) => {
  const canonicalPayload = JSON.stringify({
    to: payload.to,
    otp: payload.otp,
    purpose: payload.purpose,
    language: payload.language,
    language: payload.language,
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

async function sendOTP(to, otp, purpose = "password_reset", language = "en") {
  const relayConfig = getRelayConfig();
  if (!relayConfig) throw new Error("Email relay configuration is missing or invalid");
  if (!ALLOWED_PURPOSES.has(purpose) || !ALLOWED_LANGUAGES.has(language) || !/^\d{6}$/.test(String(otp))) {
    throw new Error("Invalid OTP email payload");
  }

  const payload = { to, otp: String(otp), purpose, language };
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
