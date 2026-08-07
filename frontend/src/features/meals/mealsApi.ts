// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa MealsContext và backend/src/routes/mealRoutes.js; không giữ state.
//
// Ai gọi tới: MealsContext, không màn hình nào gọi thẳng vào đây
// Nhận vào:   món cần gửi đi, và thẻ đăng nhập
// Trả ra:     Meal do mealController lưu, đã đổi tên trường cho hợp với app
// Khi lỗi:    ném lỗi lên cho MealsContext, rồi màn hình mới hiện thông báo
import type { DailyTotals, Meal, NewMeal, RawMeal, UpdateMeal } from "@/features/meals/mealTypes";
import { apiRequest } from "../../utils/apiClient";

// Backend gọi mã là _id còn app gọi là id, nên phải đổi tên trường ở đây.
// Đổi ở một chỗ duy nhất để các màn hình không phải biết tới _id.
function mapMeal(meal: RawMeal): Meal {
  return {
    id: meal._id,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    portionAmount: meal.portionAmount,
    portionUnit: meal.portionUnit,
    portionText: meal.portionText,
    nutritionSource: meal.nutritionSource,
    mealType: meal.mealType,
    image: meal.image,
    note: meal.note,
    date: meal.date,
    createdAt: meal.createdAt,
  };
}

// ─── ĐỌC NHẬT KÝ ───

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

// Gọi GET /meals/history lấy toàn bộ lịch sử, không giới hạn khoảng ngày.
export async function fetchMealHistoryRequest(token: string): Promise<Meal[]> {
  const data = await apiRequest<{ meals: RawMeal[] }>(
    "/meals/history",
    "GET",
    undefined,
    token
  );
  return data.meals.map(mapMeal);
}

// ─── THÊM, SỬA VÀ XÓA MÓN ───

// Đến từ MealsContext.addMeal. Đường đi tiếp: apiClient → POST /meals.
// mealController.addMeal trả luôn CẢ NGÀY qua readDay, kèm tổng mới,
// nhờ vậy MealsContext không phải gọi thêm một lượt GET nữa.
export async function addMealRequest(
  meal: NewMeal,
  token: string
): Promise<{ meals: Meal[]; totals: DailyTotals }> {
  const data = await apiRequest<{ day: { meals: RawMeal[]; totals: DailyTotals } }>(
    "/meals",
    "POST",
    meal,
    token
  );
  return { meals: data.day.meals.map(mapMeal), totals: data.day.totals };
}

// Bản nhiều món. Đến từ MealsContext.addMeals.
// Đường đi tiếp: apiClient → POST /meals/batch. Cũng trả về cả ngày y như trên.
export async function addMealsRequest(
  meals: NewMeal[],
  token: string
): Promise<{ meals: Meal[]; totals: DailyTotals }> {
  const data = await apiRequest<{ day: { meals: RawMeal[]; totals: DailyTotals } }>(
    "/meals/batch",
    "POST",
    { meals },
    token
  );
  return { meals: data.day.meals.map(mapMeal), totals: data.day.totals };
}

// Gọi PUT /meals/:id. Trả về món sau khi sửa, vì MealsContext cần nó
// để thay tại chỗ trong danh sách mà không phải tải lại từ mạng.
export async function updateMealRequest(
  id: string,
  updates: UpdateMeal,
  token: string
): Promise<Meal> {
  const data = await apiRequest<{ meal: RawMeal }>(`/meals/${id}`, "PUT", updates, token);
  return mapMeal(data.meal);
}

// Gọi DELETE /meals/:id.
export async function deleteMealRequest(id: string, token: string): Promise<void> {
  await apiRequest(`/meals/${id}`, "DELETE", undefined, token);
}
