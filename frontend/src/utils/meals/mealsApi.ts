import type {
  DailyTotals,
  Meal,
  NewMeal,
  RawMeal,
  UpdateMeal,
} from "@/context/mealTypes";
import { apiRequest } from "../api";

function mapMeal(meal: RawMeal): Meal {
  return {
    id: meal._id,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    mealType: meal.mealType,
    image: meal.image,
    note: meal.note,
    date: meal.date,
    createdAt: meal.createdAt,
  };
}

export async function fetchMealsByDateRequest(
  date: string,
  token: string
): Promise<{ meals: Meal[]; totals: DailyTotals }> {
  const data = await apiRequest<{ meals: RawMeal[]; totals: DailyTotals }>(
    `/meals?date=${date}`,
    "GET",
    undefined,
    token
  );
  return {
    meals: data.meals.map(mapMeal),
    totals: data.totals,
  };
}

export async function fetchMealHistoryRequest(token: string): Promise<Meal[]> {
  const data = await apiRequest<{ meals: RawMeal[] }>(
    "/meals/history",
    "GET",
    undefined,
    token
  );
  return data.meals.map(mapMeal);
}

export async function addMealRequest(meal: NewMeal, token: string): Promise<void> {
  await apiRequest("/meals", "POST", meal, token);
}

export async function updateMealRequest(
  id: string,
  updates: UpdateMeal,
  token: string
): Promise<Meal> {
  const data = await apiRequest<{ meal: RawMeal }>(`/meals/${id}`, "PUT", updates, token);
  return mapMeal(data.meal);
}

export async function deleteMealRequest(id: string, token: string): Promise<void> {
  await apiRequest(`/meals/${id}`, "DELETE", undefined, token);
}
