// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra lớp lọc tên món theo bệnh nền và khẩu vị sau khi AI trả.
// Test khóa danh sách giữ/loại và bảo đảm bệnh lạ không làm sập luồng.
const { forbiddenFor, filterDishes, forbiddenByTaste } = require("../../src/services/nutrition/foodSafetyFilter");

describe("forbiddenFor (per-condition ingredient blocklist)", () => {
  test("gout blocks shellfish, red meat, organ meats, beer", () => {
    expect(forbiddenFor("Canh bí đao nấu tôm", ["gout"])).toBe("gout");
    expect(forbiddenFor("Phở bò tái", ["gout"])).toBe("gout");
    expect(forbiddenFor("Cháo lòng", ["gout"])).toBe("gout");
    expect(forbiddenFor("Lẩu hải sản", ["gout"])).toBe("gout");
  });

  test("gout allows safe dishes", () => {
    expect(forbiddenFor("Cơm gạo lứt ức gà luộc", ["gout"])).toBeNull();
    expect(forbiddenFor("Cháo yến mạch trứng gà", ["gout"])).toBeNull();
    expect(forbiddenFor("Sữa chua không đường", ["gout"])).toBeNull();
  });

  test("diabetes blocks sugary desserts and drinks", () => {
    expect(forbiddenFor("Chè ba màu", ["diabetes"])).toBe("diabetes");
    expect(forbiddenFor("Trà sữa trân châu", ["diabetes"])).toBe("diabetes");
    expect(forbiddenFor("Gà luộc", ["diabetes"])).toBeNull();
  });

  test("hypertension blocks salty and processed foods", () => {
    expect(forbiddenFor("Bún mắm", ["hypertension"])).toBe("hypertension");
    expect(forbiddenFor("Cơm lạp xưởng", ["hypertension"])).toBe("hypertension");
    expect(forbiddenFor("Canh rau ngót thịt bằm", ["hypertension"])).toBeNull();
  });

  test("high_cholesterol blocks fried food and organ meats", () => {
    expect(forbiddenFor("Gà chiên nước mắm", ["high_cholesterol"])).toBe("high_cholesterol");
    expect(forbiddenFor("Cá kho tộ", ["high_cholesterol"])).toBeNull();
  });

  test("gastritis blocks spicy and sour dishes plus coffee", () => {
    expect(forbiddenFor("Bún bò Huế cay", ["gastritis"])).toBe("gastritis");
    expect(forbiddenFor("Canh chua cá lóc", ["gastritis"])).toBe("gastritis");
    expect(forbiddenFor("Cháo trắng trứng muối", ["gastritis"])).toBeNull();
  });

  test("no conditions = nothing blocked", () => {
    expect(forbiddenFor("Canh bí đao nấu tôm", [])).toBeNull();
    expect(forbiddenFor("Phở bò", undefined)).toBeNull();
  });

  test("multiple conditions: first violated one is reported", () => {
    expect(forbiddenFor("Lẩu tôm chua cay", ["gout", "gastritis"])).toBe("gout");
    expect(forbiddenFor("Canh chua chay", ["gout", "gastritis"])).toBe("gastritis");
  });
});

describe("filterDishes (split kept/removed)", () => {
  test("keeps safe dishes, removes violating ones with the reason", () => {
    const dishes = [
      { name: "Cơm gạo lứt ức gà" },
      { name: "Canh bí đao nấu tôm" },
      { name: "Sữa chua không đường" },
      { name: "Phở bò" },
    ];
    const { kept, removed } = filterDishes(dishes, ["gout"]);
    expect(kept.map((d) => d.name)).toEqual(["Cơm gạo lứt ức gà", "Sữa chua không đường"]);
    expect(removed).toEqual([
      { name: "Canh bí đao nấu tôm", condition: "gout" },
      { name: "Phở bò", condition: "gout" },
    ]);
  });

  test("no conditions returns everything", () => {
    const dishes = [{ name: "Phở bò" }];
    const { kept, removed } = filterDishes(dishes, []);
    expect(kept).toHaveLength(1);
    expect(removed).toHaveLength(0);
  });
});

describe("forbiddenByTaste", () => {
  test("matches saved avoidances across Vietnamese and English dish names", () => {
    expect(forbiddenByTaste("Cơm gà", "no chicken")).toBe("ga");
    expect(forbiddenByTaste("Chicken rice", "không ăn thịt gà")).toBe("chicken");
    expect(forbiddenByTaste("Cơm bò", "no chicken")).toBeNull();
    expect(forbiddenByTaste("Cơm gà", "love chicken")).toBeNull();
  });
});

// `conditions` đến từ User.healthConditions; profileController.updateProfile không kiểm từng giá trị,
// nên `RULES[c]` có thể tra trúng thuộc tính mà mọi object JavaScript thừa kế.
// `RULES["constructor"]` trả về hàm tạo chứ không phải undefined, lọt qua phép
// kiểm truthy rồi chết ở `re.test`. Cùng lỗi này `exerciseCatalog.js` đã tránh
// được bằng `Object.hasOwn`, chỉ file này bị sót.
describe("khoá bệnh lạ không được làm sập bộ lọc", () => {
  test.each(["constructor", "toString", "hasOwnProperty", "__proto__"])(
    "khoá kế thừa %s bị bỏ qua thay vì ném lỗi",
    (key) => {
      expect(() => forbiddenFor("Cơm trắng", [key])).not.toThrow();
      expect(forbiddenFor("Cơm trắng", [key])).toBeNull();
    },
  );

  test("khoá không có thật thì bỏ qua, bệnh thật đứng cạnh vẫn lọc đúng", () => {
    expect(forbiddenFor("Canh chua", ["banana", "gastritis"])).toBe("gastritis");
    const dishes = [{ name: "Canh chua" }, { name: "Cơm trắng" }];
    const { kept, removed } = filterDishes(dishes, ["constructor", "gastritis"]);
    expect(kept).toEqual([{ name: "Cơm trắng" }]);
    expect(removed).toEqual([{ name: "Canh chua", condition: "gastritis" }]);
  });
});
