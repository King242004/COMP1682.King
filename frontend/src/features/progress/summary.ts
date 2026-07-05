import { dateKey } from "@/utils/date";
import type { Meal } from "@/context/MealsContext";

export type DaySummary = {
  key: string;
  label: string;      // short weekday, e.g. "Mon"
  fullLabel: string;  // "Monday, Jun 3"
  isToday: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  onTrack: boolean;   // 80–100% of goal
  distToGoal: number; // |calories − goal|, Infinity when no meals
  ratio: number;      // calories / goal
};

// The trailing 7 days (oldest → today), midnight-aligned.
export function getLast7Days() {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

// Build per-day nutrition summaries from history for the last 7 days.
export function buildDaySummaries(historyMeals: Meal[], goal: number): DaySummary[] {
  const todayKey = dateKey(new Date());
  return getLast7Days().map((d) => {
    const key = dateKey(d);
    // Match on meal.date (logged day) not createdAt (insertion timestamp)
    const dayMeals = historyMeals.filter((m) => m.date === key);
    const calories = dayMeals.reduce((s, m) => s + m.calories, 0);
    const ratio = goal > 0 ? calories / goal : 0;
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullLabel: d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      isToday: key === todayKey,
      calories,
      protein: dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0),
      carbs: dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0),
      fat: dayMeals.reduce((s, m) => s + (m.fat ?? 0), 0),
      mealCount: dayMeals.length,
      onTrack: calories > 0 && ratio >= 0.8 && ratio <= 1.0,
      distToGoal: calories > 0 ? Math.abs(calories - goal) : Infinity,
      ratio,
    };
  });
}
