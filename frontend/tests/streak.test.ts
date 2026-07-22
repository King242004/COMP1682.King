import { mealStreak } from "@/utils/streak";

describe("mealStreak", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 23, 12));
  });

  afterEach(() => jest.useRealTimers());

  test("counts consecutive logged days including today", () => {
    expect(mealStreak(["2026-07-23", "2026-07-22", "2026-07-21"])).toBe(3);
  });

  test("starts from yesterday when today has not been logged yet", () => {
    expect(mealStreak(["2026-07-22", "2026-07-21"])).toBe(2);
  });

  test("stops at the first missing day", () => {
    expect(mealStreak(["2026-07-23", "2026-07-21"])).toBe(1);
  });
});
