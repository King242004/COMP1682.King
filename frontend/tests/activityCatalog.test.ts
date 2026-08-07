// ═══ FILE NÀY LÀM GÌ ═══
// Khóa danh sách hoạt động phổ biến và khóa tra cứu liên kết tới MET phía server.
// Test đạt khi catalog frontend chỉ giữ lựa chọn hiển thị, không tự bịa số MET.
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
// Tests the supported physical activity catalog.
