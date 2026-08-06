import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useHealthDataRefresh } from "../../context/HealthDataRefreshContext";
import type { DailyTotals, Meal, MealsContextType, NewMeal, UpdateMeal } from "./mealTypes";
import { addMealRequest, addMealsRequest, deleteMealRequest, fetchMealHistoryRequest, fetchMealsByDateRequest, updateMealRequest } from "./mealsApi";

export type { Meal } from "./mealTypes";

// File này giữ danh sách món cho toàn app. Mọi màn lấy món bằng useMeals.
// LUỒNG THÊM MÓN, xem cả chuỗi ở đây
// 1. AddMealScreen bấm Lưu
// 2. addMeal trong file này
// 3. mealsApi.addMealRequest   (POST /meals)
// 4. backend mealController.addMeal, lưu xuống MongoDB
// 5. fetchMealsByDate tải lại đúng ngày vừa thêm
// 6. markHealthDataChanged tăng số đếm
// 7. Trang chủ, Tiến trình và Coach thấy số đếm đổi nên tự tải lại
// Vì sao thêm xong phải tải lại cả ngày: backend tính sẵn tổng calo và ba chất,
// tự cộng ở app dễ lệch với con số backend đưa cho Coach.
// Sửa và xóa thì KHÔNG tải lại, mà tự trừ cộng tại chỗ cho nhanh.
const MealsContext = createContext<MealsContextType | null>(null);

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();
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

  // Lấy toàn bộ lịch sử món, giữ riêng ở historyMeals chứ không trộn vào meals.
  // Màn Tiến trình và màn Lịch sử món dùng danh sách này.
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

  const addMeals = useCallback(async (newMeals: NewMeal[]) => {
    if (!token || newMeals.length === 0) return;
    await addMealsRequest(newMeals, token);
    await fetchMealsByDate(newMeals[0].date);
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

  // Gói lại bằng useMemo để mỗi lần Provider vẽ lại không tạo object mới,
  // tránh làm mọi màn dùng useMeals vẽ lại theo một cách vô ích.
  const value = useMemo(() => ({
    meals,
    historyMeals,
    dailyTotals,
    isLoading,
    fetchMealsByDate,
    fetchMealHistory,
    addMeal,
    addMeals,
    updateMeal,
    deleteMeal,
  }), [
    addMeal,
    addMeals,
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
