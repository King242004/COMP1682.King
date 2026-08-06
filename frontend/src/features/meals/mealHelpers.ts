// File này chứa hai việc nhỏ dùng chung cho phần món ăn.
//   mealSlotByHour đoán bữa theo giờ hiện tại. Backend có bản giống hệt
//     trong coachController, hai bên phải cho ra cùng kết quả.
//   recentUniqueMeals lấy các món gần đây, mỗi tên chỉ hiện một lần,
//     dùng cho phần chọn nhanh ở màn Thêm món.
import type { Strings } from "@/i18n";
import type { NutritionSource } from "@/features/meals/mealTypes";
import { parseDecimal } from "@/utils/numberUtils";

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type NutritionFields = Record<"calories" | "protein" | "carbs" | "fat", string>;

export function hasAnyNutrition(values: NutritionFields): boolean {
  return Object.values(values).some((value) => value.trim());
}

export function hasCompleteNutrition(values: NutritionFields): boolean {
  if (!Object.values(values).every((value) => value.trim())) return false;
  const calories = parseDecimal(values.calories);
  const macros = [values.protein, values.carbs, values.fat].map(parseDecimal);
  return Number.isFinite(calories) && calories > 0 && calories <= 9999
    && macros.every((value) => Number.isFinite(value) && value >= 0 && value <= 9999);
}

export function nutritionNumberError(
  value: string,
  field: string,
  t: Strings,
  allowZero = true,
): string | undefined {
  if (!value.trim()) return t.meals.nutritionValueRequired(field);
  const number = parseDecimal(value);
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number === 0))
    return t.meals.numPositive(field);
  if (number > 9999) return t.meals.numTooHigh(field);
}

// Nguồn nào là số AI ước tính, nguồn nào là số chắc chắn.
// Giao diện dùng cái này để quyết định có hiện dấu ngã trước số calo và có hiện
// câu cảnh báo ước tính hay không. Mã vạch và món ghi lại thì số đã có sẵn nên
// không phải ước tính, còn bốn nguồn còn lại đều do AI đoán ra.
export function isApproximateSource(source: NutritionSource): boolean {
  return ["ai_estimate", "ai_adjusted", "photo_scan", "ai_suggestion"].includes(source);
}

export function nutritionSourceLabel(source: NutritionSource, t: Strings): string {
  return {
    ai_estimate: t.meals.sourceAi,
    ai_adjusted: t.meals.sourceAdjusted,
    photo_scan: t.meals.sourcePhoto,
    barcode: t.meals.sourceBarcode,
    community: t.meals.sourceCommunity,
    repeat: t.meals.sourceRepeat,
    ai_suggestion: t.meals.sourceSuggestion,
    manual: t.meals.sourceManual,
  }[source];
}

export function mealSlotByHour(h: number): MealSlot {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

export function recentUniqueMeals<T extends { name: string; date: string }>(
  history: T[],
  limit = 8,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const m of sorted) {
    const key = m.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

function normalizedName(value: string, removeMarks = false): string {
  const normalized = value.normalize(removeMarks ? "NFD" : "NFC").trim().replace(/\s+/g, " ").toLowerCase();
  return removeMarks
    ? normalized.replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, "")
    : normalized;
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = a[i - 1] === b[j - 1]
        ? diagonal
        : 1 + Math.min(diagonal, previous[j], previous[j - 1]);
      diagonal = above;
    }
  }
  return previous[b.length];
}

export function similarRecentMealName<T extends { name: string }>(query: string, meals: T[]): T | undefined {
  const exactQuery = normalizedName(query);
  const fuzzyQuery = normalizedName(query, true);
  if (fuzzyQuery.length < 8) return undefined;

  let closest: { meal: T; distance: number } | undefined;
  for (const meal of meals) {
    if (normalizedName(meal.name) === exactQuery) continue;
    const candidate = normalizedName(meal.name, true);
    const distance = editDistance(fuzzyQuery, candidate);
    if (!closest || distance < closest.distance) closest = { meal, distance };
  }

  if (!closest) return undefined;
  const maxDistance = Math.min(3, Math.max(1, Math.floor(fuzzyQuery.length * 0.2)));
  return closest.distance <= maxDistance ? closest.meal : undefined;
}
