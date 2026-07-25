import { dateKey } from "@/utils/date";
import type { Meal } from "@/context/MealsContext";

export type DaySummary = {
  key: string;
  label: string;      // short weekday, e.g. "Mon" (bar-chart axis)
  fullLabel: string;  // weekday + full date, e.g. "Monday, Jun 3, 2026"
  isToday: boolean;
  isFuture: boolean;  // day hasn't happened yet (month view shows the whole month)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  onTrack: boolean;   // 80–100% of goal
  distToGoal: number; // |calories − goal|, Infinity when no meals
  ratio: number;      // calories / goal
};

// The trailing N days (oldest → today), midnight-aligned.
export function getLastNDays(n: number) {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

// Every day of a calendar month (day 1 → last day), midnight-aligned. Length
// matches the real month (28-31). Days after today may be included; the UI dims
// those not-yet-logged days.
export function getMonthDays(year: number, month: number) {
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let day = 1; day <= lastDate; day++) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

export function getCurrentMonthDays() {
  const now = new Date();
  return getMonthDays(now.getFullYear(), now.getMonth());
}

export type MonthTotal = {
  key: string;        // "2026-07"
  label: string;      // localized short month, e.g. "thg 7"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isFuture: boolean;  // a month later than the current one (this year)
};

// The 12 monthly totals for a year — the "Year" view's bars.
export function getYearMonthTotals(historyMeals: Meal[], year: number, locale?: string): MonthTotal[] {
  const now = new Date();
  const out: MonthTotal[] = [];
  for (let m = 0; m < 12; m++) {
    const monthMeals = historyMeals.filter((meal) => {
      const d = new Date(meal.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === m;
    });
    out.push({
      key: `${year}-${String(m + 1).padStart(2, "0")}`,
      label: new Date(year, m, 1).toLocaleDateString(locale, { month: "short" }),
      calories: monthMeals.reduce((s, x) => s + x.calories, 0),
      protein: monthMeals.reduce((s, x) => s + (x.protein ?? 0), 0),
      carbs: monthMeals.reduce((s, x) => s + (x.carbs ?? 0), 0),
      fat: monthMeals.reduce((s, x) => s + (x.fat ?? 0), 0),
      isFuture: year > now.getFullYear() || (year === now.getFullYear() && m > now.getMonth()),
    });
  }
  return out;
}

// The calendar week (Monday → Sunday) containing `date`, so picking any day
// keeps the week fixed and just highlights that day, rather than shifting the
// window so the picked day is always last.
export function getWeekDays(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    days.push(x);
  }
  return days;
}

// Build per-day nutrition summaries from history for the given window of days.
// `locale` (e.g. "vi-VN") makes weekday/date labels follow the app language
// instead of the phone's locale.
export function buildDaySummaries(historyMeals: Meal[], goal: number, windowDays: Date[], locale?: string): DaySummary[] {
  const todayKey = dateKey(new Date());
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return windowDays.map((d) => {
    const key = dateKey(d);
    // Match on meal.date (logged day) not createdAt (insertion timestamp)
    const dayMeals = historyMeals.filter((m) => m.date === key);
    const calories = dayMeals.reduce((s, m) => s + m.calories, 0);
    const ratio = goal > 0 ? calories / goal : 0;
    return {
      key,
      label: d.toLocaleDateString(locale, { weekday: "short" }),
      fullLabel: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" }),
      isToday: key === todayKey,
      isFuture: d.getTime() > todayStart.getTime(),
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
