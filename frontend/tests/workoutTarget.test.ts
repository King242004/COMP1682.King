// ═══ FILE NÀY LÀM GÌ ═══
// Khoá mục tiêu buổi tập mỗi tuần phải do người dùng đặt, không phải app tự chế.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì, tự đọc file nguồn
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là số bịa đã quay lại, hoặc không màn nào ghi được trường này
//
// Nhớ: trường weeklyWorkoutTarget từng nằm chết trong database suốt một thời gian,
//      User.js và profileController.updateProfile đã có trường này nhưng KHÔNG màn nào ghi,
//      nên màn Tiến trình lấp chỗ trống bằng bảng 3/4/5 tự chế.
import fs from "fs";
import path from "path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

describe("mục tiêu buổi tập do người dùng đặt", () => {
  const activitySection = () => readSource("../src/features/progress/ActivitySection.tsx");
  const goalsScreen = () => readSource("../src/features/weight/WeightGoalsScreen.tsx");

  test("màn Tiến trình không còn bảng suy mục tiêu từ mức vận động", () => {
    const source = activitySection();
    expect(source).not.toMatch(/sedentary:\s*3/);
    expect(source).not.toMatch(/moderate:\s*4/);
    expect(source).not.toMatch(/active:\s*5/);
    expect(source).not.toContain("activityLevel");
  });

  test("màn Tiến trình đọc mục tiêu từ hồ sơ, giống Trang chủ", () => {
    expect(activitySection()).toContain("user?.weeklyWorkoutTarget ?? null");
    expect(readSource("../src/features/home/HomeScreen.tsx")).toContain("user?.weeklyWorkoutTarget ?? null");
  });

  test("chưa đặt mục tiêu thì màn Tiến trình không vẽ dòng đó", () => {
    expect(activitySection()).toContain("weekTarget != null");
  });

  test("màn Mục tiêu có ô chọn và gửi trường này khi lưu", () => {
    const source = goalsScreen();
    expect(source).toContain("weeklyWorkoutTarget");
    expect(source).toMatch(/weeklyWorkoutTarget:\s*workoutTarget/);
  });

  test("có lựa chọn bỏ trống, để app không ép người dùng phải đặt mục tiêu", () => {
    expect(goalsScreen()).toContain("workoutNone");
  });

  test("nhãn không gọi số của người dùng là gợi ý của app", () => {
    for (const catalog of ["../src/i18n/vi.ts", "../src/i18n/en.ts"]) {
      const line = readSource(catalog).split("\n").find((row) => row.includes("actWeekTarget:")) ?? "";
      expect(line).not.toContain("Gợi ý");
      expect(line).not.toContain("Suggested");
    }
  });
});
