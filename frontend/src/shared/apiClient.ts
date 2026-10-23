import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// IP laptop đang chạy Expo, cắt từ địa chỉ điện thoại vừa tải app về (ví dụ "192.168.110.90:8081" → "192.168.110.90")
const laptopIp = Constants.expoConfig?.hostUri?.split(':')[0];

// Cổng backend, lấy từ file frontend/.env
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;

// Tên ô lưu token trong bộ nhớ an toàn của điện thoại
const TOKEN_KEY = 'token';

// Lỗi khi gọi backend; status 0 nghĩa là không kết nối được máy chủ
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Việc cần làm khi server báo phiên đăng nhập hết hạn; AuthProvider đăng ký lúc mở app
let onSessionExpired: (() => void) | null = null;

// AuthProvider gọi hàm này để được báo khi phiên đăng nhập hết hạn
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// Lưu token sau khi đăng nhập
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

// Đọc token đã lưu, chưa có thì trả về null
export async function readToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// Xóa token khi đăng xuất hoặc token hết hạn
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Gọi backend: tự gắn token, server báo lỗi thì ném ApiError kèm câu báo tiếng Việt
export async function callApi(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: object): Promise<unknown> {
  if (!laptopIp || !API_PORT) {
    throw new Error('Thiếu EXPO_PUBLIC_API_PORT trong file frontend/.env, hoặc app không mở bằng Expo');
  }

  // Có token thì gửi kèm để server biết ai đang gọi
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = await readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Mất mạng hoặc server tắt thì fetch tự ném lỗi
  let response: Response;
  try {
    response = await fetch(`http://${laptopIp}:${API_PORT}${path}`, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ');
  }

  // 204 nghĩa là làm xong, không có dữ liệu trả về (ví dụ xóa tài khoản)
  const NO_CONTENT_STATUS = 204;
  if (response.status === NO_CONTENT_STATUS) {
    return null;
  }

  // 401 là token hết dùng được: xóa token và báo để app về màn đăng nhập (trừ khi người dùng vừa đăng nhập lại, token đã khác)
  const UNAUTHORIZED_STATUS = 401;
  if (response.status === UNAUTHORIZED_STATUS && (await readToken()) === token) {
    await deleteToken();
    if (onSessionExpired) {
      onSessionExpired();
    }
  }

  // Server trả mã lỗi thì lấy câu báo trong { message }
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.message);
  }
  return data;
}
