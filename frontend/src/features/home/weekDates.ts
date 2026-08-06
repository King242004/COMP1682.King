// JavaScript đánh số Chủ nhật là 0, nên phải chuyển đổi để tuần bắt đầu từ Thứ hai.

export function getCurrentWeekDays(weekOffset = 0) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Bắt đầu từ Thứ hai và lùi theo weekOffset. Giá trị 0 là tuần hiện tại.
  // JavaScript đánh số Chủ nhật là 0, Thứ hai là 1.
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}
