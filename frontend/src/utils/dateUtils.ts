// ═══ FILE NÀY LÀM GÌ ═══
// Tạo khóa ngày dạng YYYY-MM-DD, dùng khắp app.
//
// Ai gọi tới: Trang chủ, Thêm món, Tiến trình, Kế hoạch tuần
// Nhận vào:   một mốc thời gian, mặc định là bây giờ
// Trả ra:     chuỗi ngày theo giờ MÁY người dùng
// Khi lỗi:    không có nhánh lỗi
// Tạo khóa ngày YYYY-MM-DD theo giờ địa phương.
// Không dùng toISOString vì múi giờ UTC có thể làm lệch ngày.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Tạo khóa YYYY-MM-DD của ngày hôm nay theo giờ địa phương.
export function todayKey(): string {
  return dateKey(new Date());
}
