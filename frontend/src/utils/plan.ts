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

export type NewPlanMeal = {
  name: string;
  mealType: MealType;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  note?: string;
  date: string;
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

export async function addPlanMeal(token: string, input: NewPlanMeal): Promise<PlanMeal> {
  const data = await apiRequest("/plan", "POST", input, token);
  return mapPlan(data.planMeal);
}

export async function deletePlanMeal(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/${id}`, "DELETE", undefined, token);
}

// Marks the planned meal as eaten — backend also logs it to the real diary
export async function markPlanEaten(token: string, id: string): Promise<PlanMeal> {
  const data = await apiRequest(`/plan/${id}/eaten`, "POST", undefined, token);
  return mapPlan(data.planMeal);
}
