const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "password_reset"],
    },
    // Store only an HMAC digest. A database read must not reveal a usable code.
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    // Wrong-guess counter — the code is destroyed after 5 misses so a 6-digit
    // OTP can't be brute-forced within its 10-minute lifetime.
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true } // updatedAt drives the resend cooldown
);

// Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true, partialFilterExpression: { purpose: { $exists: true } } }
);

module.exports = mongoose.model("OTP", otpSchema);
