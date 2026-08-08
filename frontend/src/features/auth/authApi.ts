// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa AuthContext và các route auth/profile/account trong backend/src/routes.
//
// Ai gọi tới: AuthContext, không màn nào gọi thẳng vào đây
// Nhận vào:   email, mật khẩu, hồ sơ cần cập nhật
// Trả ra:     JSON do authController, profileController hoặc accountController trả về
// Khi lỗi:    ném lỗi lên cho AuthContext, rồi màn hình mới hiện thông báo

// Chỉ lo gọi mạng, không giữ state và không lưu gì vào máy.
import type { AuthSession, ProfileResponse, ProfileUpdate, UserResponse } from "./authTypes";
import type { Lang } from "../../utils/languageUtils";
import { apiFetch, apiRequest } from "../../utils/apiClient";

// ─── ĐĂNG NHẬP VÀ ĐĂNG KÝ ───

// Gọi POST /auth/login. Trả về thẻ đăng nhập và hồ sơ.
// Gửi kèm language, là ngôn ngữ đã chọn ở màn Đăng nhập trước khi bấm.
// authController.login lưu luôn, nên không cần gọi thêm PUT /profile sau đăng nhập.
export function loginRequest(
  email: string,
  password: string,
  language?: Lang | null
): Promise<AuthSession> {
  return apiRequest("/auth/login", "POST", { email, password, language: language ?? undefined });
}

// Gọi POST /auth/register/send-otp. Chờ tới 60 giây thay vì 45 giây mặc định,
// vì authController.sendRegistrationOTP còn gọi emailRelayClient.sendOTP.
export async function sendRegistrationOTP(email: string, language: "vi" | "en"): Promise<void> {
  await apiRequest(
    "/auth/register/send-otp",
    "POST",
    { email, language },
    undefined,
    { timeoutMs: 60_000 }
  );
}

// Gọi POST /auth/register kèm mã 6 số. Thành công là có thẻ đăng nhập luôn.
// Cũng gửi kèm language như loginRequest, vì lý do y hệt.
export function registerRequest(
  name: string,
  email: string,
  password: string,
  otp: string,
  language?: Lang | null
): Promise<AuthSession> {
  return apiRequest("/auth/register", "POST", { name, email, password, otp, language: language ?? undefined });
}

// ─── QUÊN MẬT KHẨU VÀ ĐỔI MẬT KHẨU ───

// Gọi POST /user/send-otp, dùng cho cả lần gửi đầu lẫn lần bấm gửi lại.
// Chờ tới 60 giây thay vì 45 giây mặc định, vì accountController.sendPasswordOTP
// còn gọi services/emailRelayClient.js để gửi email thật.
export async function sendPasswordOTP(email: string, language: "vi" | "en"): Promise<void> {
  await apiRequest(
    "/user/send-otp",
    "POST",
    { email, language },
    undefined,
    { timeoutMs: 60_000 }
  );
}

// Gọi POST /user/verify-otp. Không cần thẻ đăng nhập vì người dùng chưa vào được app.
export async function verifyPasswordOTP(email: string, otp: string): Promise<void> {
  await apiRequest("/user/verify-otp", "POST", { email, otp });
}

// Gọi POST /user/reset-password. Phải gửi LẠI mã một lần nữa, vì
// accountController.verifyOTP không phát thẻ tạm, còn resetPassword kiểm mã
// lần nữa rồi mới xóa. Bỏ otp đi là backend từ chối.
export async function resetPasswordRequest(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  await apiRequest("/user/reset-password", "POST", { email, otp, newPassword });
}

// Gọi POST /user/change-password. Hàm DUY NHẤT trong nhóm này cần thẻ đăng nhập,
// vì chỉ đổi được khi đã vào app. Backend phát thẻ mới, màn hình cần nó để thay phiên.
export function changePasswordRequest(
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<{ token: string }> {
  return apiRequest("/user/change-password", "POST", { currentPassword, newPassword }, token);
}

// ─── HỒ SƠ ───

// Gọi GET /profile. Trả về hồ sơ kèm BMI và TDEE.
// Hai chỉ số đó do profileController tính, dựa trên services/nutrition/calorieGoal.js.
export function fetchProfileRequest(token: string): Promise<ProfileResponse> {
  return apiRequest("/profile", "GET", undefined, token);
}

// Gọi PUT /profile. Chỉ cần gửi trường nào đổi, không cần gửi cả hồ sơ.
export function updateProfileRequest(
  data: ProfileUpdate,
  token: string
): Promise<ProfileResponse> {
  return apiRequest("/profile", "PUT", data, token);
}

// ─── TÀI KHOẢN ───

// Gọi PUT /user/name.
export function changeNameRequest(name: string, token: string): Promise<UserResponse> {
  return apiRequest("/user/name", "PUT", { name }, token);
}

// Gọi DELETE /user/account; accountController.deleteAccount so mật khẩu trước khi xóa.
export async function deleteAccountRequest(password: string, token: string): Promise<void> {
  await apiRequest("/user/account", "DELETE", { password }, token);
}

// Dùng apiFetch chứ không dùng apiRequest, vì apiRequest tự đặt kiểu nội dung
// là JSON, còn FormData cần hệ thống tự đặt kiểu kèm dấu phân cách riêng.
// Chờ tới 90 giây vì ảnh nặng và mạng điện thoại có thể chậm.
export async function uploadAvatarRequest(localUri: string, token: string): Promise<string> {
  const formData = new FormData();
  const filename = localUri.split("/").pop() || "avatar.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  formData.append("image", {
    uri: localUri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const data = await apiFetch<{ avatar: string }>("/user/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }, { timeoutMs: 90_000 });

  return data.avatar;
}
