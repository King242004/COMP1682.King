// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra ngày hoàn thành dùng lịch native tự dựng và không cho chọn tương lai.
// Test đọc source để khóa giao diện không quay lại thư viện datepicker hoặc ô text.
import fs from "fs";
import path from "path";

describe("completed activity date", () => {
  const screen = fs.readFileSync(
    path.join(__dirname, "../src/features/exercise/LogActivityScreen.tsx"),
    "utf8",
  );

  it("uses the themed calendar, blocks future dates and submits the selected date", () => {
    expect(screen).toContain("styles.calendarCard");
    expect(screen).toContain("const disabled = value > todayKey()");
    expect(screen).toContain("date: externalDate");
    expect(screen).not.toContain("DateTimePicker");
  });
});
