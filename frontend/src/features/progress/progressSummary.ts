// ═══ FILE NÀY LÀM GÌ ═══
// Gom món ăn thành số liệu cho các biểu đồ ở màn Tiến trình.
//
// Ai gọi tới: ProgressScreen
// Nhận vào:   danh sách món trong khoảng ngày
// Trả ra:     calo từng ngày, trung bình, và tổng ba chất
// Khi lỗi:    không có món nào thì trả 0, không trả rỗng làm vỡ biểu đồ

// Chỉ tính toán, KHÔNG gọi mạng và không giữ state.
import { dateKey } from "@/utils/dateUtils";
import type { Meal } from "@/features/meals/MealsContext";

export type DaySummary = {
  key: string;
  // Tên thứ viết tắt để hiển thị trên trục biểu đồ, ví dụ "Mon".
  label: string;
  // Tên thứ kèm ngày đầy đủ, ví dụ "Monday, Jun 3, 2026".
  fullLabel: string;
  isToday: boolean;
  // Cho biết ngày này chưa tới vì chế độ tháng hiển thị cả tháng.
  isFuture: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  // Đúng mục tiêu khi lượng calo nằm trong khoảng 80 đến 100 phần trăm.
  onTrack: boolean;
  // Khoảng cách tuyệt đối tới mục tiêu, bằng Infinity khi chưa có món.
  distToGoal: number;
  // Tỷ lệ giữa lượng calo đã ăn và mục tiêu.
  ratio: number;
};

export function getMonthDays(year: number, month: number) {
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let day = 1; day <= lastDate; day++) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

export type MonthTotal = {
  // Khóa tháng theo định dạng "2026-07".
  key: string;
  // Tên tháng viết tắt theo ngôn ngữ, ví dụ "thg 7".
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // Cho biết tháng này nằm sau tháng hiện tại trong cùng năm.
  isFuture: boolean;
};

export function getYearMonthTotals(historyMeals: Meal[], year: number, locale?: string): MonthTotal[] {
  const now = new Date();
  const out: MonthTotal[] = [];
  for (let m = 0; m < 12; m++) {
    const monthMeals = historyMeals.filter((meal) => {
      const d = new Date(meal.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === m;
    });
    out.push({
      key: `${year}-${String(m + 1).padStart(2, "0")}`,
      label: new Date(year, m, 1).toLocaleDateString(locale, { month: "short" }),
      calories: monthMeals.reduce((s, x) => s + x.calories, 0),
      protein: monthMeals.reduce((s, x) => s + (x.protein ?? 0), 0),
      carbs: monthMeals.reduce((s, x) => s + (x.carbs ?? 0), 0),
      fat: monthMeals.reduce((s, x) => s + (x.fat ?? 0), 0),
      isFuture: year > now.getFullYear() || (year === now.getFullYear() && m > now.getMonth()),
    });
  }
  return out;
}

export function getWeekDays(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Chuyển cách đánh số để Thứ hai là 0.
  const dow = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    days.push(x);
  }
  return days;
}

// goal bằng null nghĩa là hồ sơ chưa đủ để tính mục tiêu. Khi đó vẫn dựng được
// tổng calo từng ngày, chỉ riêng cờ onTrack là không có căn cứ để bật.
export function buildDaySummaries(historyMeals: Meal[], goal: number | null, windowDays: Date[], locale?: string): DaySummary[] {
  const todayKey = dateKey(new Date());
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return windowDays.map((d) => {
    const key = dateKey(d);
    const dayMeals = historyMeals.filter((m) => m.date === key);
    const calories = dayMeals.reduce((s, m) => s + m.calories, 0);
    // Chưa có mục tiêu thì tỷ lệ bằng 0, nên onTrack luôn tắt và khoảng cách
    // tới mục tiêu là vô cực. Không có mục tiêu giả nào được dựng ra ở đây.
    const ratio = goal != null && goal > 0 ? calories / goal : 0;
    return {
      key,
      label: d.toLocaleDateString(locale, { weekday: "short" }),
      fullLabel: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" }),
      isToday: key === todayKey,
      isFuture: d.getTime() > todayStart.getTime(),
      calories,
      protein: dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0),
      carbs: dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0),
      fat: dayMeals.reduce((s, m) => s + (m.fat ?? 0), 0),
      mealCount: dayMeals.length,
      onTrack: calories > 0 && ratio >= 0.8 && ratio <= 1.0,
      distToGoal: goal != null && calories > 0 ? Math.abs(calories - goal) : Infinity,
      ratio,
    };
  });
}
