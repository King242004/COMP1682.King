// ═══ FILE NÀY LÀM GÌ ═══
// Giữ danh sách món ăn cho toàn app. Mọi màn lấy món bằng useMeals.
//
// Ai gọi tới: Trang chủ, Thêm món, Sửa món, Lịch sử món, Tiến trình
// Nhận vào:   món cần thêm, sửa hoặc xóa, kèm ngày cần xem
// Trả ra:     danh sách món theo ngày, kèm tổng calo và ba chất
// Khi lỗi:    gọi mạng hỏng thì ném lỗi lên cho màn hình tự hiện thông báo,
//             file này không tự hiện gì cả
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useHealthDataRefresh } from "../../context/HealthDataRefreshContext";
import type { DailyTotals, Meal, MealsContextType, NewMeal, UpdateMeal } from "./mealTypes";
import { addMealRequest, addMealsRequest, deleteMealRequest, fetchMealHistoryRequest, fetchMealsByDateRequest, updateMealRequest } from "./mealsApi";

export type { Meal } from "./mealTypes";

// Thân file chia ba khối, mỗi khối tự nói đến từ đâu và đi tiếp đâu
const MealsContext = createContext<MealsContextType | null>(null);

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();

  // Món của ngày đang xem và toàn bộ lịch sử, giữ riêng hai danh sách
  const [meals, setMeals] = useState<Meal[]>([]);
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // ══════════════════════════════════════════════════════════
  // ĐỌC MÓN. Hai hàm đọc thuần
  // Phải nằm trên cùng vì các hàm khối dưới có nhắc tới trong mảng phụ thuộc
  // ══════════════════════════════════════════════════════════

  // Tải món của một ngày, tổng lấy thẳng từ backend chứ không tự cộng ở app
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

  // Lấy toàn bộ lịch sử cho màn Tiến trình và màn Lịch sử món
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

  // ══════════════════════════════════════════════════════════
  // Đến từ AddMealScreen lúc bấm Lưu
  // Đi tiếp: src/features/meals/mealsApi.ts
  // ══════════════════════════════════════════════════════════

  // Đường một món, dùng cho các chỗ chỉ thêm lẻ
  const addMeal = useCallback(async (meal: NewMeal) => {
    if (!token) return;
    // Backend trả luôn CẢ NGÀY kèm tổng mới nên chỉ tốn một lượt mạng
    const day = await addMealRequest(meal, token);
    setMeals(day.meals);
    setDailyTotals(day.totals);
    // Tăng số đếm để Trang chủ, Tiến trình và Coach biết mà tải lại
    markHealthDataChanged();
  }, [markHealthDataChanged, token]);

  // Đường nhiều món, nút Lưu ở AddMealScreen đi vào đây, tối đa 8 món
  const addMeals = useCallback(async (newMeals: NewMeal[]) => {
    if (!token || newMeals.length === 0) return;
    const day = await addMealsRequest(newMeals, token);
    setMeals(day.meals);
    setDailyTotals(day.totals);
    markHealthDataChanged();
  }, [markHealthDataChanged, token]);

  // ══════════════════════════════════════════════════════════
  // SỬA VÀ XÓA. Đến từ EditMealScreen và MealDetailScreen
  // Khác khối trên ở chỗ KHÔNG tải lại cả ngày, mà tự trừ cộng tại chỗ
  // ══════════════════════════════════════════════════════════

  const updateMeal = useCallback(async (id: string, updates: UpdateMeal) => {
    if (!token) return;
    const updated = await updateMealRequest(id, updates, token);
    // Sửa ở cả hai danh sách vì món có thể nằm ở một trong hai
    setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setHistoryMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
    // Tính lại tổng trong ngày nếu món thuộc ngày đang xem
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

  // Xóa món, cũng tự trừ tại chỗ như sửa món
  const deleteMeal = useCallback(async (id: string) => {
    if (!token) return;
    await deleteMealRequest(id, token);
    // Xóa khỏi cả hai danh sách để lịch sử món cập nhật ngay
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

  // Gói bằng useMemo để Provider vẽ lại không kéo mọi màn dùng useMeals vẽ theo
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
