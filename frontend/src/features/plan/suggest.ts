// "What should I eat now?" — API + cache logic for the plan feature
// (the endpoint itself is /coach/suggest-meal).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/api";
import { stripMarkdown } from "@/features/coach/api";
import type { Lang } from "@/utils/language";

export type MealSuggestion = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
};

export type MealSuggestions = {
  mealType: string; // slot the server suggested for (breakfast/lunch/dinner/snack)
  remaining: number; // kcal budget left when suggestions were generated
  suggestions: MealSuggestion[];
};

// Same hour→slot mapping as the backend; used to key the cache so suggestions
// go stale when the meal slot changes (lunch suggestions shouldn't show at dinner).
export function mealSlotByHour(h: number): string {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

// Slot to suggest for: hour-based slot, skipping slots already eaten today.
// Mirrors backend nextSlotToSuggest — keep the two in sync so the cache key
// matches what the server generates for.
export function nextMealSlot(hour: number, eatenTypes: Set<string>): string {
  const order = ["breakfast", "lunch", "snack", "dinner"];
  let idx = order.indexOf(mealSlotByHour(hour));
  while (idx < order.length && eatenTypes.has(order[idx])) idx++;
  return idx < order.length ? order[idx] : "snack";
}

export async function suggestNextMeal(token: string, language: Lang): Promise<MealSuggestions> {
  const data = await apiRequest("/coach/suggest-meal", "POST", { language }, token);
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

// Cache per (date + meal slot + language) — tapping the button again within the
// same slot reuses the result instead of burning another Gemini request.
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
    // ignore cache write failures
  }
}
