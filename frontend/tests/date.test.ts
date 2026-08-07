// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra dateKey tạo ngày YYYY-MM-DD theo giờ địa phương của thiết bị.
// Test khóa các mốc mà chuyển UTC có thể làm lệch ngày.
import { dateKey } from "@/utils/dateUtils";

describe("dateKey", () => {
  test("formats local dates without UTC shifting", () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 45))).toBe("2026-01-05");
  });

  test("pads single-digit months and days", () => {
    expect(dateKey(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});
