// ═══ FILE NÀY LÀM GÌ ═══
// Khoá bốn rủi ro đã rà ra: bấm hai lần tạo hai bản ghi, bệnh nền không có
// enum, và hai cặp logic sinh đôi có thể trôi ra xa nhau.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là một trong bốn rủi ro đã quay lại
//
// Vì sao đọc mã nguồn thay vì gọi hàm: chuyện hai lượt gọi cùng lúc chỉ tái
// hiện được khi có database thật. Nhưng thứ quyết định đúng sai ở đây là
// CÁCH VIẾT: giành quyền bằng một lượt ghi có điều kiện, hay đọc rồi mới ghi.
// Cách viết thì đọc mã nguồn kiểm được, và đó là thứ dễ bị sửa lùi nhất.
const fs = require("fs");
const path = require("path");
const { HEALTH_CONDITIONS } = require("../../src/config/nutritionConstants");
const { RULES } = require("../../src/services/nutrition/foodSafetyFilter");

const readSource = (relative) =>
  fs.readFileSync(path.join(__dirname, "../../src", relative), "utf8");

const handlerBody = (source, name) => {
  const start = source.indexOf(`exports.${name} =`);
  const next = source.indexOf("\nexports.", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
};

describe("nút biến kế hoạch thành dữ liệu thật phải chống bấm hai lần", () => {
  const plan = () => readSource("controllers/planController.js");

  test.each([
    ["markEaten", "PlanMeal"],
    ["markWorkoutDone", "PlanWorkout"],
  ])("%s giành quyền bằng một lượt ghi có điều kiện", (name, model) => {
    const body = handlerBody(plan(), name);
    // Điều kiện `done: false` nằm TRONG câu lệnh ghi, nên database quyết ai thắng.
    expect(body).toMatch(new RegExp(`${model}\\.findOneAndUpdate`));
    expect(body).toMatch(/done:\s*false/);
    // Và không được quay lại kiểu đọc rồi gán rồi lưu.
    expect(body).not.toMatch(/\.done\s*=\s*true/);
    expect(body).not.toMatch(/\.save\(\)/);
  });

  test.each(["markEaten", "markWorkoutDone"])(
    "%s hoàn tác nếu giành được quyền rồi ghi hụt",
    (name) => {
      const body = handlerBody(plan(), name);
      // Không hoàn tác thì kế hoạch bị đánh dấu xong mà nhật ký trống,
      // tức mất dữ liệu im lặng, tệ hơn cả ghi trùng.
      expect(body).toMatch(/catch/);
      expect(body).toMatch(/done:\s*false\s*\}/);
    },
  );
});

describe("bệnh nền có enum ở cả hai tầng", () => {
  test("danh sách khớp CHÍNH XÁC các khóa của bảng lọc an toàn", () => {
    expect([...HEALTH_CONDITIONS].sort()).toEqual(Object.keys(RULES).sort());
  });

  test("không chứa none, vì giao diện gửi mảng rỗng khi chọn Không có", () => {
    expect(HEALTH_CONDITIONS).not.toContain("none");
  });

  test("model khai enum cho conditions", () => {
    expect(readSource("models/User.js")).toMatch(/conditions:\s*\[\{\s*type:\s*String,\s*enum:\s*HEALTH_CONDITIONS/);
  });

  test("controller chặn ngay ở cửa, không đợi model", () => {
    const source = readSource("controllers/profileController.js");
    expect(source).toContain("HEALTH_CONDITIONS.includes");
    expect(source).toMatch(/Array\.isArray\(conditions\)/);
  });
});

describe("hai cặp logic sinh đôi phải khớp nhau", () => {
  // Đoán bữa theo giờ có một bản ở backend và một bản ở frontend.
  // Ghi chú trong code có dặn sửa bên này phải sửa bên kia, nhưng máy không kiểm.
  test("chia bữa theo giờ khớp giữa backend và frontend", () => {
    const boundaries = (source) =>
      [...source.matchAll(/if \(h < (\d+)\) return "(\w+)";/g)].map((m) => `${m[1]}:${m[2]}`);

    const backend = boundaries(readSource("controllers/coachController.js"));
    const frontend = boundaries(
      fs.readFileSync(
        path.join(__dirname, "../../../frontend/src/features/meals/mealHelpers.ts"), "utf8",
      ),
    );
    expect(backend.length).toBeGreaterThan(0);
    expect(backend).toEqual(frontend);
  });

  // Mười hằng số dinh dưỡng nằm ở cả hai bên. Hai cặp đã khoá ở test khác,
  // đây khoá nốt phần còn lại.
  test("mọi hằng số dinh dưỡng chung đều bằng nhau ở hai bên", () => {
    const backend = readSource("config/nutritionConstants.js");
    const frontend = fs.readFileSync(
      path.join(__dirname, "../../../frontend/src/config/nutritionCalculations.ts"), "utf8",
    );
    const numbers = (source, name) => {
      const start = source.indexOf(name);
      if (start === -1) return null;
      const chunk = source.slice(start, source.indexOf(";", start));
      return [...chunk.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => m[0]).join(",");
    };

    const shared = [
      "MIFFLIN_ST_JEOR", "ACTIVITY_MULTIPLIERS", "ATWATER_KCAL_PER_GRAM",
      "CALORIE_FLOOR", "KCAL_PER_KG_BODY_WEIGHT", "PROTEIN_G_PER_KG",
      "PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN", "WEEKLY_RATE_KG",
    ];
    const mismatched = shared.filter((name) => {
      const a = numbers(backend, `const ${name}`);
      const b = numbers(frontend, `export const ${name}`);
      return a === null || b === null || a !== b;
    });
    expect(mismatched).toEqual([]);
  });
});
