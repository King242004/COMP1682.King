const mongoose = require("mongoose");

// One-line AI workout suggestion for a planned day (display only — the user logs
// real workouts via the Exercise flow).
const planWorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanWorkout", planWorkoutSchema);
