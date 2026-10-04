import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { ApiError, deleteToken, readToken, saveToken } from '../shared/apiClient';
import { changePasswordRequest, deleteAccountRequest, getMeRequest, loginRequest, registerRequest } from './AuthApi';
import type { User } from './AuthApi';

// Những gì mọi màn hình lấy được từ useAuth()
type AuthState = {
  user: User | null;
  isLoading: boolean;
  connectionError: string;
  loadSavedSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Giữ trạng thái đăng nhập cho cả app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');

  // Mở app là kiểm tra phiên đăng nhập đã lưu một lần
  useEffect(() => {
    loadSavedSession();
  }, []);

  // Có token đã lưu thì hỏi server token còn dùng được không
  async function loadSavedSession() {
    setIsLoading(true);
    setConnectionError('');
    const token = await readToken();
    if (token) {
      try {
        setUser(await getMeRequest());
      } catch (error) {
        // Token hết hạn thì xóa để đăng nhập lại; lỗi khác (mất mạng…) thì báo để thử lại
        if (error instanceof ApiError && error.status === 401) {
          await deleteToken();
        } else {
          setConnectionError((error as Error).message);
        }
      }
    }
    setIsLoading(false);
  }

  // Hỏi lại server thông tin người dùng (ví dụ sau khi vừa thiết lập hồ sơ)
  async function refreshUser() {
    setUser(await getMeRequest());
  }

  // Đăng nhập: lưu token rồi nhớ người dùng
  async function login(email: string, password: string) {
    const result = await loginRequest(email, password);
    await saveToken(result.token);
    setUser(result.user);
  }

  // Đăng ký: server đăng nhập luôn, nên làm giống đăng nhập
  async function register(displayName: string, email: string, password: string) {
    const result = await registerRequest(displayName, email, password);
    await saveToken(result.token);
    setUser(result.user);
  }

  // Đổi mật khẩu: token cũ hết dùng được nên lưu token mới server gửi về
  async function changePassword(currentPassword: string, newPassword: string) {
    const result = await changePasswordRequest(currentPassword, newPassword);
    await saveToken(result.token);
  }

  // Xóa tài khoản rồi đăng xuất
  async function deleteAccount() {
    await deleteAccountRequest();
    await logout();
  }

  // Đăng xuất: xóa token trên điện thoại
  async function logout() {
    await deleteToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, connectionError, loadSavedSession, refreshUser, login, register, changePassword, deleteAccount, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Lấy trạng thái đăng nhập ở bất kỳ màn hình nào
export function useAuth(): AuthState {
  const authState = useContext(AuthContext);
  if (!authState) {
    throw new Error('useAuth phải nằm bên trong AuthProvider');
  }
  return authState;
}
