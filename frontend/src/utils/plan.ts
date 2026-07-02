import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

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

export async function getPlanMeals(
  token: string,
  startDate: string,
  endDate: string
): Promise<{ meals: PlanMeal[]; workouts: Record<string, string> }> {
  const data = await apiRequest(`/plan?startDate=${startDate}&endDate=${endDate}`, "GET", undefined, token);
  // Workouts come as [{date, text}] — index by date for easy per-day lookup
  const workouts: Record<string, string> = {};
  for (const w of data.planWorkouts || []) workouts[w.date] = w.text;
  return { meals: (data.planMeals || []).map(mapPlan), workouts };
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
