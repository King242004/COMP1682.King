import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useHealthData } from "./HealthDataContext";
import type { DailyTotals, Meal, MealsContextType, NewMeal, UpdateMeal } from "./mealTypes";
import { addMealRequest, deleteMealRequest, fetchMealHistoryRequest, fetchMealsByDateRequest, updateMealRequest } from "../utils/meals/mealsApi";

export type { Meal } from "./mealTypes";

const MealsContext = createContext<MealsContextType | null>(null);

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { markHealthDataChanged } = useHealthData();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchMealsByDate = useCallback(async (date: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchMealsByDateRequest(date, token);
      setMeals(data.meals);
      setDailyTotals(data.totals);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchMealHistory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const meals = await fetchMealHistoryRequest(token);
      setHistoryMeals(meals);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addMeal = useCallback(async (meal: NewMeal) => {
    if (!token) return;
    await addMealRequest(meal, token);
    await fetchMealsByDate(meal.date);
    markHealthDataChanged();
  }, [fetchMealsByDate, markHealthDataChanged, token]);

  const updateMeal = useCallback(async (id: string, updates: UpdateMeal) => {
    if (!token) return;
    const updated = await updateMealRequest(id, updates, token);
    // Cập nhật cả danh sách hôm nay và lịch sử vì món có thể nằm ở một trong hai.
    setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setHistoryMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    // Tính lại tổng trong ngày nếu món thuộc ngày đang xem.
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
    markHealthDataChanged();
  }, [markHealthDataChanged, meals, token]);

  const deleteMeal = useCallback(async (id: string) => {
    if (!token) return;
    await deleteMealRequest(id, token);
    // Xóa khỏi cả hai danh sách để lịch sử món cập nhật ngay.
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
    markHealthDataChanged();
  }, [markHealthDataChanged, meals, token]);

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
