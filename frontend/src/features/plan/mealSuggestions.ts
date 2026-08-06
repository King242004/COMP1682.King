// File này là chặng giữa thẻ gợi ý món và backend.
// Ngoài gọi mạng, nó lưu tạm kết quả theo ngày, bữa và ngôn ngữ,
// vì mỗi lần gợi ý tốn một lượt gọi AI.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/apiClient";
import { stripMarkdown } from "@/features/coach/coachApi";
import { mealSlotByHour } from "@/features/meals/mealHelpers";
import type { Lang } from "@/utils/languageUtils";
import { todayKey } from "@/utils/dateUtils";

const AI_TIMEOUT_MS = 120_000;

export type MealSuggestion = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
};

export type MealSuggestions = {
  mealType: string;
  // Lượng kcal còn lại tại thời điểm tạo gợi ý.
  remaining: number;
  suggestions: MealSuggestion[];
};

export function nextMealSlot(hour: number, eatenTypes: Set<string>): string {
  const order = ["breakfast", "lunch", "snack", "dinner"];
  let idx = order.indexOf(mealSlotByHour(hour));
  while (idx < order.length && eatenTypes.has(order[idx])) idx++;
  return idx < order.length ? order[idx] : "snack";
}

export async function suggestNextMeal(token: string, language: Lang): Promise<MealSuggestions> {
  const data = await apiRequest(
    "/coach/suggest-meal",
    "POST",
    { language, localDate: todayKey(), localHour: new Date().getHours() },
    token,
    { timeoutMs: AI_TIMEOUT_MS }
  );
  return {
    mealType: data.mealType || mealSlotByHour(new Date().getHours()),
    remaining: Math.round(Number(data.remaining) || 0),
    suggestions: (data.suggestions || []).map((s: any) => ({
      name: s.name,
      calories: s.calories,
      protein: s.protein,
      carbs: s.carbs,
      fat: s.fat,
      reason: stripMarkdown(s.reason || ""),
    })),
  };
}

const suggestCacheKey = (date: string, slot: string, language: Lang) =>
  `coach_suggest_${date}_${slot}_${language}`;

export async function getCachedSuggestions(date: string, slot: string, language: Lang): Promise<MealSuggestions | null> {
  try {
    const raw = await AsyncStorage.getItem(suggestCacheKey(date, slot, language));
    return raw ? (JSON.parse(raw) as MealSuggestions) : null;
  } catch {
    return null;
  }
}

export async function cacheSuggestions(date: string, slot: string, language: Lang, s: MealSuggestions): Promise<void> {
  try {
    await AsyncStorage.setItem(suggestCacheKey(date, slot, language), JSON.stringify(s));
  } catch {
  }
}
