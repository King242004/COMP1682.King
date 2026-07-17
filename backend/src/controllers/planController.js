const PlanMeal = require("../models/PlanMeal");
const PlanWorkout = require("../models/PlanWorkout");
const Meal = require("../models/Meal");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const { insightModels } = require("../config/gemini");
const { generateWithFallback } = require("../services/aiGenerate");
const { CONDITION_GUIDE } = require("../services/coachContext");
const { filterDishes } = require("../services/conditionFilter");

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// Local YYYY-MM-DD for "today" — string compare works for date keys
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Add Plan Meal ──────────────────────────────────────────────────────────
exports.addPlanMeal = async (req, res) => {
  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (!name || !mealType || calories === undefined || !date)
    return res.status(400).json({ message: "Name, mealType, calories and date are required." });

  if (!MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  const planMeal = await PlanMeal.create({
    user: req.user.id,
    name: name.trim(),
    mealType,
    calories,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    note: note || "",
    date,
  });

  res.status(201).json({ message: "Planned meal added.", planMeal });
};

// ─── Get Plan Meals by date range ───────────────────────────────────────────
// Returns flat list for the range (+ AI workout suggestions per day).
exports.getPlanMeals = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { user: req.user.id };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  // Parallel — the two collections are independent
  const [planMeals, planWorkouts] = await Promise.all([
    PlanMeal.find(filter).sort({ date: 1, createdAt: 1 }),
    PlanWorkout.find(filter).sort({ date: 1 }),
  ]);
  res.json({ planMeals, planWorkouts });
};

// ─── Generate a week plan with AI (POST /api/plan/generate) ──────────────────
// body: { startDate, endDate, language } — REPLACES the whole range with an
// AI-generated Vietnamese-friendly menu + one workout suggestion per day,
// tailored to the user's goal, calorie target and health conditions.
exports.generatePlan = async (req, res) => {
  const { startDate, endDate, language, note } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || ""))
    return res.status(400).json({ message: "startDate and endDate must be YYYY-MM-DD." });

  // Explicit date list so the model can't drift outside the requested week
  const dates = [];
  const cur = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  while (cur <= end && dates.length < 14) {
    dates.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`);
    cur.setDate(cur.getDate() + 1);
  }
  if (dates.length === 0) return res.status(400).json({ message: "Invalid date range." });

  try {
    const user = await User.findById(req.user.id).select("gender age weight height goal activityLevel conditions calorieGoal tastePreferences");
    const conditions = user?.conditions?.length ? user.conditions.join(", ") : "none";
    const goalCal = user?.calorieGoal || 2000;
    const langName = language === "vi" ? "Vietnamese (tiếng Việt)" : "English";
    // Saved profile preferences + this-generation note, deduped into one directive
    const prefs = [user?.tastePreferences, note]
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .join("; ")
      .slice(0, 300);

    const prompt = `You are a nutrition and fitness coach creating a personalized weekly plan.

USER PROFILE:
- Goal: ${user?.goal || "eat_healthy"} | Daily calorie target: ${goalCal} kcal
- Health conditions: ${conditions} (${CONDITION_GUIDE})
- Weight: ${user?.weight ?? "unknown"} kg, Height: ${user?.height ?? "unknown"} cm, Age: ${user?.age ?? "unknown"}, Gender: ${user?.gender ?? "unknown"}, Activity: ${user?.activityLevel || "moderate"}

REQUIREMENTS:
- Plan meals for EXACTLY these dates: ${dates.join(", ")}
- "name" must be a SHORT dish name only, at most 6 words. NO cooking notes, NO parentheses, NO instructions in the name (write "Cơm gạo lứt cá kho", NOT "Cơm gạo lứt, cá thu sốt cà chua (ít muối, không đường)"). The health adjustments are implied by your dish CHOICE, not written in the name.
- Each day: breakfast, lunch, dinner and optionally one snack. Daily total within ±10% of ${goalCal} kcal.
- Prefer common Vietnamese dishes that are easy to cook or buy. Vary dishes across the week — do not repeat the same dish two days in a row.
- Adjust every dish choice to the health conditions above.
- HARD CONSTRAINT: NO dish may contain ANY ingredient the health conditions forbid (per the guide above). Example: gout → absolutely no shrimp/tôm, crab, shellfish, organ meats, red meat. Before finalizing each dish, CHECK its ingredients against the conditions; when in doubt, pick a safer dish.
- Also give ONE workout suggestion per day suited to the user's conditions and goal; a rest day is allowed. "workout" is an OBJECT: "text" = friendly one-liner (max ~15 words); "name" = short activity name only (max 4 words, e.g. "Đi bộ nhanh"); "met" = realistic MET value (2-12); "durationMin" = 10-90. On a REST day set "rest": true and give only "text".
- Never use the em dash character (—) in any text; use a comma instead.
- Write dish names and workout text in ${langName}.${
      prefs
        ? `\n- USER FOOD PREFERENCES (MUST follow strictly — avoid disliked/allergy foods): ${prefs}`
        : ""
    }

Return ONLY valid JSON:
{"days":[{"date":"YYYY-MM-DD","workout":{"text":"...","name":"...","met":0,"durationMin":0,"rest":false},"meals":[{"name":"...","mealType":"breakfast|lunch|dinner|snack","calories":0,"protein":0,"carbs":0,"fat":0}]}]}`;

    const result = await generateWithFallback(insightModels, prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return res.status(500).json({ message: "AI returned an invalid plan. Please try again." });
    }

    // Validate + normalize every generated item before touching the DB
    const num = (v) => Math.max(0, Math.round(Number(v) || 0));
    const mealDocs = [];
    const workoutDocs = [];
    for (const day of Array.isArray(parsed.days) ? parsed.days : []) {
      if (!dates.includes(day?.date)) continue;
      for (const m of Array.isArray(day.meals) ? day.meals : []) {
        if (!m?.name || m.calories == null) continue;
        mealDocs.push({
          user: req.user.id,
          name: String(m.name).trim().slice(0, 100),
          mealType: MEAL_TYPES.includes(m.mealType) ? m.mealType : "snack",
          calories: num(m.calories),
          protein: num(m.protein),
          carbs: num(m.carbs),
          fat: num(m.fat),
          date: day.date,
        });
      }
      // Workout: object with structured fields (one-tap logging) — tolerate the
      // old plain-string form; rest days store text only (no loggable fields)
      const w = day.workout;
      if (w) {
        const text = String((typeof w === "object" ? w.text : w) || "").trim().slice(0, 200);
        if (text) {
          const met = Number(w.met);
          const dur = Math.round(Number(w.durationMin));
          const structured =
            typeof w === "object" && !w.rest && w.name && met >= 1.5 && met <= 15 && dur >= 5 && dur <= 180;
          workoutDocs.push({
            user: req.user.id,
            date: day.date,
            text,
            name: structured ? String(w.name).trim().slice(0, 60) : null,
            met: structured ? Math.round(met * 10) / 10 : null,
            durationMin: structured ? dur : null,
          });
        }
      }
    }
    // Layer-2 safety: deterministically drop any dish that violates the user's
    // health conditions (the prompt is layer 1 — this guarantees it)
    const { kept: safeMealDocs, removed } = filterDishes(mealDocs, user?.conditions || []);
    if (removed.length)
      console.warn("Plan condition-filter removed:", removed.map((r) => `${r.name} (${r.condition})`).join(", "));

    if (safeMealDocs.length === 0)
      return res.status(500).json({ message: "AI plan came back empty. Please try again." });

    // Replace the whole week (user confirmed in the app before calling this)
    const range = { user: req.user.id, date: { $gte: startDate, $lte: endDate } };
    await PlanMeal.deleteMany(range);
    await PlanWorkout.deleteMany(range);
    await PlanMeal.insertMany(safeMealDocs);
    if (workoutDocs.length) await PlanWorkout.insertMany(workoutDocs);

    res.json({ message: "Plan generated.", meals: safeMealDocs.length, workouts: workoutDocs.length });
  } catch (err) {
    console.error("Plan generate error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Failed to generate the plan. Please try again." });
  }
};

// ─── Grocery list from the planned week (POST /api/plan/grocery) ─────────────
// body: { startDate, endDate, language } — AI turns the planned dishes into a
// one-person shopping list grouped by category with estimated quantities.
exports.groceryList = async (req, res) => {
  const { startDate, endDate, language } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || ""))
    return res.status(400).json({ message: "startDate and endDate must be YYYY-MM-DD." });

  const meals = await PlanMeal.find({ user: req.user.id, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
  if (meals.length === 0)
    return res.status(400).json({ message: "No planned meals in this range yet." });

  const langName = language === "vi" ? "Vietnamese (tiếng Việt)" : "English";
  const dishLines = meals.map((m) => `- ${m.date} (${m.mealType}): ${m.name}`).join("\n");

  const prompt = `You are helping ONE person shop for the meals they planned this week.

PLANNED DISHES:
${dishLines}

Create a realistic grocery shopping list for ONE person to cook these dishes at home:
- Combine duplicate ingredients across dishes into one line with a total estimated quantity (e.g. "500g thịt bò").
- Group items into 3-5 sensible categories (e.g. meat/fish, vegetables & herbs, dry goods & spices, others).
- Assume a Vietnamese market/supermarket; skip water and basic items everyone has (salt, cooking oil) unless a dish needs something special.
- Keep it concise: quantities are rough estimates for one person.
- Never use the em dash character (—) in any text.
- Write everything in ${langName}.

Return ONLY valid JSON:
{"groups":[{"name":"<category>","items":["<quantity + ingredient>", "..."]}]}`;

  try {
    const result = await generateWithFallback(insightModels, prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return res.status(500).json({ message: "AI returned an invalid list. Please try again." });
    }
    const groups = (Array.isArray(parsed.groups) ? parsed.groups : [])
      .filter((g) => g && g.name && Array.isArray(g.items))
      .map((g) => ({ name: String(g.name).slice(0, 60), items: g.items.map((s) => String(s).slice(0, 120)).slice(0, 30) }));
    if (groups.length === 0)
      return res.status(500).json({ message: "AI list came back empty. Please try again." });
    res.json({ groups });
  } catch (err) {
    console.error("Grocery list error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Failed to build the grocery list." });
  }
};

// ─── Update Plan Meal ───────────────────────────────────────────────────────
exports.updatePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to update this planned meal." });

  const { name, mealType, calories, protein, carbs, fat, note, date } = req.body;

  if (mealType !== undefined && !MEAL_TYPES.includes(mealType))
    return res.status(400).json({ message: "mealType must be breakfast, lunch, dinner or snack." });

  if (calories !== undefined && calories < 0)
    return res.status(400).json({ message: "Calories must be a positive number." });

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  if (name !== undefined) planMeal.name = name.trim();
  if (mealType !== undefined) planMeal.mealType = mealType;
  if (calories !== undefined) planMeal.calories = calories;
  if (protein !== undefined) planMeal.protein = protein || 0;
  if (carbs !== undefined) planMeal.carbs = carbs || 0;
  if (fat !== undefined) planMeal.fat = fat || 0;
  if (note !== undefined) planMeal.note = note;
  if (date !== undefined) planMeal.date = date;

  await planMeal.save();
  res.json({ message: "Planned meal updated.", planMeal });
};

// ─── Delete Plan Meal ───────────────────────────────────────────────────────
exports.deletePlanMeal = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this planned meal." });

  await planMeal.deleteOne();
  res.json({ message: "Planned meal deleted." });
};

// ─── Mark plan workout done ─────────────────────────────────────────────────
// One-tap confirm of the AI-suggested workout: creates a REAL Exercise entry
// (calorie burn from the user's current weight) and flips `done`. Mirrors the
// meal markEaten rules: owner-only, idempotent, never for a future day.
exports.markWorkoutDone = async (req, res) => {
  const pw = await PlanWorkout.findById(req.params.id);
  if (!pw) return res.status(404).json({ message: "Planned workout not found." });
  if (pw.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });
  if (pw.done) return res.status(400).json({ message: "Already marked as done." });
  if (!pw.name || !pw.met || !pw.durationMin)
    return res.status(400).json({ message: "This day has no loggable workout." });
  if (pw.date > todayKey())
    return res.status(400).json({ message: "Cannot complete a future workout." });

  const user = await User.findById(req.user.id).select("weight");
  const w = user?.weight > 0 ? user.weight : 60;
  const caloriesBurned = Math.round(pw.met * w * (pw.durationMin / 60));

  const exercise = await Exercise.create({
    user: req.user.id,
    name: pw.name,
    met: pw.met,
    durationMin: pw.durationMin,
    caloriesBurned,
    date: pw.date,
  });

  pw.done = true;
  await pw.save();

  res.json({ message: "Workout logged.", planWorkout: pw, exercise });
};

// ─── Mark as eaten ──────────────────────────────────────────────────────────
// Flips `done` and copies the planned meal into the real diary as a Meal.
// Idempotent: if already done, we don't create a duplicate Meal log.
exports.markEaten = async (req, res) => {
  const planMeal = await PlanMeal.findById(req.params.id);

  if (!planMeal) return res.status(404).json({ message: "Planned meal not found." });

  if (planMeal.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized." });

  if (planMeal.done)
    return res.status(400).json({ message: "This meal is already marked as eaten." });

  // Time rule: the diary records the past — a FUTURE planned meal cannot be
  // "eaten" yet (would create a future-dated diary entry, which mealController
  // itself forbids). Mirrors the meal add/update guards.
  if (planMeal.date > todayKey())
    return res.status(400).json({ message: "Cannot mark a future planned meal as eaten." });

  const meal = await Meal.create({
    user: req.user.id,
    name: planMeal.name,
    mealType: planMeal.mealType,
    calories: planMeal.calories,
    protein: planMeal.protein,
    carbs: planMeal.carbs,
    fat: planMeal.fat,
    note: planMeal.note,
    date: planMeal.date,
  });

  planMeal.done = true;
  await planMeal.save();

  res.json({ message: "Marked as eaten and logged to diary.", planMeal, meal });
};
