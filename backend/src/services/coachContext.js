const User = require("../models/User");
const Meal = require("../models/Meal");
const Exercise = require("../models/Exercise");

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
  const [user, todayMeals, todayExercises, weekMeals] = await Promise.all([
    User.findById(userId).select("name gender age weight height goal activityLevel conditions calorieGoal tastePreferences"),
    Meal.find({ user: userId, date }).sort({ createdAt: 1 }),
    Exercise.find({ user: userId, date }).sort({ createdAt: 1 }),
    Meal.find({ user: userId, date: { $gte: weekStart, $lte: date } }),
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

  return `USER PROFILE
- Name: ${p.name}
- Goal: ${p.goal}
- Health conditions: ${conditions}
- Taste preferences (MUST respect — allergies/dislikes): ${p.tastePreferences || "none saved"}
- Daily calorie goal: ${p.calorieGoal} kcal
- Weight: ${p.weight ?? "unknown"} kg, Height: ${p.height ?? "unknown"} cm, Age: ${p.age ?? "unknown"}, Gender: ${p.gender ?? "unknown"}

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
  "gout: avoid purine-rich foods (organ meats, shellfish, red meat, beer); " +
  "high_cholesterol: limit saturated/fried fat, prefer lean protein & fiber; " +
  "gastritis: avoid spicy/sour/acidic food, alcohol and coffee, prefer gentle meals";

module.exports = { buildContext, contextToText, CONDITION_GUIDE };
