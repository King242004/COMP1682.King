import { POPULAR_ACTIVITIES } from "../src/config/activityCatalog";

describe("popular external activities", () => {
  test("uses traceable catalogue entries without custom MET input", () => {
    expect(POPULAR_ACTIVITIES.map((activity) => activity.key)).toEqual([
      "walking",
      "jogging",
      "cycling",
      "swimming",
      "badminton",
      "football",
      "basketball",
      "volleyball",
    ]);
    expect(POPULAR_ACTIVITIES.every((activity) => activity.met > 0 && activity.code)).toBe(true);
  });
});
// Tests the supported physical activity catalog.
