// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra lưới lịch hoạt động đủ ô và chuyển tháng không lệch năm/ngày.
// Các ngày cố định khóa logic của lịch native trong LogActivityScreen.
import { calendarMonthDays, shiftCalendarMonth } from "@/features/exercise/calendarUtils";

describe("exercise calendar", () => {
  it("builds Monday-first complete weeks and crosses year boundaries", () => {
    const february = calendarMonthDays(new Date(2026, 1, 1));

    expect(february).toHaveLength(35);
    expect(february.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(february[6]).toBe(1);
    expect(february[33]).toBe(28);
    expect(shiftCalendarMonth(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 1));
  });
});
