// Local YYYY-MM-DD key for a date. Built from local getFullYear/Month/Date
// (NOT toISOString) to avoid the day shifting due to UTC offset.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Local YYYY-MM-DD key for today.
export function todayKey(): string {
  return dateKey(new Date());
}
