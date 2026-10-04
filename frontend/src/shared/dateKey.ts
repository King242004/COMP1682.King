// Tên thứ trong tuần, Chủ nhật đứng đầu giống getDay() của JavaScript
const WEEKDAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

// Thêm số 0 phía trước cho đủ 2 chữ số, ví dụ 4 thành "04"
function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

// Đổi một Date thành chuỗi ngày "2026-10-04" theo giờ trên điện thoại
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

// Đổi chuỗi "2026-10-04" thành Date lúc 0 giờ theo giờ trên điện thoại
function fromDateKey(dateKey: string): Date {
  const parts = dateKey.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day);
}

// Ngày hôm nay dạng "2026-10-04"
export function todayKey(): string {
  return toDateKey(new Date());
}

// Lùi hoặc tiến một số ngày, ví dụ shiftDateKey("2026-10-04", -1) ra "2026-10-03"
export function shiftDateKey(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

// Chữ hiển thị: "Hôm nay, 4 tháng 10", "Hôm qua, 3 tháng 10" hoặc "Thứ năm, 2 tháng 10"
export function formatDateLabel(dateKey: string): string {
  const date = fromDateKey(dateKey);
  const dayAndMonth = `${date.getDate()} tháng ${date.getMonth() + 1}`;
  if (dateKey === todayKey()) {
    return `Hôm nay, ${dayAndMonth}`;
  }
  if (dateKey === shiftDateKey(todayKey(), -1)) {
    return `Hôm qua, ${dayAndMonth}`;
  }
  return `${WEEKDAY_NAMES[date.getDay()]}, ${dayAndMonth}`;
}
