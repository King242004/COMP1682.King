import type { Meal } from "@/context/MealsContext";
import { buildDaySummaries } from "@/features/progress/summary";
import { dateKey } from "@/utils/date";

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
    const summaries = buildDaySummaries(
      [meal(today, 800), meal(today, 900)],
      2000,
      2
    );
    const summary = summaries.at(-1)!;

    expect(summary.calories).toBe(1700);
    expect(summary.mealCount).toBe(2);
    expect(summary.onTrack).toBe(true);
    expect(summary.ratio).toBeCloseTo(0.85);
  });
});
