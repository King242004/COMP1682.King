export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

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
