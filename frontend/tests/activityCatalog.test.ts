// ═══ FILE NÀY LÀM GÌ ═══
// Khóa danh sách hoạt động phổ biến và khóa tra cứu liên kết tới MET phía server.
// Test đạt khi catalog frontend chỉ giữ lựa chọn hiển thị, không tự bịa số MET.
import fs from "fs";
import path from "path";
import { POPULAR_ACTIVITIES } from "../src/config/activityCatalog";

describe("popular external activities", () => {
  test("uses traceable catalogue entries without custom MET input", () => {
    expect(POPULAR_ACTIVITIES.map((activity) => activity.key)).toEqual([
      "walking",
      "jogging",
      "badminton",
      "volleyball",
      "football",
      "shuttlecock",
      "cycling",
      "gym",
      "martial_arts",
      "yoga",
      "basketball",
      "jump_rope",
      "swimming",
      "table_tennis",
    ]);
    expect(POPULAR_ACTIVITIES.every(
      (activity) => activity.met > 0 && Boolean(activity.code || activity.source),
    )).toBe(true);
  });
});
// Bộ khóa hai bên phải TRÙNG KHÍT. Gửi lên khóa lạ thì exerciseController trả
// "Unknown exercise reference"; khai thiếu khóa thì có mục backend hỗ trợ mà app
// không cho chọn. Trước ngày 9/8/2026 frontend khai 30 hoạt động, backend chỉ
// nhận 14, và 16 mục thừa nằm chết trong file suốt nhiều tháng.
describe("khóa hoạt động khớp với backend", () => {
  test("đúng bằng bộ khóa của EXTERNAL_ACTIVITIES", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../backend/src/config/exerciseCatalog.js"),
      "utf8"
    );
    const start = source.indexOf("const EXTERNAL_ACTIVITIES = {");
    const body = source.slice(start, source.indexOf("\n};", start));
    const backendKeys = [...body.matchAll(/^ {2}(\w+):/gm)].map((match) => match[1]);

    expect(backendKeys.length).toBe(14);
    expect(POPULAR_ACTIVITIES.map((activity) => activity.key).sort()).toEqual(backendKeys.sort());
  });
});

// Nhãn hiển thị phải có đủ cho từng khóa, kẻo màn hiện ra mã kỹ thuật.
describe("i18n có nhãn cho mọi hoạt động", () => {
  test.each(["en", "vi"])("%s khai đủ nhãn", (lang) => {
    const source = fs.readFileSync(path.join(__dirname, `../src/i18n/${lang}.ts`), "utf8");
    const start = source.indexOf("activities: {");
    const body = source.slice(start, source.indexOf("}", start));
    const labels = [...body.matchAll(/^ {6}(\w+):/gm)].map((match) => match[1]);
    expect(labels.sort()).toEqual(POPULAR_ACTIVITIES.map((activity) => activity.key).sort());
  });
});
