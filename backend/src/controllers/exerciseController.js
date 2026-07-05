const Exercise = require("../models/Exercise");
const User = require("../models/User");

const DEFAULT_WEIGHT = 60; // fallback (kg) when the user hasn't set weight yet

// Local YYYY-MM-DD for "today" — string compare works for date keys
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// MET formula: kcal = MET × weight(kg) × hours
function computeBurned(met, durationMin, weight) {
  const w = weight && weight > 0 ? weight : DEFAULT_WEIGHT;
  return Math.round(met * w * (durationMin / 60));
}

// ─── Add Exercise ─────────────────────────────────────────────────────────────
exports.addExercise = async (req, res) => {
  const { name, met, durationMin, date } = req.body;

  if (!name || met === undefined || durationMin === undefined || !date)
    return res.status(400).json({ message: "Name, met, durationMin and date are required." });

  if (met < 0)
    return res.status(400).json({ message: "MET must be a positive number." });

  if (durationMin < 1)
    return res.status(400).json({ message: "Duration must be at least 1 minute." });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  // Time rule: log today or back-fill a past day; a FUTURE workout is not allowed
  if (date > todayKey())
    return res.status(400).json({ message: "Cannot log a workout for a future date." });

  // Pull current weight to compute the burn
  const user = await User.findById(req.user.id).select("weight");
  const caloriesBurned = computeBurned(met, durationMin, user?.weight);

  const exercise = await Exercise.create({
    user: req.user.id,
    name: name.trim(),
    met,
    durationMin,
    caloriesBurned,
    date,
  });

  res.status(201).json({ message: "Workout logged.", exercise });
};

// ─── Get Exercises by Date ──────────────────────────────────────────────────
exports.getExercisesByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Please provide a valid date in format YYYY-MM-DD." });

  const exercises = await Exercise.find({ user: req.user.id, date }).sort({ createdAt: 1 });
  const totalBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  res.json({ date, exercises, totalBurned });
};

// ─── Get Exercise History ─────────────────────────────────────────────────────
exports.getExerciseHistory = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const exercises = await Exercise.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ exercises });
};

// ─── Delete Exercise ────────────────────────────────────────────────────────
exports.deleteExercise = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) return res.status(404).json({ message: "Workout not found." });

  if (exercise.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this workout." });

  await exercise.deleteOne();
  res.json({ message: "Workout deleted." });
};
