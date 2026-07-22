const crypto = require("crypto");
const nodemailer = require("nodemailer");

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

const EMAIL_CONTENT = {
  registration: {
    documentTitle: "Verify your MealMate email",
    preheader: "Your 6-digit MealMate email verification code expires in 10 minutes.",
    badge: "EMAIL VERIFICATION",
    heading: "Verify your email address",
    introduction:
      "Enter the code below in MealMate to confirm this email and finish creating your account.",
    footer: "Didn't try to create a MealMate account? You can safely ignore this email.",
    subject: "MealMate - Verify your email",
    textHeading: "MealMate email verification",
  },
  password_reset: {
    documentTitle: "Reset your MealMate password",
    preheader: "Your 6-digit MealMate password reset code expires in 10 minutes.",
    badge: "PASSWORD RESET",
    heading: "Here is your verification code",
    introduction:
      "We received a request to reset your MealMate password. Enter the code below in the app to continue.",
    footer: "Didn't request a password reset? You can safely ignore this email.",
    subject: "MealMate - Reset your password",
    textHeading: "MealMate password reset",
  },
};

const getEmailContent = (purpose) => EMAIL_CONTENT[purpose] || EMAIL_CONTENT.password_reset;

const otpHtml = (otp, purpose) => {
  const content = getEmailContent(purpose);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>${content.documentTitle}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#ECFEFF; color:#164E63; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${content.preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse; background-color:#ECFEFF;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:560px; border-collapse:separate; background-color:#FFFFFF; border:1px solid #D7EEF4; border-radius:18px; overflow:hidden; box-shadow:0 12px 32px rgba(22,78,99,0.12);">
            <tr>
              <td style="padding:28px 32px; background-color:#0E7490;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td align="center" valign="middle" width="44" height="44" style="width:44px; height:44px; border-radius:14px; background-color:#FFFFFF; color:#0E7490; font-size:22px; line-height:44px; font-weight:800;">M</td>
                    <td style="padding-left:14px;">
                      <div style="color:#FFFFFF; font-size:24px; line-height:29px; font-weight:800; letter-spacing:-0.2px;">MealMate</div>
                      <div style="padding-top:2px; color:#CFFAFE; font-size:13px; line-height:18px; font-weight:600;">Your healthy companion</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 32px;">
                <div style="display:inline-block; padding:6px 10px; border-radius:999px; background-color:#ECFEFF; color:#0E7490; font-size:11px; line-height:16px; font-weight:800; letter-spacing:0.8px;">${content.badge}</div>

                <h1 style="margin:18px 0 10px; color:#164E63; font-size:28px; line-height:36px; font-weight:800; letter-spacing:-0.3px;">${content.heading}</h1>
                <p style="margin:0; color:#3F6B7D; font-size:16px; line-height:25px; font-weight:400;">
                  ${content.introduction}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:28px 0 18px; border-collapse:separate; background-color:#F0FDFA; border:1px solid #A7F3D0; border-radius:16px;">
                  <tr>
                    <td align="center" style="padding:24px 16px 22px;">
                      <div style="color:#3F6B7D; font-size:11px; line-height:16px; font-weight:800; letter-spacing:1.2px;">YOUR 6-DIGIT CODE</div>
                      <div style="padding-top:10px; color:#0E7490; font-size:38px; line-height:46px; font-weight:800; letter-spacing:8px;">${otp}</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; color:#3F6B7D; font-size:14px; line-height:22px; text-align:center;">
                  This code expires in <strong style="color:#164E63;">10 minutes</strong>.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin-top:28px; border-collapse:separate; background-color:#F8FAFC; border-left:4px solid #0891B2; border-radius:10px;">
                  <tr>
                    <td style="padding:16px 18px; color:#3F6B7D; font-size:14px; line-height:22px;">
                      <strong style="color:#164E63;">Keep your code private.</strong><br>
                      MealMate will never ask you to share this code with anyone.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px; background-color:#F8FDFF; border-top:1px solid #D7EEF4; color:#5C7F8F; font-size:12px; line-height:19px; text-align:center;">
                ${content.footer}<br>
                <span style="color:#0E7490; font-weight:700;">MealMate</span> &middot; Eat well, feel better.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const otpText = (otp, purpose) => {
  const content = getEmailContent(purpose);
  return `${content.textHeading}\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. Keep it private—MealMate will never ask you to share it.\n\n${content.footer}`;
};

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  if (!host || !Number.isInteger(port) || port <= 0 || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    fromEmail: process.env.SMTP_FROM_EMAIL?.trim() || user,
    fromName: process.env.SMTP_FROM_NAME?.trim() || "MealMate",
  };
};

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!apiKey || !senderEmail) return null;

  return { apiKey, senderEmail };
};

const getRelayConfig = () => {
  const url = process.env.EMAIL_RELAY_URL?.trim();
  const secret = process.env.EMAIL_RELAY_SECRET?.trim();
  if (!url || !secret) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") return null;
  } catch {
    return null;
  }

  return { url, secret };
};

const createRelaySignature = (payload, timestamp, secret) => {
  const canonicalPayload = JSON.stringify({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${canonicalPayload}`)
    .digest("hex");
};

const getEmailStatus = () => {
  const smtpConfigured = Boolean(getSmtpConfig());
  const relayConfigured = Boolean(getRelayConfig());
  const brevoConfigured = Boolean(getBrevoConfig());
  const providerCount = [smtpConfigured, relayConfigured, brevoConfigured].filter(Boolean).length;

  return {
    provider: smtpConfigured ? "smtp" : relayConfigured ? "relay" : brevoConfigured ? "brevo" : "none",
    configured: providerCount > 0,
    fallbackConfigured: providerCount > 1,
  };
};

const sendWithSmtp = async (to, otp, purpose, config) => {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: { name: config.fromName, address: config.fromEmail },
    to,
    subject: getEmailContent(purpose).subject,
    html: otpHtml(otp, purpose),
    text: otpText(otp, purpose),
  });
};

const sendWithBrevo = async (to, otp, purpose, config) => {

  const response = await fetch(BREVO_EMAIL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "MealMate", email: config.senderEmail },
      to: [{ email: to }],
      subject: getEmailContent(purpose).subject,
      htmlContent: otpHtml(otp, purpose),
      textContent: otpText(otp, purpose),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Brevo email request failed with status ${response.status}`);
  }
};

const sendWithRelay = async (to, otp, purpose, config) => {
  const payload = {
    to,
    subject: getEmailContent(purpose).subject,
    html: otpHtml(otp, purpose),
    text: otpText(otp, purpose),
  };
  const timestamp = Date.now().toString();
  const signature = createRelaySignature(payload, timestamp, config.secret);

  const response = await fetch(config.url, {
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
};

async function sendOTP(to, otp, purpose = "password_reset") {
  const smtpConfig = getSmtpConfig();
  const relayConfig = getRelayConfig();
  const brevoConfig = getBrevoConfig();

  if (!smtpConfig && !relayConfig && !brevoConfig) {
    throw new Error("Email configuration is missing");
  }

  if (smtpConfig) {
    try {
      await sendWithSmtp(to, otp, purpose, smtpConfig);
      return;
    } catch (error) {
      if (!relayConfig && !brevoConfig) throw error;
      console.warn("SMTP delivery failed; trying another provider:", error.message);
    }
  }

  if (relayConfig) {
    try {
      await sendWithRelay(to, otp, purpose, relayConfig);
      return;
    } catch (error) {
      if (!brevoConfig) throw error;
      console.warn("Email relay failed; trying Brevo fallback:", error.message);
    }
  }

  await sendWithBrevo(to, otp, purpose, brevoConfig);
}

module.exports = { getEmailStatus, sendOTP };
