// Week strip helpers for the Home diary (Mon→Sun of the viewed week).
// Day labels live in the i18n catalog (t.labels.daysShort).

export function getCurrentWeekDays(weekOffset = 0) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from Monday of the week, shifted back `weekOffset` weeks (0 = this week)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}
