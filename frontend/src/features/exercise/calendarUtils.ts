// ═══ FILE NÀY LÀM GÌ ═══
// Hai phép tính lịch thuần dùng bởi LogActivityScreen.
// calendarMonthDays dựng lưới thứ Hai–Chủ nhật; shiftCalendarMonth đổi tháng.
// Không đọc state, không gọi mạng và không tự lấy ngày hiện tại nên có thể test độc lập.

// ═══ FILE NÀY LÀM GÌ ═══
// Hai phép tính lịch thuần dùng bởi LogActivityScreen.
// calendarMonthDays dựng lưới thứ Hai–Chủ nhật; shiftCalendarMonth đổi tháng.
// Không đọc state, không gọi mạng và không tự lấy ngày hiện tại nên có thể test độc lập.

export function calendarMonthDays(month: Date): (number | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - leadingBlanks + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
}

export function shiftCalendarMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}
