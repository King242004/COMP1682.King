import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/api";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type PlanMeal = {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  date: string;
  done: boolean;
};

// Map backend (_id) → frontend (id) shape
function mapPlan(p: any): PlanMeal {
  return {
    id: p._id,
    name: p.name,
    mealType: p.mealType,
    calories: p.calories,
    protein: p.protein,
    carbs: p.carbs,
    fat: p.fat,
    note: p.note,
    date: p.date,
    done: p.done,
  };
}

// AI workout suggestion for one planned day. Structured fields (name/met/
// durationMin) power the one-tap "✓ Done" — rest days carry text only.
export type PlanDayWorkout = {
  id: string;
  date: string;
  text: string;
  name: string | null;
  met: number | null;
  durationMin: number | null;
  done: boolean;
};

function mapWorkout(w: any): PlanDayWorkout {
  return {
    id: w._id || "",
    date: w.date,
    text: w.text,
    name: w.name ?? null,
    met: w.met ?? null,
    durationMin: w.durationMin ?? null,
    done: !!w.done,
  };
}

export async function getPlanMeals(
  token: string,
  startDate: string,
  endDate: string
): Promise<{ meals: PlanMeal[]; workouts: Record<string, PlanDayWorkout> }> {
  const data = await apiRequest(`/plan?startDate=${startDate}&endDate=${endDate}`, "GET", undefined, token);
  // Index workouts by date for easy per-day lookup
  const workouts: Record<string, PlanDayWorkout> = {};
  for (const w of data.planWorkouts || []) workouts[w.date] = mapWorkout(w);
  return { meals: (data.planMeals || []).map(mapPlan), workouts };
}

// One-tap confirm of the AI-suggested workout → creates a real Exercise entry
export async function markPlanWorkoutDone(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/workout/${id}/done`, "POST", undefined, token);
}

// Ask the AI to generate the range (meals + daily workout tip). REPLACES the range.
// `note` = optional taste preferences ("không ăn hải sản, thích gà"...).
export async function generateWeekPlan(
  token: string,
  startDate: string,
  endDate: string,
  language: string,
  note?: string
): Promise<void> {
  await apiRequest("/plan/generate", "POST", { startDate, endDate, language, note }, token);
}

export type GroceryGroup = { name: string; items: string[] };

// AI grocery shopping list built from the planned meals in the range.
export async function getGroceryList(
  token: string,
  startDate: string,
  endDate: string,
  language: string
): Promise<GroceryGroup[]> {
  const data = await apiRequest("/plan/grocery", "POST", { startDate, endDate, language }, token);
  return data.groups || [];
}

// ─── Plan week cache (AsyncStorage) ───────────────────────────────────────────
// Stale-while-revalidate: the weekly screen paints the cached week instantly and
// refreshes from the network in the background — no more staring at a spinner.
export type PlanWeekCache = { meals: PlanMeal[]; workouts: Record<string, PlanDayWorkout> };

const planWeekKey = (weekStart: string) => `plan_week_${weekStart}`;

export async function getCachedPlanWeek(weekStart: string): Promise<PlanWeekCache | null> {
  try {
    const raw = await AsyncStorage.getItem(planWeekKey(weekStart));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanWeekCache;
    // Legacy cache entries stored workouts as plain strings — normalize
    for (const [date, w] of Object.entries(parsed.workouts || {})) {
      if (typeof w === "string") {
        parsed.workouts[date] = { id: "", date, text: w, name: null, met: null, durationMin: null, done: false };
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function cachePlanWeek(weekStart: string, cache: PlanWeekCache): Promise<void> {
  try {
    await AsyncStorage.setItem(planWeekKey(weekStart), JSON.stringify(cache));
  } catch {
    // ignore cache write failures
  }
}

// ─── Grocery cache (AsyncStorage) ─────────────────────────────────────────────
// The list costs 1 Gemini request, so it persists per (week + language) together
// with the user's tick state. `sig` = signature of the plan it was built from —
// when the plan changes the signature stops matching and the cache is ignored.
export type GroceryCache = { groups: GroceryGroup[]; checked: Record<string, boolean>; sig: string };

const groceryCacheKey = (weekStart: string, language: string) => `grocery_${weekStart}_${language}`;

export async function getCachedGrocery(weekStart: string, language: string): Promise<GroceryCache | null> {
  try {
    const raw = await AsyncStorage.getItem(groceryCacheKey(weekStart, language));
    return raw ? (JSON.parse(raw) as GroceryCache) : null;
  } catch {
    return null;
  }
}

export async function cacheGrocery(weekStart: string, language: string, cache: GroceryCache): Promise<void> {
  try {
    await AsyncStorage.setItem(groceryCacheKey(weekStart, language), JSON.stringify(cache));
  } catch {
    // ignore cache write failures
  }
}

export async function deletePlanMeal(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/${id}`, "DELETE", undefined, token);
}

// Marks the planned meal as eaten — backend also logs it to the real diary
export async function markPlanEaten(token: string, id: string): Promise<PlanMeal> {
  const data = await apiRequest(`/plan/${id}/eaten`, "POST", undefined, token);
  return mapPlan(data.planMeal);
}
