// ═══ FILE NÀY LÀM GÌ ═══
// Tính bảy ngày của tuần đang xem, bắt đầu từ Thứ hai.
//
// Ai gọi tới: HomeScreen và ProgressScreen, ở hàng chọn ngày
// Nhận vào:   lùi mấy tuần so với tuần này, 0 là tuần hiện tại
// Trả ra:     bảy đối tượng Date, phần tử đầu là Thứ hai
// Khi lỗi:    không có nhánh lỗi
//
// Nhớ: trả về Date chứ KHÔNG phải chuỗi. Nơi gọi muốn chuỗi thì tự bọc dateKey.

// ══════════════════════════════════════════════════════════
// DỰNG BẢY NGÀY
//
// Đến từ hàng chọn ngày ở Trang chủ và ở màn Tiến trình.
// Ba bước, đọc từ trên xuống là đúng thứ tự. Không gọi mạng.
// Xong thì nơi gọi map ra bảy chip ngày.
// ══════════════════════════════════════════════════════════

// DỰNG BẢY NGÀY BƯỚC 1. Nơi gọi đưa vào số tuần muốn lùi.
export function getCurrentWeekDays(weekOffset = 0) {
  // Mảng kết quả, đổ dần ở BƯỚC 3.
  const days = [];
  const today = new Date();
  // Cắt giờ phút giây về 0, để so ngày với ngày cho gọn, khỏi vướng phần giờ.
  today.setHours(0, 0, 0, 0);
  // DỰNG BẢY NGÀY BƯỚC 2. Tìm Thứ hai của tuần đang xem.
  // JavaScript đánh Chủ nhật là 0, Thứ hai là 1, nên phải xoay bằng (thứ + 6) % 7
  // thì Thứ hai mới ra 0 còn Chủ nhật ra 6. Lùi đúng bấy nhiêu ngày là tới Thứ hai.
  // Cộng weekOffset nhân 7 để nhảy sang tuần khác, số âm là tuần cũ.
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
  // DỰNG BẢY NGÀY BƯỚC 3. Từ Thứ hai cộng dần bảy ngày.
  // Mỗi vòng dựng một Date mới, không sửa thẳng monday, kẻo cả bảy phần tử
  // cùng trỏ về một ô nhớ và ra bảy ngày giống hệt nhau.
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}
