const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "password_reset"],
    },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  // updatedAt được dùng để tính thời gian chờ trước khi gửi lại mã.
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true, partialFilterExpression: { purpose: { $exists: true } } }
);

module.exports = mongoose.model("OTP", otpSchema);
