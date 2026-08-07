// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra lỗi kỹ thuật được đổi thành câu người dùng hiểu theo ngôn ngữ app.
// Test khóa nhánh timeout, mạng, quota và fallback chung.
import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import { getUserErrorMessage } from "@/utils/errorUtils";

describe("getUserErrorMessage", () => {
  it("translates a known backend error", () => {
    expect(getUserErrorMessage(new Error("Invalid email or password."), vi, "fallback"))
      .toBe(vi.auth.invalidCredentials);
  });

  it("uses the screen fallback instead of exposing an unknown technical error", () => {
    expect(getUserErrorMessage(new Error("MongoServerError: connection failed"), en, "Try again."))
      .toBe("Try again.");
  });
});
