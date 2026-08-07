// ═══ FILE NÀY LÀM GÌ ═══
// Đánh mạnh vào cửa chặn duy nhất giữa dữ liệu bên ngoài và database món ăn.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là dữ liệu rác lọt được vào database, hoặc dữ liệu
//             hợp lệ bị chặn nhầm
//
// Vì sao đánh mạnh chỗ này: BỐN đường ghi món đều đi qua đây, gồm nhập tay,
// quét ảnh, Coach và kế hoạch tuần. Ba trong bốn đường có dữ liệu do AI sinh ra,
// tức không kiểm soát được đầu vào. Đây là chỗ cuối cùng chặn được.
const { validateMealInput, validateMealName, validateNutritionValues } = require("../../src/validators/mealInputValidator");
const { MEAL_TYPES, NUTRITION_SOURCES } = require("../../src/config/mealEnums");

const TODAY = "2026-08-07";
const ok = { name: "Phở bò", mealType: "lunch", calories: 500, date: TODAY };

describe("tên món", () => {
  test.each([["Phở"], ["Cơm tấm sườn bì chả"], ["ab"]])("nhận tên hợp lệ %p", (name) => {
    expect(validateMealName(name).error).toBeUndefined();
  });

  test.each([["a"], [""], ["   "], [null], [undefined], [123], [{}], [[]]])(
    "từ chối tên không hợp lệ %p",
    (name) => expect(validateMealName(name).error).toBeDefined(),
  );

  test("cắt khoảng trắng thừa trước khi đo độ dài", () => {
    expect(validateMealName("  Phở bò  ").value).toBe("Phở bò");
    expect(validateMealName("  a  ").error).toBeDefined();
  });

  test("tên quá dài bị chặn", () => {
    expect(validateMealName("x".repeat(500)).error).toBeDefined();
  });
});

describe("số dinh dưỡng", () => {
  test("thiếu đạm tinh bột chất béo thì mặc định 0, không phải lỗi", () => {
    expect(validateNutritionValues({ calories: 500 }).value).toEqual({
      calories: 500, protein: 0, carbs: 0, fat: 0,
    });
  });

  test.each([
    ["âm", { calories: -1 }],
    ["vô cực", { calories: Infinity }],
    ["âm vô cực", { calories: -Infinity }],
    ["không phải số", { calories: "nhiều" }],
    ["NaN", { calories: NaN }],
    ["quá lớn", { calories: 10000 }],
    ["null", { calories: null }],
    ["object", { calories: {} }],
  ])("từ chối calo %s", (_label, input) => {
    expect(validateNutritionValues(input).error).toBeDefined();
  });

  test.each([
    ["đạm âm", { calories: 500, protein: -1 }],
    ["tinh bột vô cực", { calories: 500, carbs: Infinity }],
    ["chất béo quá lớn", { calories: 500, fat: 10000 }],
    ["đạm là chữ", { calories: 500, protein: "abc" }],
  ])("từ chối %s", (_label, input) => {
    expect(validateNutritionValues(input).error).toBeDefined();
  });

  // Mảng một phần tử tự ép về số trong JavaScript, `Number([500])` ra 500.
  // Không chặn vì kết quả vẫn đúng, nhưng ghi lại để ai đọc sau không tưởng là sót.
  test("mảng một phần tử ép về đúng con số bên trong", () => {
    expect(validateNutritionValues({ calories: [500] }).value.calories).toBe(500);
  });

  test("chuỗi chứa số vẫn nhận, vì app gửi lên từ ô nhập chữ", () => {
    expect(validateNutritionValues({ calories: "500", protein: "20" }).value).toMatchObject({
      calories: 500, protein: 20,
    });
  });

  test("nhận đúng giá trị biên", () => {
    expect(validateNutritionValues({ calories: 0 }).error).toBeUndefined();
    expect(validateNutritionValues({ calories: 9999 }).error).toBeUndefined();
    expect(validateNutritionValues({ calories: 500, protein: 9999 }).error).toBeUndefined();
  });
});

describe("cả bản ghi món", () => {
  test("bản ghi tối thiểu hợp lệ thì qua", () => {
    expect(validateMealInput(ok, "u1", TODAY).error).toBeUndefined();
  });

  test.each(MEAL_TYPES)("nhận buổi ăn %s", (mealType) => {
    expect(validateMealInput({ ...ok, mealType }, "u1", TODAY).error).toBeUndefined();
  });

  test.each([["brunch"], [""], ["LUNCH"], ["constructor"], [null], [123]])(
    "từ chối buổi ăn không có thật %p",
    (mealType) => expect(validateMealInput({ ...ok, mealType }, "u1", TODAY).error).toBeDefined(),
  );

  test.each(NUTRITION_SOURCES)("nhận nguồn dinh dưỡng %s", (nutritionSource) => {
    expect(validateMealInput({ ...ok, nutritionSource }, "u1", TODAY).error).toBeUndefined();
  });

  test.each([["bịa"], ["AI_ESTIMATE"], ["constructor"]])(
    "từ chối nguồn dinh dưỡng %p",
    (nutritionSource) =>
      expect(validateMealInput({ ...ok, nutritionSource }, "u1", TODAY).error).toBeDefined(),
  );

  // Ghi món cho ngày mai là cách dễ nhất để làm hỏng mọi thống kê theo ngày.
  test("từ chối ngày trong tương lai", () => {
    expect(validateMealInput({ ...ok, date: "2026-08-08" }, "u1", TODAY).error).toBeDefined();
  });

  test("cho phép ghi lại ngày đã qua", () => {
    expect(validateMealInput({ ...ok, date: "2026-08-01" }, "u1", TODAY).error).toBeUndefined();
  });

  test.each([["07-08-2026"], ["2026/08/07"], ["2026-8-7"], ["hôm nay"], [""], [null]])(
    "từ chối định dạng ngày %p",
    (date) => expect(validateMealInput({ ...ok, date }, "u1", TODAY).error).toBeDefined(),
  );

  test.each([
    ["khẩu phần âm", { portionAmount: -1 }],
    ["khẩu phần bằng 0", { portionAmount: 0 }],
    ["khẩu phần là chữ", { portionAmount: "hai" }],
    ["đơn vị quá dài", { portionUnit: "x".repeat(200) }],
    ["mô tả khẩu phần quá dài", { portionText: "x".repeat(2000) }],
    ["ghi chú quá dài", { note: "x".repeat(5000) }],
  ])("từ chối %s", (_label, extra) => {
    expect(validateMealInput({ ...ok, ...extra }, "u1", TODAY).error).toBeDefined();
  });

  test("không có khẩu phần thì vẫn hợp lệ, vì đó là trường tùy chọn", () => {
    expect(validateMealInput(ok, "u1", TODAY).error).toBeUndefined();
  });

  test.each([[null], [undefined], ["chuỗi"], [123], [[]]])(
    "đầu vào kiểu lạ %p không làm sập validator",
    (input) => {
      expect(() => validateMealInput(input, "u1", TODAY)).not.toThrow();
      expect(validateMealInput(input, "u1", TODAY).error).toBeDefined();
    },
  );
});
