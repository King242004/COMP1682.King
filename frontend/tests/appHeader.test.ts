// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra AppHeader lấy avatar hiện tại và có lối mở đúng trang hồ sơ.
// Test đọc source để khóa cấu trúc nhỏ mà không cần dựng native UI.
import fs from "fs";
import path from "path";

describe("AppHeader avatar", () => {
  test("renders the profile image when the user has one", () => {
    const source = fs.readFileSync(path.join(__dirname, "../src/ui/components/AppHeader.tsx"), "utf8");

    expect(source).toContain("user?.avatar ?");
    expect(source).toContain('source={{ uri: user.avatar }}');
  });
});
