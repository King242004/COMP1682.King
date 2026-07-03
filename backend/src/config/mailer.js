const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from: `"MealMate" <${process.env.GMAIL_USER}>`,
    to,
    subject: "MealMate - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #0891B2;">MealMate</h2>
        <p>Your OTP code to reset password:</p>
        <h1 style="letter-spacing: 8px; color: #0891B2; font-size: 36px;">${otp}</h1>
        <p style="color: #6b7280;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTP };
