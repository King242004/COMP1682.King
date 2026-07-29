const WeightLog = require("../models/WeightLog");
const User = require("../models/User");
const { autoGoal } = require("../services/calorieGoal");
const { todayKey } = require("../utils/date");

async function syncUserWeight(userId, newWeight) {
  const u = await User.findById(userId).select(
    "customGoal height age gender activityLevel goal"
  );
  if (!u) return;
  const updates = { weight: newWeight };
  if (!u.customGoal) {
    const g = autoGoal({ ...u.toObject(), weight: newWeight });
    if (g) updates.calorieGoal = g;
  }
  await User.updateOne({ _id: userId }, { $set: updates });
}

exports.logWeight = async (req, res) => {
  const { weightKg, date } = req.body;

  const kg = Number(weightKg);
  if (!kg || isNaN(kg) || kg < 20 || kg > 300)
    return res.status(400).json({ message: "Weight must be between 20 and 300 kg." });

  const day = date || todayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (day > todayKey())
    return res.status(400).json({ message: "Cannot log weight for a future date." });

    // Cân nặng chỉ cần chính xác đến một chữ số thập phân.
    const rounded = Math.round(kg * 10) / 10;
  const log = await WeightLog.findOneAndUpdate(
    { user: req.user.id, date: day },
    { $set: { weightKg: rounded } },
    { returnDocument: "after", upsert: true }
  );

  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("date weightKg");
  if (newest && newest.date === day) {
    await syncUserWeight(req.user.id, rounded);
  }

  res.status(201).json({ message: "Weight logged.", log });
};

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

exports.deleteWeight = async (req, res) => {
  const log = await WeightLog.findById(req.params.id);
  if (!log) return res.status(404).json({ message: "Entry not found." });
  if (log.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  await log.deleteOne();

  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("weightKg");
  if (newest) await syncUserWeight(req.user.id, newest.weightKg);

  res.json({ message: "Entry deleted." });
};
