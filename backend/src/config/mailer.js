const nodemailer = require("nodemailer");

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

const transporter = nodemailer.createTransport({
  service: "gmail",
  // A stalled SMTP socket must not leave the mobile screen loading forever.
  // These limits start after Render has accepted the HTTP request, so they do
  // not reduce the time available for a free-tier cold start.
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const otpHtml = (otp) => `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #0891B2;">MealMate</h2>
        <p>Your OTP code to reset password:</p>
        <h1 style="letter-spacing: 8px; color: #0891B2; font-size: 36px;">${otp}</h1>
        <p style="color: #6b7280;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280;">If you did not request this, please ignore this email.</p>
      </div>
    `;

async function sendWithBrevo(to, otp) {
  const response = await fetch(BREVO_EMAIL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY.trim(),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "MealMate", email: process.env.BREVO_SENDER_EMAIL.trim() },
      to: [{ email: to }],
      subject: "MealMate - Password Reset OTP",
      htmlContent: otpHtml(otp),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Brevo email request failed with status ${response.status}`);
  }
}

async function sendWithGmail(to, otp) {
  await transporter.sendMail({
    from: `"MealMate" <${process.env.GMAIL_USER}>`,
    to,
    subject: "MealMate - Password Reset OTP",
    html: otpHtml(otp),
  });
}

const sendOTP = async (to, otp) => {
  if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
    return sendWithBrevo(to, otp);
  }
  return sendWithGmail(to, otp);
};

module.exports = { sendOTP };
