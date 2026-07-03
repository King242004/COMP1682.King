const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    // Wrong-guess counter — the code is destroyed after 5 misses so a 6-digit
    // OTP can't be brute-forced within its 10-minute lifetime.
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true } // createdAt drives the resend cooldown
);

// Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
