// ═══ FILE NÀY LÀM GÌ ═══
// Lo nhật ký cân nặng: ghi cân nặng, đọc danh sách để vẽ biểu đồ, xóa.
//
// Ai gọi tới: weightRoutes, tức màn Cân nặng và mục tiêu, và biểu đồ ở Tiến trình
// Nhận vào:   số cân nặng và ngày
// Trả ra:     bản ghi đã lưu, và mục tiêu calo đã tính lại theo cân nặng mới
// Khi lỗi:    cân nặng ngoài khoảng hợp lý thì từ chối.
//             Ghi cho ngày tương lai thì bị chặn.
//
// Điểm nối quan trọng: ghi cân nặng mới sẽ đồng bộ ngược vào trường weight
// của User, rồi tính LẠI mục tiêu calo. Vì mục tiêu calo phụ thuộc cân nặng,
// nên không cập nhật thì mục tiêu sẽ đứng yên theo số cân cũ.
const WeightLog = require("../models/WeightLog");
const User = require("../models/User");
const { autoGoal, resolveWeightGoal } = require("../services/nutrition/calorieGoal");
const { PROFILE_LIMITS } = require("../config/nutritionConstants");
const { requestTodayKey } = require("../utils/dateUtils");

// File này lo nhật ký cân nặng và giữ cho hồ sơ luôn khớp với lần cân mới nhất.

// Đồng bộ cân nặng vào hồ sơ, và tính lại mục tiêu calo nếu người dùng
// đang để app tự tính. Ai tự đặt mục tiêu riêng thì không đụng tới.
async function syncUserWeight(userId, currentWeight) {
  const user = await User.findById(userId).select(
    "customGoal height age gender activityLevel goal targetWeight weeklyRateKg"
  );
  if (!user) return null;

  const nextGoal = resolveWeightGoal({
    goal: user.goal,
    currentWeight,
    targetWeight: user.targetWeight,
  });
  const updates = { weight: currentWeight, goal: nextGoal };

  if (!user.customGoal) {
    const calorieGoal = autoGoal({ ...user.toObject(), weight: currentWeight, goal: nextGoal });
    if (calorieGoal != null) updates.calorieGoal = calorieGoal;
  }
  await User.updateOne({ _id: userId }, { $set: updates });
  return nextGoal !== user.goal ? nextGoal : null;
}

// Chỉ đồng bộ khi đây là ngày mới nhất, để việc sửa lại một lần cân cũ
// không làm sai cân nặng hiện tại trong hồ sơ.
exports.logWeight = async (req, res) => {
  const { weightKg, date } = req.body;

  const kg = Number(weightKg);
  const weightLimit = PROFILE_LIMITS.weightKg;
  if (!kg || isNaN(kg) || kg < weightLimit.min || kg > weightLimit.max)
    return res.status(400).json({ message: `Weight must be between ${weightLimit.min} and ${weightLimit.max} kg.` });

  const day = date || requestTodayKey(req);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (day > requestTodayKey(req))
    return res.status(400).json({ message: "Cannot log weight for a future date." });

    // Cân nặng chỉ cần chính xác đến một chữ số thập phân.
    const rounded = Math.round(kg * 10) / 10;
  const log = await WeightLog.findOneAndUpdate(
    { user: req.user.id, date: day },
    { $set: { weightKg: rounded } },
    { returnDocument: "after", upsert: true }
  );

  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("date weightKg");
  const adjustedGoal = newest && newest.date === day
    ? await syncUserWeight(req.user.id, rounded)
    : null;

  res.status(201).json({
    message: "Weight logged.",
    log,
    ...(adjustedGoal && { adjustedGoal }),
  });
};

// Đảo lại thứ tự để biểu đồ vẽ được ngay từ trái sang phải theo thời gian.
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

// Phải đồng bộ lại vì nếu xóa đúng lần cân mới nhất thì hồ sơ đang giữ
// một con số không còn tồn tại trong nhật ký nữa.
exports.deleteWeight = async (req, res) => {
  const log = await WeightLog.findById(req.params.id);
  if (!log) return res.status(404).json({ message: "Entry not found." });
  if (log.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  await log.deleteOne();

  const newest = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 }).select("weightKg");
  const adjustedGoal = newest ? await syncUserWeight(req.user.id, newest.weightKg) : null;

  res.json({ message: "Entry deleted.", ...(adjustedGoal && { adjustedGoal }) });
};
