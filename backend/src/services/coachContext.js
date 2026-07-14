const User = require("../models/User");
const Meal = require("../models/Meal");
const Exercise = require("../models/Exercise");
const WeightLog = require("../models/WeightLog");
const { autoGoal } = require("./calorieGoal");

// Shift a YYYY-MM-DD string by N days
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

// Assembles the full health context for a user on a given date.
// Returns a structured object the controller uses for both the Health Score
// (deterministic) and the AI prompt (grounding).
async function buildContext(userId, date) {
  // Independent queries — run in parallel to keep AI endpoints snappy
  const weekStart = shiftDate(date, -6); // last 7 days (incl. `date`)
  const [user, todayMeals, todayExercises, weekMeals, weightLogs] = await Promise.all([
    User.findById(userId).select("name gender age weight height goal activityLevel conditions calorieGoal customGoal tastePreferences targetWeight"),
    Meal.find({ user: userId, date }).sort({ createdAt: 1 }),
    Exercise.find({ user: userId, date }).sort({ createdAt: 1 }),
    Meal.find({ user: userId, date: { $gte: weekStart, $lte: date } }),
    WeightLog.find({ user: userId }).sort({ date: -1 }).limit(10), // newest first
  ]);

  const todayTotals = sumMacros(todayMeals);
  const totalBurned = todayExercises.reduce((s, e) => s + e.caloriesBurned, 0);
  const loggedDays = new Set(weekMeals.map((m) => m.date));
  const weekTotals = sumMacros(weekMeals);
  const avgCalories = loggedDays.size > 0 ? Math.round(weekTotals.calories / loggedDays.size) : 0;

  return {
    profile: {
      name: user?.name || "User",
      gender: user?.gender || null,
      age: user?.age || null,
      weight: user?.weight || null,
      height: user?.height || null,
      goal: user?.goal || "eat_healthy",
      activityLevel: user?.activityLevel || "moderate",
      conditions: user?.conditions || [],
      calorieGoal: user?.calorieGoal || 2000,
      tastePreferences: user?.tastePreferences || "",
      targetWeight: user?.targetWeight || null,
      // Custom-goal drift nudge: when the user typed their own goal but their
      // body metrics now suggest a clearly different TDEE-based target (>300
      // kcal apart), the AI may gently suggest reviewing it — never pushy.
      goalDriftKcal: (() => {
        if (!user?.customGoal) return null;
        const suggested = autoGoal(user);
        if (!suggested) return null;
        const drift = suggested - (user.calorieGoal || 2000);
        return Math.abs(drift) > 300 ? { suggested, drift } : null;
      })(),
      // Weight trend from the log (newest first): latest entry + change vs the
      // oldest of the last 10 entries — enough for "you're down 1.2kg" advice
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
    },
    week: {
      loggedDays: loggedDays.size,
      avgCalories,
    },
  };
}

// Compact human-readable block injected into the AI prompt (grounding).
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
Net calories (eaten - burned): ${t.totals.calories - t.totalBurned} kcal

LAST 7 DAYS
- Days logged: ${ctx.week.loggedDays}/7
- Average calories on logged days: ${ctx.week.avgCalories} kcal`;
}

// One-line dietary guidance per supported condition — the SINGLE source every
// AI prompt (coach chat/insight, suggest-meal, weekly plan) appends so a new
// condition only needs to be added here + the FE picker list.
const CONDITION_GUIDE =
  "diabetes: low sugar/refined carbs; " +
  "hypertension: low sodium/salty food; " +
  "gout: STRICTLY NO purine-rich foods — organ meats, ALL shellfish (shrimp/tôm, crab/cua, mussels, snails), red meat, beer; " +
  "high_cholesterol: limit saturated/fried fat, prefer lean protein & fiber; " +
  "gastritis: avoid spicy/sour/acidic food, alcohol and coffee, prefer gentle meals";

module.exports = { buildContext, contextToText, CONDITION_GUIDE };
