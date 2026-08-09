// ═══ FILE NÀY LÀM GÌ ═══
// Tạo khóa ngày dạng YYYY-MM-DD, dùng khắp app.
//
// Ai gọi tới: Trang chủ, Thêm món, Tiến trình, Kế hoạch tuần
// Nhận vào:   một mốc thời gian, mặc định là bây giờ
// Trả ra:     chuỗi ngày theo giờ MÁY người dùng
// Khi lỗi:    không có nhánh lỗi
//
// Nhớ: KHÔNG dùng toISOString, vì nó trả giờ UTC nên máy ở múi giờ dương
//      sau 7 giờ tối đã nhảy sang ngày hôm sau.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Tạo khóa YYYY-MM-DD của ngày hôm nay theo giờ địa phương.
export function todayKey(): string {
  return dateKey(new Date());
}

// Rút giờ phút khỏi một mốc thời gian đầy đủ, ví dụ "2026-08-09T19:05:00Z" ra "19:05".
// Theo giờ MÁY người dùng, cùng lý do với dateKey ở trên.
export function timeHHMM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Thứ trong tuần theo lối app dùng, tức Thứ hai là 0 và Chủ nhật là 6.
// JavaScript đánh Chủ nhật là 0 nên phải xoay bằng (thứ + 6) % 7.
// Ba nơi cần con số này: dựng bảy ngày của tuần, chừa ô trống đầu lưới tháng
// ở màn Ghi buổi tập, và chừa ô trống đầu bản đồ nhiệt ở màn Tiến trình.
// Trước ngày 9/8/2026 mỗi nơi tự viết lại đúng phép xoay này.
export function mondayFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// Thứ hai của tuần chứa base, dịch đi weekOffset tuần. Số âm là tuần cũ.
export function mondayOf(base: Date, weekOffset = 0): Date {
  const d = new Date(base);
  // Cắt giờ phút giây về 0, để so ngày với ngày cho gọn, khỏi vướng phần giờ.
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - mondayFirstIndex(d) + weekOffset * 7);
  return d;
}

export function getCurrentWeekDays(weekOffset = 0): Date[] {
  const monday = mondayOf(new Date(), weekOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

// Đổi một khóa ngày thành nhãn cho người đọc. Hai ngày gần nhất gọi thẳng là
// Hôm nay và Hôm qua, xa hơn mới ghi ngày tháng theo ngôn ngữ đang chọn.
// Trước ngày 9/8/2026 màn Lịch sử món và màn Coach mỗi bên tự dựng lấy nhãn này.
//
// Nhớ: ghép T00:00:00 để máy hiểu là giờ địa phương. Thiếu nó thì máy ở múi giờ
//      âm đọc chuỗi ngày thành giờ UTC và lùi mất một ngày.
export function relativeDayLabel(
  dateKeyStr: string,
  labels: { today: string; yesterday: string },
  locale?: string,
  format: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateKeyStr === dateKey(today)) return labels.today;
  if (dateKeyStr === dateKey(yesterday)) return labels.yesterday;
  return new Date(dateKeyStr + "T00:00:00").toLocaleDateString(locale, format);
}

// Mốc thời gian lưu bản ghi có rơi đúng vào ngày mà bản ghi nói tới hay không.
// Dùng để biết một món được ghi ngay hôm ăn, hay ghi bù cho ngày cũ.
// Ba nơi từng tự so lấy: chuỗi ngày ghi món, màn Lịch sử món và màn Chi tiết món.
export function isLoggedOnSameDay(createdAtIso: string, dateKeyStr: string): boolean {
  const loggedAt = new Date(createdAtIso);
  return !Number.isNaN(loggedAt.getTime()) && dateKey(loggedAt) === dateKeyStr;
}
