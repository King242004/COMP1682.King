// Single source of truth for the hour → meal-slot mapping (mirrors backend
// mealTypeByHour in coachController — keep the two in sync). Used by the scan
// prefill and the "what should I eat" suggestions so 5am is "breakfast"
// everywhere, not "snack" in one screen and "breakfast" in another.
export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export function mealSlotByHour(h: number): MealSlot {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}
