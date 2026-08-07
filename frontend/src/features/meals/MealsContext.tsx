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

// Thân file chia làm ba khối theo luồng. Mỗi khối tự nói đến từ đâu, đi tiếp đâu.
const MealsContext = createContext<MealsContextType | null>(null);

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // ══════════════════════════════════════════════════════════
  // ĐỌC MÓN
  //
  // Hai hàm đọc thuần, chưa thuộc luồng nào cả.
  // Nhớ: chúng buộc phải nằm trên cùng, vì các hàm ở khối dưới có nhắc tới
  // fetchMealsByDate trong mảng phụ thuộc.

  // Tải danh sách món của một ngày, kèm tổng calo với ba chất.
  // Trang chủ gọi mỗi khi đổi ngày đang xem. Khối B cũng gọi lại sau khi thêm món.
  // Vì sao lấy tổng từ response thay vì tự cộng: mealController.readDay
  // cộng sẵn rồi, và Coach cũng lấy số từ đó. Tự cộng ở app là dễ lệch với nó.
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

  // ══════════════════════════════════════════════════════════
  // LƯU MÓN
  //
  // Đến từ AddMealScreen.tsx, lúc bấm nút Lưu.
  // Bốn bước, đọc từ trên xuống là đúng thứ tự.
  // Xong thì Trang chủ, Tiến trình và Coach thấy số đếm đổi nên tự tải lại.
  // ══════════════════════════════════════════════════════════

  // LƯU MÓN BƯỚC 1. AddMealScreen bấm Lưu là gọi vào đây, cho một món.
  const addMeal = useCallback(async (meal: NewMeal) => {
    if (!token) return;
    // LƯU MÓN BƯỚC 2. mealsApi.addMealRequest → POST /meals
    // → mealController.addMeal ghi MongoDB rồi gọi readDay để trả cả ngày.
    // Nhờ vậy chỉ tốn một lượt mạng, không phải gọi thêm lượt GET để lấy tổng.
    const day = await addMealRequest(meal, token);
    // LƯU MÓN BƯỚC 3. Đặt thẳng cả ngày vào state, không gọi mạng nữa.
    setMeals(day.meals);
    setDailyTotals(day.totals);
    // LƯU MÓN BƯỚC 4. Tăng số đếm để Trang chủ, Tiến trình và Coach biết mà tải lại.
    markHealthDataChanged();
  }, [markHealthDataChanged, token]);

  // Bản nhiều món của addMeal. Một lần lưu ghi được tối đa 8 món.
  // Cả 8 món cùng ngày nên mealController.addMeals chỉ gọi readDay cho ngày đó.
  const addMeals = useCallback(async (newMeals: NewMeal[]) => {
    if (!token || newMeals.length === 0) return;
    const day = await addMealsRequest(newMeals, token);
    setMeals(day.meals);
    setDailyTotals(day.totals);
    markHealthDataChanged();
  }, [markHealthDataChanged, token]);

  // ══════════════════════════════════════════════════════════
  // SỬA VÀ XÓA
  //
  // Đến từ EditMealScreen.tsx và MealDetailScreen.tsx.
  // Khác khối B ở chỗ: sửa với xóa KHÔNG tải lại cả ngày, mà tự trừ cộng tại chỗ.
  // Làm vậy cho nhanh, vì sửa một món thì mình đã biết đúng số cũ và số mới.
  // ══════════════════════════════════════════════════════════

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

  // Xóa món. Cũng tự trừ tại chỗ như sửa món, không tải lại cả ngày.
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
