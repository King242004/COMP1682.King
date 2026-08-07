// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra Coach chỉ lên lịch nhóm và thời lượng bài tập tại nhà app có thể mở.
// Test khóa danh mục dùng chung giữa prompt, plan controller và guided routines.
const {
  HOME_EXERCISE_CATEGORIES,
  HOME_EXERCISE_DURATIONS,
  HOME_EXERCISE_GUIDE,
  isAllowedHomeExercise,
} = require("../../src/config/homeRoutineRules");

describe("at-home exercise options available to Coach", () => {
  test("matches the filters available in the app", () => {
    expect(HOME_EXERCISE_CATEGORIES).toEqual(["everyday", "recovery", "strength", "cardio"]);
    expect(HOME_EXERCISE_DURATIONS).toEqual([10, 20, 30]);
    for (const category of HOME_EXERCISE_CATEGORIES) expect(HOME_EXERCISE_GUIDE).toContain(category);
    for (const duration of HOME_EXERCISE_DURATIONS) expect(HOME_EXERCISE_GUIDE).toContain(String(duration));
  });

  test("accepts only guided categories and durations that the app can open", () => {
    expect(isAllowedHomeExercise("everyday", 10)).toBe(true);
    expect(isAllowedHomeExercise("cardio", 30)).toBe(true);
    expect(isAllowedHomeExercise("running", 20)).toBe(false);
    expect(isAllowedHomeExercise("strength", 25)).toBe(false);
  });
});
