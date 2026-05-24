import { createContext, useContext, useState, useCallback } from "react";
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

type MealsContextType = {
  meals: Meal[];
  historyMeals: Meal[];
  dailyTotals: DailyTotals;
  isLoading: boolean;
  fetchMealsByDate: (date: string) => Promise<void>;
  fetchMealHistory: () => Promise<void>;
  addMeal: (meal: NewMeal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};

const MealsContext = createContext<MealsContextType | null>(null);

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
      const data = await apiRequest(`/meals?date=${date}`, "GET", undefined, token);
      const mapped: Meal[] = data.meals.map((m: any) => ({
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
      }));
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
      const data = await apiRequest("/meals/history", "GET", undefined, token);
      const mapped: Meal[] = data.meals.map((m: any) => ({
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
      }));
      setHistoryMeals(mapped);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addMeal = async (meal: NewMeal) => {
    if (!token) return;
    await apiRequest("/meals", "POST", meal, token);
    await fetchMealsByDate(meal.date);
  };

  const deleteMeal = async (id: string) => {
    if (!token) return;
    await apiRequest(`/meals/${id}`, "DELETE", undefined, token);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    setDailyTotals((prev) => {
      const deleted = meals.find((m) => m.id === id);
      if (!deleted) return prev;
      return {
        calories: prev.calories - deleted.calories,
        protein: prev.protein - deleted.protein,
        carbs: prev.carbs - deleted.carbs,
        fat: prev.fat - deleted.fat,
      };
    });
  };

  return (
    <MealsContext.Provider value={{ meals, historyMeals, dailyTotals, isLoading, fetchMealsByDate, fetchMealHistory, addMeal, deleteMeal }}>
      {children}
    </MealsContext.Provider>
  );
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used within MealsProvider");
  return ctx;
}
