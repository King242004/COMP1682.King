const mongoose = require("mongoose");

// AI workout suggestion for a planned day. `text` is the friendly sentence;
// the structured fields (name/met/durationMin) let the app offer a one-tap
// "✓ Done" that logs a real Exercise — rest days carry text only.
const planWorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    text: { type: String, required: true },
    name: { type: String, default: null },        // short activity name, e.g. "Đi bộ nhanh"
    met: { type: Number, default: null },         // MET value for the calorie estimate
    durationMin: { type: Number, default: null }, // suggested duration
    done: { type: Boolean, default: false },      // flipped when the user taps "✓ Done"
  },
  { timestamps: true }
);

planWorkoutSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("PlanWorkout", planWorkoutSchema);
