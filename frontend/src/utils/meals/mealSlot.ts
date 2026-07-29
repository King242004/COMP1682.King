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

// Collapse a meal history into one entry per dish name, newest first. People
// eat the same dishes repeatedly, so raw history is full of duplicates; both
// the Add-meal quick chips and the attach-a-meal picker want a clean, unique
// shortlist. Matching is case-insensitive and trims surrounding spaces, and the
// newest occurrence of each name wins (its calories/macros are the latest).
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
