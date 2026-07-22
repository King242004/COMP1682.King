import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../utils/api";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  image?: string | null;
  note?: string;
  date: string;
  createdAt: string;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type NewMeal = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  note?: string;
  image?: string | null;
};

// Partial type for updates — every field optional since user may only change a few
type UpdateMeal = Partial<NewMeal>;
type RawMeal = Omit<Meal, "id"> & { _id: string };

type MealsContextType = {
  meals: Meal[];
  historyMeals: Meal[];
  dailyTotals: DailyTotals;
  isLoading: boolean;
  fetchMealsByDate: (date: string) => Promise<void>;
  fetchMealHistory: () => Promise<void>;
  addMeal: (meal: NewMeal) => Promise<void>;
  updateMeal: (id: string, updates: UpdateMeal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};

const MealsContext = createContext<MealsContextType | null>(null);

// Map backend response (Mongo _id) to frontend shape (id). Single source used by
// every fetch/update handler.
function mapMeal(m: RawMeal): Meal {
  return {
    id: m._id,
    name: m.name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    mealType: m.mealType,
    image: m.image,
    note: m.note,
    date: m.date,
    createdAt: m.createdAt,
  };
}

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchMealsByDate = useCallback(async (date: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<{ meals: RawMeal[]; totals: DailyTotals }>(`/meals?date=${date}`, "GET", undefined, token);
      const mapped: Meal[] = data.meals.map(mapMeal);
      setMeals(mapped);
      setDailyTotals(data.totals);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchMealHistory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<{ meals: RawMeal[] }>("/meals/history", "GET", undefined, token);
      const mapped: Meal[] = data.meals.map(mapMeal);
      setHistoryMeals(mapped);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addMeal = useCallback(async (meal: NewMeal) => {
    if (!token) return;
    await apiRequest("/meals", "POST", meal, token);
    await fetchMealsByDate(meal.date);
  }, [fetchMealsByDate, token]);

  const updateMeal = useCallback(async (id: string, updates: UpdateMeal) => {
    if (!token) return;
    const data = await apiRequest<{ meal: RawMeal }>(`/meals/${id}`, "PUT", updates, token);
    const updated = mapMeal(data.meal);
    // Update in both today's list and history list (meal might exist in either)
    setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setHistoryMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    // Recompute daily totals if the meal is in today's view
    setDailyTotals((prev) => {
      const old = meals.find((m) => m.id === id);
      if (!old) return prev;
      return {
        calories: prev.calories - old.calories + updated.calories,
        protein: prev.protein - old.protein + updated.protein,
        carbs: prev.carbs - old.carbs + updated.carbs,
        fat: prev.fat - old.fat + updated.fat,
      };
    });
  }, [meals, token]);

  const deleteMeal = useCallback(async (id: string) => {
    if (!token) return;
    await apiRequest(`/meals/${id}`, "DELETE", undefined, token);
    // Remove from BOTH lists so meal-history refreshes immediately (bug B fix)
    const deleted = meals.find((m) => m.id === id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    setHistoryMeals((prev) => prev.filter((m) => m.id !== id));
    setDailyTotals((prev) => {
      if (!deleted) return prev;
      return {
        calories: prev.calories - deleted.calories,
        protein: prev.protein - deleted.protein,
        carbs: prev.carbs - deleted.carbs,
        fat: prev.fat - deleted.fat,
      };
    });
  }, [meals, token]);

  const value = useMemo(() => ({
    meals,
    historyMeals,
    dailyTotals,
    isLoading,
    fetchMealsByDate,
    fetchMealHistory,
    addMeal,
    updateMeal,
    deleteMeal,
  }), [
    addMeal,
    dailyTotals,
    deleteMeal,
    fetchMealHistory,
    fetchMealsByDate,
    historyMeals,
    isLoading,
    meals,
    updateMeal,
  ]);

  return (
    <MealsContext.Provider value={value}>
      {children}
    </MealsContext.Provider>
  );
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used within MealsProvider");
  return ctx;
}
