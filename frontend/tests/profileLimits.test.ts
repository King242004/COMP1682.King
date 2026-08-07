// ═══ FILE NÀY LÀM GÌ ═══
// Khoá PROFILE_LIMITS của frontend phải khớp backend/src/config/nutritionConstants.js,
// và không màn nào được gõ tay lại mấy con số đó.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì, tự đọc file nguồn của cả hai bên
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là hai bên đã lệch, hoặc có màn gõ tay số trở lại
//
// Nhớ: profileController.updateProfile kiểm request cuối cùng. Test này chỉ chặn
// hai bản PROFILE_LIMITS trôi ra xa nhau mà không ai biết.
import fs from "fs";
import path from "path";
import { PROFILE_LIMITS } from "@/config/nutritionCalculations";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

// Đọc PROFILE_LIMITS từ backend/src/config/nutritionConstants.js. Dùng fs thay vì
// require vì gói backend nằm ngoài rootDir của Jest frontend.
function backendProfileLimits(): Record<string, { min: number; max: number }> {
  const source = readSource("../../backend/src/config/nutritionConstants.js");
  const start = source.indexOf("const PROFILE_LIMITS");
  const body = source.slice(start, source.indexOf("};", start));
  const limits: Record<string, { min: number; max: number }> = {};
  for (const match of body.matchAll(/(\w+):\s*\{\s*min:\s*([\d.]+),\s*max:\s*([\d.]+)\s*\}/g)) {
    limits[match[1]] = { min: Number(match[2]), max: Number(match[3]) };
  }
  return limits;
}

describe("PROFILE_LIMITS khớp giữa frontend và backend", () => {
  const backend = backendProfileLimits();

  test("đọc được bảng bên backend", () => {
    expect(Object.keys(backend).sort()).toEqual(["age", "calorieGoal", "heightCm", "weightKg"]);
  });

  test("frontend khai đủ bốn trường như backend", () => {
    expect(Object.keys(PROFILE_LIMITS).sort()).toEqual(Object.keys(backend).sort());
  });

  test("từng khoảng giá trị khớp nhau", () => {
    for (const [field, range] of Object.entries(backend)) {
      expect(PROFILE_LIMITS[field as keyof typeof PROFILE_LIMITS]).toEqual(range);
    }
  });
});

// Hằng số chất béo dùng nguồn Việt Nam làm chính. Khoá lại để đợt dọn ghi chú
// sau này không rút mất phần nguồn, vì con số 0.25 tự nó không nói được nó ở đâu ra.
describe("nguồn của hằng số chất béo", () => {
  test("dẫn quyết định của Bộ Y tế, không chỉ dẫn AMDR", () => {
    const source = readSource("../src/config/nutritionCalculations.ts");
    expect(source).toContain("2615");
    expect(source).toContain("Viện Dinh dưỡng");
  });
});

describe("không màn nào gõ tay lại giới hạn hồ sơ", () => {
  // Hai màn này từng gõ thẳng 10, 120, 20, 300, 50, 250 vào chỗ kiểm dữ liệu.
  // Backend đổi giới hạn là hai bên lệch ngay mà không có gì báo.
  const screens = [
    "../src/features/profile/EditProfileScreen.tsx",
    "../src/features/onboarding/OnboardingFlow.tsx",
  ];

  test.each(screens)("%s đọc PROFILE_LIMITS từ config", (screen) => {
    expect(readSource(screen)).toContain("PROFILE_LIMITS");
  });

  // Câu báo lỗi cũng từng ghi cứng "từ 10 đến 120". Nay nhận min và max
  // truyền vào, nên đổi giới hạn là câu chữ đổi theo.
  test("câu báo lỗi khoảng giá trị nhận số truyền vào", () => {
    for (const catalog of ["../src/i18n/vi.ts", "../src/i18n/en.ts"]) {
      const source = readSource(catalog);
      expect(source).toMatch(/ageRange:\s*\(min: number, max: number\)/);
      expect(source).toMatch(/weightRange:\s*\(min: number, max: number\)/);
      expect(source).toMatch(/heightRange:\s*\(min: number, max: number\)/);
    }
  });

  test.each(screens)("%s không còn khoảng giá trị viết cứng", (screen) => {
    const source = readSource(screen);
    expect(source).not.toMatch(/<\s*10\s*\|\|/);
    expect(source).not.toMatch(/>\s*120/);
    expect(source).not.toMatch(/<\s*20\s*\|\|/);
    expect(source).not.toMatch(/>\s*300/);
    expect(source).not.toMatch(/<\s*50\s*\|\|/);
    expect(source).not.toMatch(/>\s*250/);
    expect(source).not.toMatch(/>=\s*10\s*&&/);
  });
});
