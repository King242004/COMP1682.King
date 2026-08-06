// File này là chặng giữa AuthContext và backend cho phần tài khoản.
// Chỉ lo gọi mạng, không giữ state và không lưu gì vào máy.
import type { AuthSession, ProfileResponse, ProfileUpdate, UserResponse } from "./authTypes";
import { apiFetch, apiRequest } from "../../utils/apiClient";

// Gọi POST /auth/login. Trả về thẻ đăng nhập và hồ sơ.
export function loginRequest(
  email: string,
  password: string
): Promise<AuthSession> {
  return apiRequest("/auth/login", "POST", { email, password });
}

// Gọi POST /auth/register/send-otp. Chờ tới 60 giây thay vì 45 giây mặc định,
// vì backend còn phải gửi email thật qua dịch vụ bên ngoài.
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
export function registerRequest(
  name: string,
  email: string,
  password: string,
  otp: string
): Promise<AuthSession> {
  return apiRequest("/auth/register", "POST", { name, email, password, otp });
}

// Gọi GET /profile. Trả về hồ sơ kèm BMI và TDEE do backend tính.
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

// Gọi PUT /user/name.
export function changeNameRequest(name: string, token: string): Promise<UserResponse> {
  return apiRequest("/user/name", "PUT", { name }, token);
}

// Gọi DELETE /user/account. Phải gửi kèm mật khẩu để backend xác nhận đúng chủ.
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
