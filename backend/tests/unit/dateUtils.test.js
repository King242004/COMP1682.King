const { requestTodayKey, todayKey } = require("../../src/utils/dateUtils");

describe("date utilities", () => {
  const now = new Date("2026-08-05T18:30:00.000Z");

  test("uses the device timezone offset without hardcoding a country", () => {
    expect(todayKey(-420, now)).toBe("2026-08-06");
    expect(todayKey(300, now)).toBe("2026-08-05");
  });

  test("reads the shared request header and falls back to UTC", () => {
    expect(requestTodayKey({ get: () => "-420" }, now)).toBe("2026-08-06");
    expect(requestTodayKey({ get: () => "invalid" }, now)).toBe("2026-08-05");
  });
});
