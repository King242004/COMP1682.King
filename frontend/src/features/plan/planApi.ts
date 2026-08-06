// ═══ FILE NÀY LÀM GÌ ═══
// Chặng giữa màn Kế hoạch tuần và backend, có lưu tạm kế hoạch và danh sách đi chợ.
//
// Ai gọi tới: WeeklyPlanScreen
// Nhận vào:   phạm vi ngày, ghi chú khẩu vị, và các thao tác trên món kế hoạch
// Trả ra:     kế hoạch của cả tuần, hoặc danh sách đi chợ
// Khi lỗi:    AI hết lượt thì trả QUOTA. Chưa đủ hồ sơ thì trả PROFILE_INCOMPLETE

// Ngoài gọi mạng, nó còn lo lưu tạm kế hoạch tuần và danh sách đi chợ
// trong bộ nhớ máy, để mở lại không phải chờ và không tốn lượt gọi AI.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/apiClient";
import { ROUTINE_CATEGORIES, type RoutineCategory } from "@/features/exercise/guidedRoutines";

const AI_TIMEOUT_MS = 120_000;

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
type RawPlanMeal = Omit<PlanMeal, "id"> & { _id: string };

export type PlanDayWorkout = {
  id: string;
  date: string;
  category: RoutineCategory;
  durationMin: number;
  done: boolean;
};
type RawPlanWorkout = {
  _id: string;
  date: string;
  category?: string | null;
  durationMin?: number | null;
  done?: boolean;
};

// Đổi dữ liệu backend dùng `_id` sang dạng frontend dùng `id`.
function mapPlan(p: RawPlanMeal): PlanMeal {
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

function mapWorkout(workout: RawPlanWorkout): PlanDayWorkout | null {
  if (
    !ROUTINE_CATEGORIES.includes(workout.category as RoutineCategory) ||
    !Number.isFinite(workout.durationMin)
  ) return null;
  return {
    id: workout._id,
    date: workout.date,
    category: workout.category as RoutineCategory,
    durationMin: workout.durationMin as number,
    done: Boolean(workout.done),
  };
}

// Lấy kế hoạch của một khoảng ngày. Gọi GET /plan.
// Trả về các món dự định trong khoảng ngày.
export async function getPlanMeals(
  token: string,
  startDate: string,
  endDate: string
): Promise<{ meals: PlanMeal[]; workouts: Record<string, PlanDayWorkout> }> {
  const data = await apiRequest<{ planMeals: RawPlanMeal[]; planWorkouts?: RawPlanWorkout[] }>(
    `/plan?startDate=${startDate}&endDate=${endDate}`,
    "GET",
    undefined,
    token
  );
  const workoutList = (data.planWorkouts || [])
    .map(mapWorkout)
    .filter((workout): workout is PlanDayWorkout => workout !== null);
  return {
    meals: (data.planMeals || []).map(mapPlan),
    workouts: Object.fromEntries(workoutList.map((workout) => [workout.date, workout])),
  };
}

// Yêu cầu AI tạo thực đơn cho khoảng ngày, thay thế kế hoạch cũ trong khoảng đó.
// `note` là sở thích ăn uống không bắt buộc, ví dụ "không ăn hải sản, thích gà".
export async function generateWeekPlan(
  token: string,
  startDate: string,
  endDate: string,
  language: string,
  note?: string
): Promise<void> {
  await apiRequest(
    "/plan/generate",
    "POST",
    { startDate, endDate, language, note },
    token,
    { timeoutMs: AI_TIMEOUT_MS }
  );
}

export type GroceryGroup = { name: string; items: string[] };

// Danh sách mua sắm do AI tạo từ các món trong khoảng kế hoạch.
export async function getGroceryList(
  token: string,
  startDate: string,
  endDate: string,
  language: string
): Promise<GroceryGroup[]> {
  const data = await apiRequest(
    "/plan/grocery",
    "POST",
    { startDate, endDate, language },
    token,
    { timeoutMs: AI_TIMEOUT_MS }
  );
  return data.groups || [];
}

// Bộ nhớ tạm kế hoạch tuần trong AsyncStorage.
// Màn tuần hiện dữ liệu cũ ngay, sau đó âm thầm tải dữ liệu mới từ mạng.
export type PlanWeekCache = {
  meals: PlanMeal[];
  workouts: Record<string, PlanDayWorkout>;
};

const planWeekKey = (weekStart: string) => `plan_week_${weekStart}`;

// Đọc kế hoạch tuần đã lưu trong máy, để hiện ngay khi mở màn.
export async function getCachedPlanWeek(weekStart: string): Promise<PlanWeekCache | null> {
  try {
    const raw = await AsyncStorage.getItem(planWeekKey(weekStart));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanWeekCache;
    return { meals: parsed.meals || [], workouts: parsed.workouts || {} };
  } catch {
    return null;
  }
}

// Lưu kế hoạch tuần vào máy.
export async function cachePlanWeek(weekStart: string, cache: PlanWeekCache): Promise<void> {
  try {
    await AsyncStorage.setItem(planWeekKey(weekStart), JSON.stringify(cache));
  } catch {
  // Lỗi ghi bộ nhớ tạm không được làm hỏng luồng chính.
  }
}

// Bộ nhớ tạm danh sách mua sắm trong AsyncStorage.
// Mỗi danh sách tốn một lượt gọi Gemini nên được lưu theo tuần và ngôn ngữ,
// kèm trạng thái đã đánh dấu của người dùng. `sig` là dấu nhận diện kế hoạch.
// Khi kế hoạch đổi, dấu này không còn khớp nên dữ liệu cũ sẽ bị bỏ qua.
export type GroceryCache = { groups: GroceryGroup[]; checked: Record<string, boolean>; sig: string };

const groceryCacheKey = (weekStart: string, language: string) => `grocery_${weekStart}_${language}`;

// Đọc danh sách đi chợ đã lưu, kèm các dòng đã tích.
// Chỉ dùng lại khi dấu nhận diện còn khớp với kế hoạch hiện tại.
export async function getCachedGrocery(weekStart: string, language: string): Promise<GroceryCache | null> {
  try {
    const raw = await AsyncStorage.getItem(groceryCacheKey(weekStart, language));
    return raw ? (JSON.parse(raw) as GroceryCache) : null;
  } catch {
    return null;
  }
}

// Lưu danh sách đi chợ vào máy.
// Lưu vì mỗi danh sách tốn một lượt gọi AI, mở lại không nên gọi lần nữa.
export async function cacheGrocery(weekStart: string, language: string, cache: GroceryCache): Promise<void> {
  try {
    await AsyncStorage.setItem(groceryCacheKey(weekStart, language), JSON.stringify(cache));
  } catch {
  // Lỗi ghi bộ nhớ tạm không được làm hỏng luồng chính.
  }
}

// Xóa một món khỏi kế hoạch. Gọi DELETE /plan/:id.
export async function deletePlanMeal(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/${id}`, "DELETE", undefined, token);
}

// Đánh dấu món trong kế hoạch là đã ăn, backend đồng thời ghi món vào nhật ký thật.
export async function markPlanEaten(token: string, id: string): Promise<PlanMeal> {
  const data = await apiRequest(`/plan/${id}/eaten`, "POST", undefined, token);
  return mapPlan(data.planMeal);
}

export async function markPlanWorkoutDone(
  token: string,
  id: string,
  workout: { name: string; routineKey: string },
): Promise<void> {
  await apiRequest(`/plan/workout/${id}/done`, "POST", workout, token);
}
