import { longestMealStreak, mealStreak } from "@/utils/streak";

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

describe("longestMealStreak", () => {
  test("finds the longest run inside a reporting period", () => {
    expect(
      longestMealStreak([
        "2026-07-20",
        "2026-07-21",
        "2026-07-22",
        "2026-07-23",
        "2026-07-25",
      ]),
    ).toBe(4);
  });

  test("does not count duplicate dates more than once", () => {
    expect(longestMealStreak(["2026-07-20", "2026-07-20", "2026-07-21"])).toBe(2);
  });

  test("counts a streak across month boundaries", () => {
    expect(longestMealStreak(["2026-07-30", "2026-07-31", "2026-08-01"])).toBe(3);
  });

  test("returns zero when there are no logged dates", () => {
    expect(longestMealStreak([])).toBe(0);
  });
});
