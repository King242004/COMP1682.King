const nodemailer = require("nodemailer");
const { verifySignature } = require("../src/signature");
const { buildOtpEmail } = require("../src/template");

const ALLOWED_PURPOSES = new Set(["registration", "password_reset"]);

const parseBody = (body) => {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const isValidEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPayload = (payload) =>
  isValidEmail(payload.to) &&
  typeof payload.otp === "string" &&
  /^\d{6}$/.test(payload.otp) &&
  ALLOWED_PURPOSES.has(payload.purpose);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const relaySecret = process.env.EMAIL_RELAY_SECRET?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();
  if (
    !relaySecret ||
    relaySecret.length < 32 ||
    !smtpHost ||
    !Number.isInteger(smtpPort) ||
    smtpPort <= 0 ||
    !smtpUser ||
    !smtpPassword
  ) {
    return res.status(500).json({ message: "Email relay is not configured" });
  }

  const body = parseBody(req.body);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const payload = {
    to: body.to,
    otp: body.otp,
    purpose: body.purpose,
  };
  const timestamp = req.headers["x-mealmate-timestamp"];
  const signature = req.headers["x-mealmate-signature"];
  if (!verifySignature(payload, timestamp, signature, relaySecret)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isValidPayload(payload)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  try {
    const email = buildOtpEmail(payload.otp, payload.purpose);
    await transporter.sendMail({
      from: {
        name: process.env.SMTP_FROM_NAME?.trim() || "MealMate",
        address: process.env.SMTP_FROM_EMAIL?.trim() || smtpUser,
      },
      to: payload.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return res.status(200).json({ delivered: true });
  } catch (error) {
    console.error("Email relay delivery failed:", error.message);
    return res.status(502).json({ message: "Email delivery failed" });
  }
};
