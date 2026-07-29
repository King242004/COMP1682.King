const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    weightKg: { type: Number, required: true, min: 20, max: 300 },
  },
  { timestamps: true }
);

weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightLog", weightLogSchema);
