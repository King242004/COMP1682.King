const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    met: { type: Number, required: true, min: 0 },
    durationMin: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
  },
  { timestamps: true }
);

exerciseSchema.index({ user: 1, date: -1, createdAt: -1 });

module.exports = mongoose.model("Exercise", exerciseSchema);
