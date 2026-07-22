import { dateKey } from "@/utils/date";

describe("dateKey", () => {
  test("formats local dates without UTC shifting", () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 45))).toBe("2026-01-05");
  });

  test("pads single-digit months and days", () => {
    expect(dateKey(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});
