// ═══ FILE NÀY LÀM GÌ ═══
// Khoá ba thứ chưa có test nào canh: phép tính calo đốt, bảng giá trị hợp lệ
// của món ăn, và thứ tự middleware trên các route tốn lượt AI.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là hoặc calo đốt sai, hoặc route sập khi có người gọi
//
// Vì sao gộp ba thứ này vào một file: cả ba đều là HỢP ĐỒNG giữa nhiều file,
// không phải logic của riêng ai, nên hỏng thì hỏng lan chứ không hỏng một chỗ.
const fs = require("fs");
const path = require("path");
const { computeBurned, getExternalActivity, getGuidedRoutine } = require("../../src/config/exerciseCatalog");
const { MEAL_TYPES, NUTRITION_SOURCES } = require("../../src/config/mealEnums");

const readSource = (relative) =>
  fs.readFileSync(path.join(__dirname, "../../src", relative), "utf8");

describe("calo đốt tính đúng công thức MET", () => {
  // MET nhân cân nặng nhân số giờ. Đây là công thức chuẩn của Compendium.
  test.each([
    // met, phút, kg, kỳ vọng
    [3.8, 60, 70, 266],
    [3.8, 30, 70, 133],
    [7.5, 45, 60, 338],
    [6.0, 90, 55, 495],
    [2.3, 10, 80, 31],
  ])("MET %s trong %s phút, %s kg -> %s kcal", (met, minutes, weight, expected) => {
    expect(computeBurned(met, minutes, weight)).toBe(expected);
  });

  test("gấp đôi thời lượng thì gấp đôi calo", () => {
    expect(computeBurned(5, 60, 70)).toBe(computeBurned(5, 30, 70) * 2);
  });

  test("gấp đôi cân nặng thì gấp đôi calo", () => {
    expect(computeBurned(5, 30, 100)).toBe(computeBurned(5, 30, 50) * 2);
  });

  test("luôn trả về số nguyên, vì giao diện hiện số nguyên", () => {
    for (const [met, minutes, weight] of [[3.8, 37, 63.5], [7.5, 13, 71.2], [2.3, 7, 48.9]]) {
      expect(Number.isInteger(computeBurned(met, minutes, weight))).toBe(true);
    }
  });
});

describe("tra bảng hoạt động không sập với khoá lạ", () => {
  // Cùng loại lỗi đã sửa ở foodSafetyFilter: khoá kế thừa của mọi object
  // lọt qua phép kiểm truthy rồi chết ở dòng sau.
  test.each(["constructor", "toString", "hasOwnProperty", "__proto__", "khong-co-that", ""])(
    "khoá %p trả null chứ không ném lỗi",
    (key) => {
      expect(() => getExternalActivity(key)).not.toThrow();
      expect(() => getGuidedRoutine(key)).not.toThrow();
      expect(getExternalActivity(key)).toBeNull();
      expect(getGuidedRoutine(key)).toBeNull();
    },
  );

  test("khoá thật vẫn tra được", () => {
    expect(getExternalActivity("walking")).toMatchObject({ met: 3.8, code: "17190" });
    expect(getGuidedRoutine("wakeUp10")).toMatchObject({ category: "everyday", durationMin: 10 });
  });
});

describe("bảng giá trị hợp lệ của món ăn", () => {
  // Tám file cùng đọc bảng này. Đổi giá trị mà quên một chỗ thì dữ liệu
  // qua được validator rồi chết ở tầng model.
  test("bốn buổi ăn, đúng thứ tự hiện trên giao diện", () => {
    expect(MEAL_TYPES).toEqual(["breakfast", "lunch", "dinner", "snack"]);
  });

  test("tám nguồn số liệu dinh dưỡng", () => {
    expect(NUTRITION_SOURCES).toEqual([
      "manual", "ai_estimate", "ai_adjusted", "photo_scan",
      "barcode", "community", "repeat", "ai_suggestion",
    ]);
  });

  test("mọi file dùng bảng này đều import chứ không chép tay danh sách", () => {
    const users = [
      "models/Meal.js", "models/PlanMeal.js", "models/Post.js",
      "validators/mealInputValidator.js", "controllers/mealController.js",
      "controllers/planController.js", "controllers/coachController.js",
      "controllers/community/postController.js",
    ];
    for (const file of users) {
      expect(readSource(file)).toContain("mealEnums");
    }
  });
});

describe("route tốn lượt AI phải nằm SAU lớp kiểm đăng nhập", () => {
  // aiLimiter đếm theo `req.user.id`. Chạy trước lớp đăng nhập thì `req.user`
  // chưa có, và cả route sập ngay lượt gọi đầu tiên.
  test.each(["coachRoutes.js", "planRoutes.js", "scanRoutes.js"])("%s", (file) => {
    const source = readSource(path.join("routes", file));
    expect(source).toContain("aiLimiter");
    const protectAt = source.indexOf("router.use(protect)");
    const firstLimiterUse = source.indexOf("aiLimiter,");
    expect(protectAt).toBeGreaterThan(-1);
    expect(firstLimiterUse).toBeGreaterThan(protectAt);
  });

  test("aiLimiter đếm theo từng người dùng, không đếm chung cả app", () => {
    const source = readSource("middleware/rateLimiters.js");
    expect(source).toMatch(/keyGenerator[^\n]*req\.user\.id/);
  });
});

describe("hai trường hồ sơ nuôi phép tính đều có enum ở tầng model", () => {
  // activityLevel nhân thẳng vào TDEE, goal quyết định cộng hay trừ calo.
  // Không có enum thì một giá trị lạ đi thẳng vào công thức.
  test("User.js khai enum cho activityLevel và goal", () => {
    const model = readSource("models/User.js");
    expect(model).toMatch(/activityLevel:\s*\{[^}]*enum:\s*\["sedentary", "moderate", "active"\]/s);
    expect(model).toMatch(/goal:\s*\{[^}]*enum:\s*WEIGHT_GOAL_VALUES/s);
  });
});
