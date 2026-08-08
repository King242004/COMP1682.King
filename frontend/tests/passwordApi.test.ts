// ═══ FILE NÀY LÀM GÌ ═══
// Khóa bốn địa chỉ mật khẩu trong authApi: gửi mã, kiểm mã, đặt lại, đổi mật khẩu.
// apiClient được mock, nên test không gọi mạng thật.
//
// Vì sao cần: gõ sai chuỗi địa chỉ như "/user/reset-pasword" thì TypeScript
// KHÔNG bắt được, phải chạy app thật mới lòi ra. Test này bắt ngay lúc build.
// Bốn kỳ vọng bên dưới chép đúng từ code cũ, hồi hai màn còn tự gọi apiRequest,
// nên nếu đợt gom hàm làm lệch một chữ thì test đỏ ngay.
jest.mock("@/utils/apiClient", () => ({
  apiRequest: jest.fn(),
  apiFetch: jest.fn(),
}));

import { apiRequest } from "@/utils/apiClient";
import {
  changePasswordRequest,
  resetPasswordRequest,
  sendPasswordOTP,
  verifyPasswordOTP,
} from "@/features/auth/authApi";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiRequest).mockResolvedValue({});
});

// Gửi mã phải chờ 60 giây chứ không phải 45 giây mặc định, vì backend
// còn gọi dịch vụ gửi email thật. Rút xuống 45 là người dùng gặp lỗi hết giờ.
test("sendPasswordOTP goes to /user/send-otp and waits 60 seconds", async () => {
  await sendPasswordOTP("me@example.com", "vi");

  expect(apiRequest).toHaveBeenCalledWith(
    "/user/send-otp",
    "POST",
    { email: "me@example.com", language: "vi" },
    undefined,
    { timeoutMs: 60_000 },
  );
});

test("verifyPasswordOTP goes to /user/verify-otp without a token", async () => {
  await verifyPasswordOTP("me@example.com", "123456");

  expect(apiRequest).toHaveBeenCalledWith(
    "/user/verify-otp",
    "POST",
    { email: "me@example.com", otp: "123456" },
  );
});

// Mã được gửi lại lần nữa ở bước này. Cố ý, vì backend không phát thẻ tạm
// sau khi kiểm mã, nó kiểm mã lần nữa rồi mới xóa. Bỏ otp đi là đặt lại hỏng.
test("resetPasswordRequest resends the otp along with the new password", async () => {
  await resetPasswordRequest("me@example.com", "123456", "NewPass1");

  expect(apiRequest).toHaveBeenCalledWith(
    "/user/reset-password",
    "POST",
    { email: "me@example.com", otp: "123456", newPassword: "NewPass1" },
  );
});

// Đây là hàm DUY NHẤT trong bốn hàm cần thẻ đăng nhập, vì đổi mật khẩu
// chỉ làm được khi đã vào app. Ba hàm kia chạy lúc chưa đăng nhập được.
test("changePasswordRequest goes to /user/change-password with the token", async () => {
  jest.mocked(apiRequest).mockResolvedValue({ token: "new-token" });

  const result = await changePasswordRequest("OldPass1", "NewPass1", "old-token");

  expect(apiRequest).toHaveBeenCalledWith(
    "/user/change-password",
    "POST",
    { currentPassword: "OldPass1", newPassword: "NewPass1" },
    "old-token",
  );
  // Backend phát thẻ mới sau khi đổi mật khẩu, màn hình cần thẻ đó để thay phiên.
  expect(result.token).toBe("new-token");
});
