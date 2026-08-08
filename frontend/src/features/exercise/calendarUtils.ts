// ═══ FILE NÀY LÀM GÌ ═══
// Hai phép tính lịch cho ô chọn ngày ở màn Ghi buổi tập.
//
// Ai gọi tới: LogActivityScreen
// Nhận vào:   một tháng, dạng Date trỏ vào tháng đó
// Trả ra:     lưới ô ngày của tháng, hoặc một Date của tháng liền kề
// Khi lỗi:    không có nhánh lỗi
//
// Nhớ: hai hàm này KHÔNG đọc state, KHÔNG gọi mạng, và KHÔNG tự lấy ngày hôm nay.
//      Cố ý giữ vậy để test được độc lập, cứ đưa tháng nào vào là ra kết quả đó.

// ══════════════════════════════════════════════════════════
// DỰNG LƯỚI THÁNG
//
// Đến từ màn Ghi buổi tập, chạy lại mỗi lần người dùng lật tháng.
// Ba bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì màn map mảng trả về thành các ô ngày, ô null vẽ trống.
// ══════════════════════════════════════════════════════════

// DỰNG LƯỚI BƯỚC 1. Nơi gọi đưa vào một Date bất kỳ trong tháng cần vẽ.
// Chỉ lấy năm với tháng, ngày trong Date đó không dùng tới.
export function calendarMonthDays(month: Date): (number | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  // DỰNG LƯỚI BƯỚC 2. Đếm ba con số cần để xếp lưới.
  //
  // leadingBlanks là số ô trống phải chừa trước ngày 1, để ngày 1 rơi đúng cột thứ của nó.
  // JavaScript đánh Chủ nhật là 0, Thứ hai là 1, mà lưới của app bắt đầu từ Thứ hai,
  // nên phải xoay bằng (thứ + 6) % 7 thì Thứ hai mới ra 0 còn Chủ nhật ra 6.
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  // Số ngày trong tháng. Mẹo: ngày 0 của tháng SAU chính là ngày cuối của tháng này,
  // nhờ vậy khỏi phải nhớ tháng nào 30 tháng nào 31, và năm nhuận cũng tự đúng.
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Làm tròn LÊN cho chẵn tuần, nên lưới luôn đủ hàng 7 ô, không có hàng cụt.
  const cellCount = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  // DỰNG LƯỚI BƯỚC 3. Đổ mảng ô. Ô nào rơi ngoài tháng thì để null,
  // nơi gọi thấy null là vẽ một ô trống chứ không vẽ số.
  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - leadingBlanks + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
}

// Lật sang tháng khác. offset âm là lùi, dương là tiến.
// Luôn trả về ngày 1, vì hàm trên chỉ đọc năm với tháng, ngày để 1 cho gọn.
// Tháng vượt quá 11 hoặc dưới 0 thì Date tự chuyển năm, không phải xử tay.
export function shiftCalendarMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}
