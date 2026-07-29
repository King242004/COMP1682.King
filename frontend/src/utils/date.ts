// Tạo khóa ngày YYYY-MM-DD theo giờ địa phương.
// Không dùng toISOString vì múi giờ UTC có thể làm lệch ngày.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Tạo khóa YYYY-MM-DD của ngày hôm nay theo giờ địa phương.
export function todayKey(): string {
  return dateKey(new Date());
}
