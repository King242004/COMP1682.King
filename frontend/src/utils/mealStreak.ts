// ═══ FILE NÀY LÀM GÌ ═══
// Đếm chuỗi ngày ghi món liên tiếp.
//
// Ai gọi tới: AppHeader (chuỗi đang chạy), ProgressScreen (chuỗi dài nhất)
// Nhận vào:   danh sách món kèm ngày
// Trả ra:     số ngày liên tiếp
// Khi lỗi:    không có món nào thì trả 0, không trả rỗng
//
// Nhớ: hai cách đếm khác nhau, đừng lẫn.
//      mealStreak đếm chuỗi ĐANG chạy, tính lùi từ hôm nay, hiện ở thanh đầu Trang chủ.
//      longestMealStreak tìm chuỗi DÀI NHẤT trong khoảng đang xem, hiện ở màn Tiến trình.
import { dateKey } from "./dateUtils";

// ══════════════════════════════════════════════════════════
// LỌC NGÀY ĐỦ ĐIỀU KIỆN
//
// Đến từ AppHeader và ProgressScreen, chạy trước khi đếm.
// Chỉ có một bước, không gọi mạng.
// Xong thì đưa danh sách ngày sang một trong hai hàm đếm bên dưới.
// ══════════════════════════════════════════════════════════

// Chỉ tính chuỗi khi người dùng ghi món đúng vào ngày ăn, tức ngày ghi trùng ngày của món.
// Món thêm bù cho ngày cũ vẫn được cộng vào dinh dưỡng ngày đó, nhưng KHÔNG nối chuỗi,
// kẻo ngồi một buổi ghi bù cả tuần là chuỗi tự dài ra.
export function streakEligibleDates(
  meals: Iterable<{ date: string; createdAt: string }>,
): string[] {
  return [...meals]
    .filter((meal) => {
      const loggedAt = new Date(meal.createdAt);
      return !Number.isNaN(loggedAt.getTime()) && dateKey(loggedAt) === meal.date;
    })
    .map((meal) => meal.date);
}

// ══════════════════════════════════════════════════════════
// ĐẾM CHUỖI ĐANG CHẠY
//
// Đến từ AppHeader, cho con số cạnh ngọn lửa ở thanh đầu Trang chủ.
// Ba bước, đọc từ trên xuống là đúng thứ tự.
// ══════════════════════════════════════════════════════════

// ĐẾM CHUỖI BƯỚC 1. Đổ danh sách ngày vào Set, để tra một ngày là xong ngay,
// không phải duyệt lại cả mảng cho mỗi ngày lùi.
export function mealStreak(loggedDates: Iterable<string>): number {
  const logged = new Set(loggedDates);
  let count = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // ĐẾM CHUỖI BƯỚC 2. Hôm nay chưa ghi món thì lùi mốc xuất phát về hôm qua.
  // Vì ngày hôm nay chưa hết, chưa ghi không có nghĩa là đã đứt chuỗi.
  if (!logged.has(dateKey(d))) d.setDate(d.getDate() - 1);
  // ĐẾM CHUỖI BƯỚC 3. Lùi từng ngày, gặp ngày trống là dừng.
  // Chặn ở 365 vòng cho chắc, kẻo dữ liệu lạ làm vòng lặp chạy mãi.
  for (let i = 0; i < 365; i++) {
    if (!logged.has(dateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// ══════════════════════════════════════════════════════════
// TÌM CHUỖI DÀI NHẤT
//
// Đến từ ProgressScreen, chỉ xét đúng khoảng ngày màn đó đang xem.
// Ba bước, đọc từ trên xuống là đúng thứ tự.
// Khác hàm trên ở chỗ nó KHÔNG neo vào hôm nay, chuỗi dài nhất nằm ở đâu cũng được.
// ══════════════════════════════════════════════════════════

// Màn Tiến trình gọi thẳng vào đây, kèm danh sách ngày của khoảng đang xem.
export function longestMealStreak(loggedDates: Iterable<string>): number {
  // TÌM CHUỖI DÀI NHẤT BƯỚC 1. Bỏ ngày trùng, bỏ ngày sai định dạng, rồi xếp tăng dần.
  // Phải xếp thì BƯỚC 2 mới so được ngày này với ngày liền trước.
  // Ngày dạng 2026-08-07 nên xếp chuỗi cũng ra đúng thứ tự thời gian.
  const dates = [...new Set(loggedDates)]
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  // TÌM CHUỖI DÀI NHẤT BƯỚC 2. Duyệt một lượt, đếm dồn khi ngày này liền sau ngày trước,
  // gặp chỗ đứt thì đếm lại từ 1. Sau mỗi ngày lại chốt xem có phá kỷ lục không.
  dates.forEach((key) => {
    // Tách tay rồi mới dựng Date, chứ new Date("2026-08-07") bị hiểu là giờ UTC,
    // máy ở múi giờ âm sẽ lùi mất một ngày.
    const [year, month, day] = key.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setHours(0, 0, 0, 0);

    if (previous) {
      const expected = new Date(previous);
      expected.setDate(expected.getDate() + 1);
      current = dateKey(expected) === key ? current + 1 : 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
    previous = currentDate;
  });

  // TÌM CHUỖI DÀI NHẤT BƯỚC 3. Trả kỷ lục về cho màn Tiến trình.
  return longest;
}
