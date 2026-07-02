// Local YYYY-MM-DD key for a date. Built from local getFullYear/Month/Date
// (NOT toISOString) to avoid the day shifting due to UTC offset.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Local YYYY-MM-DD key for today.
export function todayKey(): string {
  return dateKey(new Date());
}

// ISO 8601 week number (1–53), weeks start on Monday.
export function weekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Sunday → 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // shift to the week's Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
