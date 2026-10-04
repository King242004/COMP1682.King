import { callApi } from '../shared/apiClient';

// Thông tin người dùng server gửi về; da_co_ho_so = false thì phải thiết lập hồ sơ trước
export type User = {
  id: number;
  ten_hien_thi: string;
  email: string;
  da_co_ho_so: boolean;
};

// Kết quả đăng ký và đăng nhập
export type AuthResult = {
  token: string;
  user: User;
};

// Gửi đăng ký tài khoản mới
export async function registerRequest(displayName: string, email: string, password: string): Promise<AuthResult> {
  const result = await callApi('POST', '/auth/register', { ten_hien_thi: displayName, email: email, mat_khau: password });
  return result as AuthResult;
}

// Gửi đăng nhập
export async function loginRequest(email: string, password: string): Promise<AuthResult> {
  const result = await callApi('POST', '/auth/login', { email: email, mat_khau: password });
  return result as AuthResult;
}

// Hỏi server token đang lưu là của ai
export async function getMeRequest(): Promise<User> {
  const result = await callApi('GET', '/auth/me');
  return result as User;
}

// Gửi đổi mật khẩu, nhận về token mới
export async function changePasswordRequest(currentPassword: string, newPassword: string): Promise<{ token: string }> {
  const result = await callApi('PUT', '/auth/password', { mat_khau_hien_tai: currentPassword, mat_khau_moi: newPassword });
  return result as { token: string };
}

// Gửi xóa tài khoản
export async function deleteAccountRequest(): Promise<void> {
  await callApi('DELETE', '/auth/me');
}
