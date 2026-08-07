// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra gom lịch sử món thành số liệu ngày cho biểu đồ Tiến trình.
// Test khóa tổng, tỷ lệ mục tiêu, ngày tương lai và nhánh chưa có mục tiêu.
import type { Meal } from "@/features/meals/MealsContext";
import { buildDaySummaries } from "@/features/progress/progressSummary";
import { dateKey } from "@/utils/dateUtils";

const meal = (date: string, calories: number): Meal => ({
  id: `${date}-${calories}`,
  name: "Test meal",
  calories,
  protein: 20,
  carbs: 30,
  fat: 10,
  mealType: "lunch",
  date,
  createdAt: `${date}T12:00:00.000Z`,
});

describe("buildDaySummaries", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 23, 12));
  });

  afterEach(() => jest.useRealTimers());

  test("groups meals by logged date and calculates goal progress", () => {
    const today = dateKey(new Date());
    // Dựng cửa sổ hai ngày ngay tại đây. Trước kia test gọi getLastNDays trong
    // source, nhưng hàm đó không còn màn nào dùng nên đã bị xóa khỏi source.
    const startOfDay = (offsetDays: number) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offsetDays);
      return d;
    };
    const summaries = buildDaySummaries(
      [meal(today, 800), meal(today, 900)],
      2000,
      [startOfDay(1), startOfDay(0)]
    );
    const summary = summaries.at(-1)!;

    expect(summary.calories).toBe(1700);
    expect(summary.mealCount).toBe(2);
    expect(summary.onTrack).toBe(true);
    expect(summary.ratio).toBeCloseTo(0.85);
  });
});
