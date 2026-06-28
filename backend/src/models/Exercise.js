const mongoose = require("mongoose");

// A logged workout. caloriesBurned is computed server-side from the MET formula
// (MET × weight(kg) × hours) at creation, so it stays consistent with the
// user's weight at that time.
const exerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    met: { type: Number, required: true, min: 0 },
    durationMin: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    date: { type: String, required: true }, // format: "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
