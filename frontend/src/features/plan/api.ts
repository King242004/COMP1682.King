import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/api";

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

// Gợi ý bài tập AI cho một ngày trong kế hoạch. Các trường có cấu trúc như
// name, met và durationMin giúp nút "✓ Xong" ghi bài tập chỉ bằng một lần chạm.
// Ngày nghỉ chỉ có nội dung chữ.
export type PlanDayWorkout = {
  id: string;
  date: string;
  text: string;
  name: string | null;
  met: number | null;
  durationMin: number | null;
  done: boolean;
};
type RawPlanWorkout = Omit<PlanDayWorkout, "id"> & { _id?: string };

function mapWorkout(w: RawPlanWorkout): PlanDayWorkout {
  return {
    id: w._id || "",
    date: w.date,
    text: w.text,
    name: w.name ?? null,
    met: w.met ?? null,
    durationMin: w.durationMin ?? null,
    done: !!w.done,
  };
}

export async function getPlanMeals(
  token: string,
  startDate: string,
  endDate: string
): Promise<{ meals: PlanMeal[]; workouts: Record<string, PlanDayWorkout> }> {
  const data = await apiRequest<{ planMeals: RawPlanMeal[]; planWorkouts: RawPlanWorkout[] }>(
    `/plan?startDate=${startDate}&endDate=${endDate}`,
    "GET",
    undefined,
    token
  );
  // Nhóm bài tập theo ngày để mỗi ngày có thể tìm nhanh.
  const workouts: Record<string, PlanDayWorkout> = {};
  for (const w of data.planWorkouts || []) workouts[w.date] = mapWorkout(w);
  return { meals: (data.planMeals || []).map(mapPlan), workouts };
}

// Xác nhận bài tập AI bằng một lần chạm rồi tạo bản ghi Exercise thật.
export async function markPlanWorkoutDone(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/workout/${id}/done`, "POST", undefined, token);
}

// Yêu cầu AI tạo món ăn và gợi ý tập cho khoảng ngày, thay thế kế hoạch cũ trong khoảng đó.
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
export type PlanWeekCache = { meals: PlanMeal[]; workouts: Record<string, PlanDayWorkout> };

const planWeekKey = (weekStart: string) => `plan_week_${weekStart}`;

export async function getCachedPlanWeek(weekStart: string): Promise<PlanWeekCache | null> {
  try {
    const raw = await AsyncStorage.getItem(planWeekKey(weekStart));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanWeekCache;
    // Dữ liệu cũ từng lưu bài tập bằng chuỗi nên cần đổi về cùng một cấu trúc.
    for (const [date, w] of Object.entries(parsed.workouts || {})) {
      if (typeof w === "string") {
        parsed.workouts[date] = { id: "", date, text: w, name: null, met: null, durationMin: null, done: false };
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

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

export async function getCachedGrocery(weekStart: string, language: string): Promise<GroceryCache | null> {
  try {
    const raw = await AsyncStorage.getItem(groceryCacheKey(weekStart, language));
    return raw ? (JSON.parse(raw) as GroceryCache) : null;
  } catch {
    return null;
  }
}

export async function cacheGrocery(weekStart: string, language: string, cache: GroceryCache): Promise<void> {
  try {
    await AsyncStorage.setItem(groceryCacheKey(weekStart, language), JSON.stringify(cache));
  } catch {
    // Lỗi ghi bộ nhớ tạm không được làm hỏng luồng chính.
  }
}

export async function deletePlanMeal(token: string, id: string): Promise<void> {
  await apiRequest(`/plan/${id}`, "DELETE", undefined, token);
}

// Đánh dấu món trong kế hoạch là đã ăn, backend đồng thời ghi món vào nhật ký thật.
export async function markPlanEaten(token: string, id: string): Promise<PlanMeal> {
  const data = await apiRequest(`/plan/${id}/eaten`, "POST", undefined, token);
  return mapPlan(data.planMeal);
}
