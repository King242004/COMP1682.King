// ═══ FILE NÀY LÀM GÌ ═══
// Đếm chuỗi ngày ghi món liên tiếp.
//
// Ai gọi tới: AppHeader (chuỗi đang chạy), ProgressScreen (chuỗi dài nhất)
// Nhận vào:   danh sách món kèm ngày
// Trả ra:     số ngày liên tiếp
// Khi lỗi:    không có món nào thì trả 0, không trả rỗng
//   mealStreak đếm chuỗi ĐANG chạy tính lùi từ hôm nay, hiện ở thanh đầu Trang chủ.
//   longestMealStreak tìm chuỗi DÀI NHẤT trong khoảng đang xem, hiện ở màn Tiến trình.
import { dateKey } from "./dateUtils";

// Chỉ tính streak khi người dùng ghi món đúng vào ngày ăn.
// Món được thêm bù cho ngày cũ vẫn cập nhật dinh dưỡng của ngày đó nhưng không nối streak.
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

// Đếm số ngày liên tiếp có ít nhất một món, tính lùi từ hôm nay.
// Nếu hôm nay chưa ghi món thì chuỗi chưa bị ngắt vì ngày vẫn chưa kết thúc.
// Khi đó bắt đầu đếm từ hôm qua.
export function mealStreak(loggedDates: Iterable<string>): number {
  const logged = new Set(loggedDates);
  let count = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (!logged.has(dateKey(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    if (!logged.has(dateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// Tìm chuỗi ngày ghi món liên tiếp dài nhất trong khoảng báo cáo được cung cấp.
export function longestMealStreak(loggedDates: Iterable<string>): number {
  const dates = [...new Set(loggedDates)]
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  dates.forEach((key) => {
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
