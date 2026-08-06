// ═══ FILE NÀY LÀM GÌ ═══
// Lo nhật ký tập luyện: ghi buổi tập, xem theo ngày, xem lịch sử, xóa.
//
// Ai gọi tới: exerciseRoutes, tức màn Ghi buổi tập và Bài tập có hướng dẫn
// Nhận vào:   mã hoạt động và thời lượng
// Trả ra:     buổi tập đã lưu, kèm số calo đã đốt
// Khi lỗi:    mã hoạt động lạ thì từ chối. Ghi cho ngày tương lai thì bị chặn.
//
// Điểm quan trọng: calo đã đốt do SERVER tính từ bảng MET, app KHÔNG được gửi
// con số đó lên. Tin con số app gửi thì người dùng khai khống được.
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const { requestTodayKey } = require("../utils/dateUtils");
const {
  getExternalActivity,
  getGuidedRoutine,
  buildExerciseSnapshot,
  computeBurned,
} = require("../config/exerciseCatalog");
const { LEGACY_LIMITS } = require("../config/inputLimits");

// Công thức calo tiêu hao: mức nặng nhẹ của bài tập nhân cân nặng nhân số giờ.
// Mức nặng nhẹ này gọi là MET. MET được tra bằng mã hoạt động ở server, không nhận từ app.
// ─── Add Exercise ─────────────────────────────────────────────────────────────
// Calo được tính ở server chứ không nhận từ app, để người dùng không sửa được con số.
exports.addExercise = async (req, res) => {
  const { name, activityKey, routineKey, durationMin, date } = req.body;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const numericDuration = Number(durationMin);
  const reference = activityKey
    ? getExternalActivity(activityKey)
    : routineKey
      ? getGuidedRoutine(routineKey)
      : null;

  if (!cleanName || durationMin === undefined || !date || (!activityKey && !routineKey))
    return res.status(400).json({ message: "Name, exercise reference, durationMin and date are required." });

  if ((activityKey && routineKey) || !reference)
    return res.status(400).json({ message: "Unknown exercise reference." });

  if (cleanName.length > LEGACY_LIMITS.MEAL_NAME)
    return res.status(400).json({ message: `Activity name must not exceed ${LEGACY_LIMITS.MEAL_NAME} characters.` });

  if (!Number.isFinite(numericDuration) || numericDuration < 1 || numericDuration > 600)
    return res.status(400).json({ message: "Duration must be between 1 and 600 minutes." });

  if (routineKey && reference.durationMin !== numericDuration)
    return res.status(400).json({ message: "Workout duration does not match the guided session." });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (date > requestTodayKey(req))
    return res.status(400).json({ message: "Cannot log a workout for a future date." });

  const user = await User.findById(req.user.id).select("weight");
  if (!user?.weight || user.weight <= 0)
    return res.status(400).json({ message: "PROFILE_WEIGHT_REQUIRED" });

  const caloriesBurned = computeBurned(reference.met, numericDuration, user.weight);
  const snapshot = buildExerciseSnapshot(
    activityKey ? "external" : "guided",
    activityKey || routineKey,
    reference,
    user.weight,
  );

  const exercise = await Exercise.create({
    user: req.user.id,
    name: cleanName,
    ...snapshot,
    durationMin: numericDuration,
    caloriesBurned,
    date,
  });

  res.status(201).json({ message: "Workout logged.", exercise });
};

exports.getExercisesByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Please provide a valid date in format YYYY-MM-DD." });

  const exercises = await Exercise.find({ user: req.user.id, date }).sort({ createdAt: 1 });
  const totalBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  res.json({ date, exercises, totalBurned });
};

exports.getExerciseHistory = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const exercises = await Exercise.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ exercises });
};

exports.deleteExercise = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) return res.status(404).json({ message: "Workout not found." });

  if (exercise.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this workout." });

  await exercise.deleteOne();
  res.json({ message: "Workout deleted." });
};
