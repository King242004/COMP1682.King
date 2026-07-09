const WeightLog = require("../models/WeightLog");
const User = require("../models/User");

// Local YYYY-MM-DD for "today" — string compare works for date keys
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Log weight (POST /api/weight) ────────────────────────────────────────────
// body: { weightKg, date? } — defaults to today. Same-day log REPLACES the value.
// When this entry is the user's newest, User.weight syncs to it so BMI/TDEE and
// the MET burn formula always use the freshest weight.
exports.logWeight = async (req, res) => {
  const { weightKg, date } = req.body;

  const kg = Number(weightKg);
  if (!kg || isNaN(kg) || kg < 20 || kg > 300)
    return res.status(400).json({ message: "Weight must be between 20 and 300 kg." });

  const day = date || todayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  // Time rule: today or back-fill the past — never the future
  if (day > todayKey())
    return res.status(400).json({ message: "Cannot log weight for a future date." });

  const rounded = Math.round(kg * 10) / 10; // one decimal is plenty for body weight
  const log = await WeightLog.findOneAndUpdate(
    { user: req.user.id, date: day },
    { $set: { weightKg: rounded } },
    { new: true, upsert: true }
  );

  // Sync profile weight only if no NEWER log exists (back-filling an old day
  // must not overwrite the current weight)
  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("date weightKg");
  if (newest && newest.date === day) {
    await User.updateOne({ _id: req.user.id }, { $set: { weight: rounded } });
  }

  res.status(201).json({ message: "Weight logged.", log });
};

// ─── Weight history (GET /api/weight?limit=90) ────────────────────────────────
// Oldest→newest (chart-ready) + the user's target for the header block.
exports.getWeights = async (req, res) => {
  const limit = Math.min(365, parseInt(req.query.limit) || 90);
  const [logs, user] = await Promise.all([
    WeightLog.find({ user: req.user.id }).sort({ date: -1 }).limit(limit),
    User.findById(req.user.id).select("weight targetWeight"),
  ]);
  res.json({
    logs: logs.reverse(),
    currentWeight: user?.weight ?? null,
    targetWeight: user?.targetWeight ?? null,
  });
};

// ─── Delete an entry (DELETE /api/weight/:id) ─────────────────────────────────
exports.deleteWeight = async (req, res) => {
  const log = await WeightLog.findById(req.params.id);
  if (!log) return res.status(404).json({ message: "Entry not found." });
  if (log.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  await log.deleteOne();

  // Keep User.weight pointing at whatever is now the newest entry
  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("weightKg");
  if (newest) await User.updateOne({ _id: req.user.id }, { $set: { weight: newest.weightKg } });

  res.json({ message: "Entry deleted." });
};
