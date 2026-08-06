import fs from "fs";
import path from "path";

describe("AppHeader avatar", () => {
  test("renders the profile image when the user has one", () => {
    const source = fs.readFileSync(path.join(__dirname, "../src/ui/components/AppHeader.tsx"), "utf8");

    expect(source).toContain("user?.avatar ?");
    expect(source).toContain('source={{ uri: user.avatar }}');
  });
});
