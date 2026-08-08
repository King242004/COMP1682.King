// ═══ FILE NÀY LÀM GÌ ═══
// Danh sách địa chỉ backend của phần món ăn. Không giữ state, không tự gọi mạng.
//
// Ai gọi tới: MealsContext, không màn hình nào gọi thẳng vào đây
// Nhận vào:   món cần gửi đi, và thẻ đăng nhập
// Trả ra:     Meal do mealController lưu, đã đổi tên trường cho hợp với app
// Khi lỗi:    ném lỗi lên cho MealsContext, rồi màn hình mới hiện thông báo
//
// File này KHÔNG gọi fetch. Nó nhờ apiRequest bên src/utils/apiClient.ts,
// chỗ đó lo địa chỉ server, thẻ đăng nhập, múi giờ, hạn chờ và lỗi 401.
import type { DailyTotals, Meal, NewMeal, RawMeal, UpdateMeal } from "@/features/meals/mealTypes";
import { apiRequest } from "../../utils/apiClient";
import { withId } from "../../utils/apiTypes";

// Đổi _id của MongoDB thành id. Hàm chung ở src/utils/apiTypes.ts,
// không liệt kê trường nào nên thêm trường mới vào Meal cũng không phải sửa đây.
const mapMeal = (meal: RawMeal): Meal => withId(meal);

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

// Gọi GET /meals/history lấy toàn bộ lịch sử, không giới hạn khoảng ngày
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

// Đường một món. Đi tiếp: src/utils/apiClient.ts, rồi POST /meals
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

// Nút Lưu ở AddMealScreen đi vào đây, tối đa 8 món một lần
// Đi tiếp: src/utils/apiClient.ts, rồi POST /meals/batch
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

// Gọi PUT /meals/:id, trả về món đã sửa để MealsContext thay tại chỗ
export async function updateMealRequest(
  id: string,
  updates: UpdateMeal,
  token: string
): Promise<Meal> {
  const data = await apiRequest<{ meal: RawMeal }>(`/meals/${id}`, "PUT", updates, token);
  return mapMeal(data.meal);
}

// Gọi DELETE /meals/:id
export async function deleteMealRequest(id: string, token: string): Promise<void> {
  await apiRequest(`/meals/${id}`, "DELETE", undefined, token);
}
