// ═══ FILE NÀY LÀM GÌ ═══
// Gom dữ liệu thật của một người dùng lại thành một bản tóm tắt để đưa cho AI.
// Nhờ nó mà Coach nói đúng số của từng người thay vì nói chung chung.
//
// Ai gọi tới: coachController (trò chuyện, chấm điểm, gợi ý món),
//             planController (lấy hướng dẫn về bệnh nền)
// Nhận vào:   mã người dùng và ngày cần xem
// Trả ra:     hồ sơ, món đã ăn, buổi tập, cân nặng, kế hoạch, gói thành một khối chữ
// Khi lỗi:    thiếu dữ liệu nào thì bỏ trống phần đó, không dựng số giả,
//             vì Coach thà nói không biết còn hơn nói một con số bịa
const User = require("../../models/User");
const Meal = require("../../models/Meal");
const Exercise = require("../../models/Exercise");
const PlanMeal = require("../../models/PlanMeal");
const PlanWorkout = require("../../models/PlanWorkout");
const WeightLog = require("../../models/WeightLog");
const { autoGoal } = require("../nutrition/calorieGoal");

// File này gom dữ liệu thật của người dùng để đưa cho AI.
// Nhờ nó mà Coach nói đúng số liệu của từng người thay vì nói chung chung.

// Cộng hoặc trừ số ngày vào một chuỗi ngày dạng YYYY-MM-DD.
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Đổi một mốc thời gian bất kỳ thành chuỗi ngày YYYY-MM-DD.
function toDateKey(value) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Đếm số ngày từ ngày này tới ngày kia, tính cả hai đầu.
function daysInclusive(fromKey, toKey) {
  const from = new Date(fromKey + "T00:00:00");
  const to = new Date(toKey + "T00:00:00");
  return Math.floor((to - from) / 86400000) + 1;
}

function sumMacros(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Đọc cùng lúc bằng Promise.all thay vì đọc lần lượt, để Coach trả lời nhanh hơn.
async function buildContext(userId, date) {
  const weekStart = shiftDate(date, -6);
  const [user, todayMeals, todayExercises, weekMeals, weekExercises, weightLogs, planMeals, planWorkouts] = await Promise.all([
    User.findById(userId).select("name gender age weight height goal activityLevel conditions calorieGoal customGoal tastePreferences targetWeight createdAt"),
    Meal.find({ user: userId, date }).sort({ createdAt: 1 }),
    Exercise.find({ user: userId, date }).sort({ createdAt: 1 }),
    Meal.find({ user: userId, date: { $gte: weekStart, $lte: date } }),
    Exercise.find({ user: userId, date: { $gte: weekStart, $lte: date } }),
    // Lấy 10 lần ghi cân nặng mới nhất trước.
    WeightLog.find({ user: userId }).sort({ date: -1 }).limit(10),
    PlanMeal.find({ user: userId, date }).sort({ createdAt: 1 }),
    PlanWorkout.find({ user: userId, date }).sort({ createdAt: 1 }),
  ]);

  const todayTotals = sumMacros(todayMeals);
  const totalBurned = todayExercises.reduce((s, e) => s + e.caloriesBurned, 0);
  const loggedDays = new Set(weekMeals.map((m) => m.date));
  const weekTotals = sumMacros(weekMeals);
  const avgCalories = loggedDays.size > 0 ? Math.round(weekTotals.calories / loggedDays.size) : 0;
  const activeDays = new Set(weekExercises.map((e) => e.date)).size;
  const weekBurned = weekExercises.reduce((s, e) => s + e.caloriesBurned, 0);

  // Số ngày mà tài khoản THỰC SỰ có thể ghi món, tính cả hôm nay, tối đa 7.
  // Điểm đều đặn chia cho số này chứ không chia cứng cho 7, vì đòi dữ liệu
  // của những ngày người dùng còn chưa cài app là phạt oan người mới.
  // Giờ tạo tài khoản lấy theo múi giờ máy chủ, lệch tối đa một ngày và đã bị
  // chặn trần 7 nên không ảnh hưởng kết quả.
  const eligibleDays = user?.createdAt
    ? Math.min(7, Math.max(1, daysInclusive(toDateKey(user.createdAt), date)))
    : 7;

  return {
    profile: {
      name: user?.name || "User",
      gender: user?.gender || null,
      age: user?.age || null,
      weight: user?.weight || null,
      height: user?.height || null,
      goal: user?.goal || "maintain_weight",
      activityLevel: user?.activityLevel || "moderate",
      conditions: user?.conditions || [],
      calorieGoal: user?.calorieGoal || null,
      tastePreferences: user?.tastePreferences || "",
      targetWeight: user?.targetWeight || null,
      // Nếu người dùng tự đặt mục tiêu calo mà lệch quá 300 so với mức app tính,
      // thì báo cho AI biết để nhắc nhẹ một lần. Ai để app tự tính thì bỏ qua.
      goalDriftKcal: (() => {
        if (!user?.customGoal) return null;
        const suggested = autoGoal(user);
        if (!suggested) return null;
        if (!user.calorieGoal) return null;
        const drift = suggested - user.calorieGoal;
        return Math.abs(drift) > 300 ? { suggested, drift } : null;
      })(),
      weightTrend: weightLogs.length
        ? {
            latestKg: weightLogs[0].weightKg,
            latestDate: weightLogs[0].date,
            changeKg: Math.round((weightLogs[0].weightKg - weightLogs[weightLogs.length - 1].weightKg) * 10) / 10,
            sinceDate: weightLogs[weightLogs.length - 1].date,
          }
        : null,
    },
    today: {
      date,
      meals: todayMeals.map((m) => ({
        name: m.name,
        mealType: m.mealType,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
      })),
      totals: todayTotals,
      exercises: todayExercises.map((e) => ({
        name: e.name,
        durationMin: e.durationMin,
        caloriesBurned: e.caloriesBurned,
      })),
      totalBurned,
      planMeals: planMeals.map((m) => ({
        name: m.name,
        mealType: m.mealType,
        calories: m.calories,
        done: m.done,
      })),
      planWorkouts: planWorkouts.map((w) => ({
        text: w.text,
        name: w.name,
        category: w.category,
        durationMin: w.durationMin,
        done: w.done,
      })),
    },
    week: {
      loggedDays: loggedDays.size,
      eligibleDays,
      avgCalories,
      workouts: weekExercises.length,
      activeDays,
      burnedKcal: weekBurned,
    },
  };
}

// Viết thành chữ vì AI đọc chữ tự nhiên tốt hơn đọc dữ liệu thô.
function contextToText(ctx) {
  const p = ctx.profile;
  const t = ctx.today;
  const conditions = p.conditions.length ? p.conditions.join(", ") : "none reported";
  const mealsText = t.meals.length
    ? t.meals.map((m) => `  - [${m.mealType}] ${m.name}: ${m.calories} kcal (P${m.protein}/C${m.carbs}/F${m.fat})`).join("\n")
    : "  - (no meals logged yet)";
  const exText = t.exercises.length
    ? t.exercises.map((e) => `  - ${e.name}: ${e.durationMin} min, ${e.caloriesBurned} kcal burned`).join("\n")
    : "  - (no workouts logged)";
  const planMealsText = t.planMeals.length
    ? t.planMeals.map((m) => `  - [${m.mealType}] ${m.name}: ${m.calories} kcal, ${m.done ? "completed" : "planned only"}`).join("\n")
    : "  - (no planned meals)";
  const planWorkoutsText = t.planWorkouts.length
    ? t.planWorkouts.map((w) => `  - ${w.name || w.text || w.category || "home session"}${w.durationMin ? `: ${w.durationMin} min` : ""}, ${w.done ? "completed" : "planned only"}`).join("\n")
    : "  - (no planned exercise)";

  const driftLine = p.goalDriftKcal
    ? `- NOTE: the user's SELF-SET calorie goal (${p.calorieGoal} kcal) differs from the TDEE-based estimate for their current body metrics (~${p.goalDriftKcal.suggested} kcal). At most ONCE, and only if relevant, you may gently suggest reviewing the goal (Settings → Daily calorie goal → "Use auto"). Never insist.`
    : "";

  const weightLine = p.weightTrend
    ? `- Weight trend: ${p.weightTrend.latestKg} kg on ${p.weightTrend.latestDate} (${p.weightTrend.changeKg > 0 ? "+" : ""}${p.weightTrend.changeKg} kg since ${p.weightTrend.sinceDate})${p.targetWeight ? ` — target: ${p.targetWeight} kg` : ""}`
    : p.targetWeight
    ? `- Target weight: ${p.targetWeight} kg (no weight logs yet)`
    : "";

  return `USER PROFILE
- Name: ${p.name}
- Goal: ${p.goal}
- Health conditions: ${conditions}
- Taste preferences (MUST respect — allergies/dislikes): ${p.tastePreferences || "none saved"}
- Daily calorie goal: ${p.calorieGoal} kcal
- Weight: ${p.weight ?? "unknown"} kg, Height: ${p.height ?? "unknown"} cm, Age: ${p.age ?? "unknown"}, Gender: ${p.gender ?? "unknown"}${weightLine ? "\n" + weightLine : ""}${driftLine ? "\n" + driftLine : ""}

TODAY (${t.date})
Meals:
${mealsText}
Totals: ${t.totals.calories} kcal eaten (P${Math.round(t.totals.protein)}/C${Math.round(t.totals.carbs)}/F${Math.round(t.totals.fat)})
Workouts:
${exText}
Calories burned: ${t.totalBurned} kcal
Remaining daily intake: ${p.calorieGoal == null ? "unknown" : p.calorieGoal - t.totals.calories} kcal

WEEKLY PLAN FOR TODAY (planned items are not diary entries)
Meals:
${planMealsText}
Exercise:
${planWorkoutsText}

LAST 7 DAYS
- Days logged: ${ctx.week.loggedDays}/7
- Average calories on logged days: ${ctx.week.avgCalories} kcal
- Workouts: ${ctx.week.workouts} session(s) across ${ctx.week.activeDays} day(s), ${ctx.week.burnedKcal} kcal burned total`;
}

// Bảng dặn AI về năm bệnh nền app hỗ trợ. Được dán vào câu lệnh của
// Coach, gợi ý món và kế hoạch tuần. Đây là LỚP AN TOÀN THỨ NHẤT,
// lớp thứ hai là services/nutrition/foodSafetyFilter chạy sau khi AI trả lời.
const CONDITION_GUIDE =
  "diabetes: low sugar/refined carbs; " +
  "hypertension: low sodium/salty food; " +
  "gout: STRICTLY NO purine-rich foods — organ meats, ALL shellfish (shrimp/tôm, crab/cua, mussels, snails), red meat, beer; " +
  "high_cholesterol: limit saturated/fried fat, prefer lean protein & fiber; " +
  "gastritis: avoid spicy/sour/acidic food, alcohol and coffee, prefer gentle meals";

module.exports = { buildContext, contextToText, CONDITION_GUIDE };
