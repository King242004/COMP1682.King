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

// Longest run of consecutive logged days inside a supplied reporting period.
export function longestMealStreak(loggedDates: Iterable<string>): number {
  const dates = [...new Set(loggedDates)]
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  dates.forEach((key) => {
    const [year, month, day] = key.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setHours(0, 0, 0, 0);

    if (previous) {
      const expected = new Date(previous);
      expected.setDate(expected.getDate() + 1);
      current = dateKey(expected) === key ? current + 1 : 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
    previous = currentDate;
  });

  return longest;
}
