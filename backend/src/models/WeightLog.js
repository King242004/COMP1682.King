const mongoose = require("mongoose");

// One body-weight entry per user per day. Logging again on the same day
// REPLACES that day's value (upsert) — a weight isn't a list of attempts.
const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    weightKg: { type: Number, required: true, min: 20, max: 300 },
  },
  { timestamps: true }
);

// One entry per day + fast "latest N for this user" queries
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightLog", weightLogSchema);
