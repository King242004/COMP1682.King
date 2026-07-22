jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock("@/utils/notifications", () => ({
  cancelNotification: jest.fn(),
  scheduleDailyReminder: jest.fn(),
}));

import {
  emptyReminders,
  enabledCount,
  formatTime,
  parseTime,
} from "@/utils/reminders";

describe("reminder helpers", () => {
  test.each([
    ["8:05", [8, 5]],
    ["08:05", [8, 5]],
    ["23:59", [23, 59]],
  ])("parses valid time %s", (raw, expected) => {
    expect(parseTime(raw)).toEqual(expected);
  });

  test.each(["", "8:5", "24:00", "12:60", "noon"])(
    "rejects invalid time %s",
    (raw) => expect(parseTime(raw)).toBeNull()
  );

  test("formats a normalized 24-hour time", () => {
    expect(formatTime(8, 5)).toBe("08:05");
  });

  test("creates disabled defaults and counts enabled reminders", () => {
    const reminders = emptyReminders();
    expect(enabledCount(reminders)).toBe(0);
    reminders.breakfast.enabled = true;
    reminders.dinner.enabled = true;
    expect(enabledCount(reminders)).toBe(2);
  });
});
