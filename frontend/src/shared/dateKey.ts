// Tên thứ đầy đủ và viết ngắn, Chủ nhật đứng đầu giống getDay() của JavaScript
const WEEKDAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const SHORT_WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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

// 7 ngày từ thứ Hai tới Chủ nhật của tuần chứa ngày này
export function weekDateKeys(dateKey: string): string[] {
  // getDay() cho Chủ nhật là 0; đổi sang số ngày tính từ thứ Hai
  let daysFromMonday = fromDateKey(dateKey).getDay() - 1;
  if (daysFromMonday < 0) {
    daysFromMonday = 6;
  }
  const monday = shiftDateKey(dateKey, -daysFromMonday);
  const keys: string[] = [];
  for (let offset = 0; offset < 7; offset++) {
    keys.push(shiftDateKey(monday, offset));
  }
  return keys;
}

// Thứ viết ngắn, ví dụ "T3" hoặc "CN"
export function shortWeekdayName(dateKey: string): string {
  return SHORT_WEEKDAY_NAMES[fromDateKey(dateKey).getDay()];
}

// Ngày trong tháng, ví dụ 6
export function dayOfMonth(dateKey: string): number {
  return fromDateKey(dateKey).getDate();
}

// Số ngày từ ngày này tới ngày kia, ví dụ daysBetween("2026-10-01", "2026-10-06") ra 5
export function daysBetween(fromKey: string, toKey: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((fromDateKey(toKey).getTime() - fromDateKey(fromKey).getTime()) / millisecondsPerDay);
}

// Ngày viết ngắn kiểu "6/10" cho trục biểu đồ
export function formatShortDate(dateKey: string): string {
  const date = fromDateKey(dateKey);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
