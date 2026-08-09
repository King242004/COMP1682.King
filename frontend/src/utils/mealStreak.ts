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
import { dateKey, isLoggedOnSameDay } from "./dateUtils";

// Lọc trước khi đếm, kết quả đưa sang một trong hai hàm đếm bên dưới.
// Chỉ tính chuỗi khi người dùng ghi món đúng vào ngày ăn, tức ngày ghi trùng ngày của món.
// Món thêm bù cho ngày cũ vẫn được cộng vào dinh dưỡng ngày đó, nhưng KHÔNG nối chuỗi,
// kẻo ngồi một buổi ghi bù cả tuần là chuỗi tự dài ra.
export function streakEligibleDates(
  meals: Iterable<{ date: string; createdAt: string }>,
): string[] {
  return [...meals]
    .filter((meal) => isLoggedOnSameDay(meal.createdAt, meal.date))
    .map((meal) => meal.date);
}

// Con số cạnh ngọn lửa ở thanh đầu Trang chủ.
// Đổ danh sách ngày vào Set để tra một ngày là xong ngay,
// không phải duyệt lại cả mảng cho mỗi ngày lùi
export function mealStreak(loggedDates: Iterable<string>): number {
  const logged = new Set(loggedDates);
  let count = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Hôm nay chưa ghi món thì lùi mốc xuất phát về hôm qua
  // Vì ngày hôm nay chưa hết, chưa ghi không có nghĩa là đã đứt chuỗi
  if (!logged.has(dateKey(d))) d.setDate(d.getDate() - 1);
  // Lùi từng ngày, gặp ngày trống là dừng
  // Chặn ở 365 vòng cho chắc, kẻo dữ liệu lạ làm vòng lặp chạy mãi
  for (let i = 0; i < 365; i++) {
    if (!logged.has(dateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// Màn Tiến trình gọi thẳng vào đây, kèm danh sách ngày của khoảng đang xem.
// Khác hàm trên ở chỗ KHÔNG neo vào hôm nay, chuỗi dài nhất nằm ở đâu cũng được.
export function longestMealStreak(loggedDates: Iterable<string>): number {
  // Bỏ ngày trùng, bỏ ngày sai định dạng, rồi xếp tăng dần
  // Phải xếp thì đoạn dưới mới so được ngày này với ngày liền trước
  // Ngày dạng 2026-08-07 nên xếp chuỗi cũng ra đúng thứ tự thời gian
  const dates = [...new Set(loggedDates)]
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  // Duyệt một lượt, đếm dồn khi ngày này liền sau ngày trước
  // Gặp chỗ đứt thì đếm lại từ 1, sau mỗi ngày chốt xem có phá kỷ lục không
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

  return longest;
}
