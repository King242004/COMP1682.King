import { dateKey } from "./date";

// Consecutive days with at least one logged meal, counting back from today.
// Time rule: today without a log does NOT break the streak yet (the day isn't
// over) — counting simply starts from yesterday instead.
export function mealStreak(loggedDates: Iterable<string>): number {
  const logged = new Set(loggedDates);
  let count = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (!logged.has(dateKey(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    if (!logged.has(dateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
