const fs = require("fs");
const path = require("path");
const { INPUT_LIMITS, DIGIT_LIMITS, LEGACY_LIMITS } = require("../../src/config/inputLimits");

// Bộ test này khóa hai thứ.
//   1. Từng con số giới hạn, để không ai đổi nhầm rồi không ai biết.
//   2. Quan hệ giữa hai bản hằng số và giữa giới hạn mới với trần lịch sử.
describe("INPUT_LIMITS", () => {
  it("giữ đúng các con số đã chốt", () => {
    expect(INPUT_LIMITS.POST_CAPTION).toBe(300);
    expect(INPUT_LIMITS.MEAL_NAME).toBe(80);
    expect(INPUT_LIMITS.PORTION_TEXT).toBe(40);
    expect(INPUT_LIMITS.PORTION_UNIT).toBe(40);
    expect(INPUT_LIMITS.MEAL_DETAILS).toBe(600);
    expect(INPUT_LIMITS.COACH_MESSAGE).toBe(1000);
    expect(INPUT_LIMITS.TASTE_PREFERENCES).toBe(200);
    expect(INPUT_LIMITS.PLAN_NOTE).toBe(200);
    expect(INPUT_LIMITS.DISPLAY_NAME).toBe(40);
    expect(INPUT_LIMITS.EMAIL).toBe(120);
    expect(INPUT_LIMITS.PASSWORD).toBe(64);
    expect(INPUT_LIMITS.USER_SEARCH).toBe(50);
    expect(INPUT_LIMITS.BARCODE).toBe(14);
    expect(INPUT_LIMITS.REMINDER_TIME).toBe(5);
    expect(INPUT_LIMITS.OTP_CODE).toBe(6);
  });

  it("giữ ô mã xác minh khớp đúng độ dài mã mà backend sinh ra", () => {
    const { generateOTP } = require("../../src/utils/otpSecurity");
    for (let i = 0; i < 50; i++) {
      expect(generateOTP()).toHaveLength(INPUT_LIMITS.OTP_CODE);
    }
  });

  it("giữ mật khẩu dưới ngưỡng 72 byte mà bcrypt băm", () => {
    expect(INPUT_LIMITS.PASSWORD).toBeLessThan(72);
  });

  it("giữ mã vạch khớp đúng luật 8 tới 14 chữ số của scanController", () => {
    expect(INPUT_LIMITS.BARCODE).toBe(14);
  });
});

describe("LEGACY_LIMITS", () => {
  // Trần lịch sử phải LỚN HƠN HOẶC BẰNG giới hạn hiện hành. Nếu nhỏ hơn thì
  // bản ghi cũ sẽ không sửa và lưu lại được, đúng cái lỗi mà nó sinh ra để tránh.
  it("không bao giờ nhỏ hơn giới hạn hiện hành", () => {
    const pairs = [
      ["POST_CAPTION", 500],
      ["MEAL_NAME", 100],
      ["PORTION_TEXT", 80],
      ["MEAL_DETAILS", 2000],
      ["TASTE_PREFERENCES", 300],
      ["COACH_MESSAGE", 2000],
    ];
    for (const [key, expected] of pairs) {
      expect(LEGACY_LIMITS[key]).toBe(expected);
      const current = INPUT_LIMITS[key];
      if (current !== undefined) {
        expect(LEGACY_LIMITS[key]).toBeGreaterThanOrEqual(current);
      }
    }
  });
});

describe("DIGIT_LIMITS", () => {
  it("giữ đúng số chữ số đã chốt", () => {
    expect(DIGIT_LIMITS.AGE).toBe(3);
    expect(DIGIT_LIMITS.WEIGHT).toBe(5);
    expect(DIGIT_LIMITS.HEIGHT).toBe(5);
    expect(DIGIT_LIMITS.CALORIE).toBe(4);
    expect(DIGIT_LIMITS.MACRO).toBe(4);
    expect(DIGIT_LIMITS.CALORIE_GOAL).toBe(5);
  });

  it("phủ được trọn khoảng hợp lệ của hồ sơ", () => {
    const { PROFILE_LIMITS } = require("../../src/config/nutritionConstants");
    expect(String(PROFILE_LIMITS.age.max).length).toBeLessThanOrEqual(DIGIT_LIMITS.AGE);
    expect(String(PROFILE_LIMITS.weightKg.max).length).toBeLessThanOrEqual(DIGIT_LIMITS.WEIGHT);
    expect(String(PROFILE_LIMITS.heightCm.max).length).toBeLessThanOrEqual(DIGIT_LIMITS.HEIGHT);
    expect(String(PROFILE_LIMITS.calorieGoal.max).length).toBeLessThanOrEqual(DIGIT_LIMITS.CALORIE_GOAL);
  });
});

// Bản hằng số của giao diện là một file TypeScript nên Node không require được.
// Cách đi vòng: đọc file đó dưới dạng văn bản rồi bóc từng con số ra so sánh.
// Nhờ vậy test chạy bằng Node thuần, không cần dựng thêm cấu hình cho TypeScript.
describe("hai bản hằng số phải khớp nhau", () => {
  const frontendFile = path.join(
    __dirname, "..", "..", "..", "frontend", "src", "config", "inputLimits.ts"
  );

  const readBlock = (source, blockName) => {
    const start = source.indexOf(`export const ${blockName} = {`);
    if (start === -1) throw new Error(`Không tìm thấy khối ${blockName}`);
    const end = source.indexOf("}", start);
    const body = source.slice(start, end);
    const found = {};
    for (const match of body.matchAll(/^\s*([A-Z_]+):\s*(\d+),/gm)) {
      found[match[1]] = Number(match[2]);
    }
    return found;
  };

  const source = fs.readFileSync(frontendFile, "utf8");

  it("giao diện có đủ mọi khóa mà backend khai", () => {
    const frontendLimits = readBlock(source, "INPUT_LIMITS");
    // PORTION_UNIT chỉ backend dùng, vì đơn vị khẩu phần do app chọn từ danh sách
    // chứ người dùng không gõ tay, nên nó không cần có mặt ở giao diện.
    const uiKeys = Object.keys(INPUT_LIMITS).filter((key) => key !== "PORTION_UNIT");
    for (const key of uiKeys) {
      expect(frontendLimits).toHaveProperty(key);
    }
  });

  it("giới hạn ở giao diện không bao giờ lớn hơn ở backend", () => {
    const frontendLimits = readBlock(source, "INPUT_LIMITS");
    for (const [key, value] of Object.entries(frontendLimits)) {
      const ceiling = LEGACY_LIMITS[key] ?? INPUT_LIMITS[key];
      expect(ceiling).toBeDefined();
      expect(value).toBeLessThanOrEqual(ceiling);
    }
  });

  it("số chữ số của hai bên giống hệt nhau", () => {
    const frontendDigits = readBlock(source, "DIGIT_LIMITS");
    expect(frontendDigits).toEqual(DIGIT_LIMITS);
  });
});
