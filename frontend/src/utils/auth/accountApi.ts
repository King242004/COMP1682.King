import type { AuthSession, ProfileResponse, ProfileUpdate, UserResponse } from "@/context/authTypes";
import { apiFetch, apiRequest } from "../api";

export function loginRequest(email: string, password: string): Promise<AuthSession> {
  return apiRequest("/auth/login", "POST", { email, password });
}

export async function sendRegistrationOTP(email: string): Promise<void> {
  await apiRequest(
    "/auth/register/send-otp",
    "POST",
    { email },
    undefined,
    { timeoutMs: 60_000 }
  );
}

export function registerRequest(
  name: string,
  email: string,
  password: string,
  otp: string
): Promise<AuthSession> {
  return apiRequest("/auth/register", "POST", { name, email, password, otp });
}

export function fetchProfileRequest(token: string): Promise<ProfileResponse> {
  return apiRequest("/profile", "GET", undefined, token);
}

export function updateProfileRequest(
  data: ProfileUpdate,
  token: string
): Promise<ProfileResponse> {
  return apiRequest("/profile", "PUT", data, token);
}

export function changeNameRequest(name: string, token: string): Promise<UserResponse> {
  return apiRequest("/user/name", "PUT", { name }, token);
}

export async function deleteAccountRequest(password: string, token: string): Promise<void> {
  await apiRequest("/user/account", "DELETE", { password }, token);
}

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
