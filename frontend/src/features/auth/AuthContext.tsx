import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, InteractionManager } from "react-native";
import { router } from "expo-router";
import { setOnUnauthorized } from "../../utils/apiClient";
import { en } from "../../i18n/en";
import { vi } from "../../i18n/vi";
import { resolveLanguage, type Lang } from "../../utils/languageUtils";
import type { AuthContextType, AuthSession, ProfileUpdate, Stats, User, UserPatch } from "./authTypes";
import { changeNameRequest, deleteAccountRequest, fetchProfileRequest, loginRequest, registerRequest, sendRegistrationOTP, updateProfileRequest, uploadAvatarRequest } from "./authApi";
import {
  clearStoredAccountData,
  clearStoredAuthSession,
  loadStoredAuthSession,
  loadStoredLanguagePreference,
  saveStoredAuthSession,
  saveStoredLanguagePreference,
  saveStoredUser,
} from "./authSession";

// File này giữ tài khoản và thẻ đăng nhập cho toàn app.
// Mọi màn hình lấy user và token từ đây bằng useAuth.
// LUỒNG ĐĂNG NHẬP
// 1. LoginScreen bấm nút Đăng nhập
// 2. gọi login trong file này
// 3. accountApi.loginRequest   (POST /auth/login)
// 4. backend authController.login trả thẻ và hồ sơ
// 5. saveSession lưu vào state và vào bộ nhớ máy
// 6. app/index.tsx thấy có user nên chuyển sang /tabs
// LUỒNG TỰ ĐỌC PHIÊN CŨ, chạy khi mở app chứ không do ai bấm
// 1. useEffect chạy một lần lúc dựng Provider
// 2. authSession.loadStoredAuthSession đọc thẻ và hồ sơ trong máy
// 3. có thì đặt vào state, không có thì để rỗng
// 4. isLoading về false
// 5. app/index.tsx mới quyết định đi đâu
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [languagePreference, setLanguagePreferenceState] = useState<Lang | null>(null);

  // Ba bản sao chép ra ref, để hàm xử lý hết hạn thẻ bên dưới đọc được
  // giá trị mới nhất. Hàm đó chỉ đăng ký một lần nên nếu đọc state thường
  // thì sẽ mãi thấy giá trị của lần dựng đầu tiên.
  const userRef = useRef<User | null>(null);
  const tokenRef = useRef<string | null>(null);
  const langRef = useRef<string | null>(null);
  userRef.current = user;
  tokenRef.current = token;
  langRef.current = user?.language ?? null;

  // Dùng chung cho cả đăng nhập và đăng ký, vì hai luồng đều kết thúc
  // bằng việc nhận thẻ cộng hồ sơ rồi lưu lại y như nhau.
  const saveSession = useCallback(async (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
    await saveStoredAuthSession(session);
  }, []);

  const saveSessionInPreferredLanguage = useCallback(async (session: AuthSession) => {
    if (!languagePreference) return saveSession(session);

    let user = { ...session.user, language: languagePreference };
    try {
      const response = await updateProfileRequest({ language: languagePreference }, session.token);
      user = { ...user, ...response.user, id: response.user._id ?? user.id, language: languagePreference };
    } catch {
      // Lựa chọn trên máy vẫn giữ giao diện đúng; lần đăng nhập sau sẽ thử đồng bộ lại.
    }
    await saveSession({ ...session, user });
  }, [languagePreference, saveSession]);

  const setLanguagePreference = useCallback(async (language: Lang) => {
    setLanguagePreferenceState(language);
    await saveStoredLanguagePreference(language);
  }, []);

  // Tự động khôi phục phiên, chạy đúng một lần khi mở app.
  // Nhờ nó mà người dùng không phải đăng nhập lại mỗi lần mở.
  useEffect(() => {
    async function loadAuth() {
      try {
        const [session, storedLanguage] = await Promise.all([
          loadStoredAuthSession(),
          loadStoredLanguagePreference(),
        ]);
        setLanguagePreferenceState(storedLanguage);
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      } catch {
        // Dữ liệu lưu bị hỏng thì xóa sạch, để app khởi động vào màn đăng nhập
        // thay vì kẹt ở màn hình trắng.
        await clearStoredAuthSession().catch(() => {});
      } finally {
        // Luôn phải chạy, nếu không app/index.tsx sẽ chờ mãi.
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    await saveSessionInPreferredLanguage(data);
  };

  // Đổi token trong state và bộ nhớ sau khi backend vô hiệu hóa các phiên cũ.
  const replaceSessionToken = async (nextToken: string) => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    tokenRef.current = nextToken;
    setToken(nextToken);
    await saveStoredAuthSession({ token: nextToken, user: currentUser });
  };

  // Bước 1 của đăng ký. Xin backend gửi mã 6 số về email.
  const requestRegistrationOTP = async (email: string) => {
    await sendRegistrationOTP(email, resolveLanguage(languagePreference ?? user?.language));
  };

  // Bước 2 của đăng ký. Gửi kèm mã 6 số để backend tạo tài khoản.
  // Xong bước này là có thẻ đăng nhập luôn, không phải đăng nhập lại.
  const register = async (name: string, email: string, password: string, otp: string) => {
    const data = await registerRequest(name, email, password, otp);
    await saveSessionInPreferredLanguage(data);
  };

  // Đặt ref về rỗng TRƯỚC khi đặt state, vì state đổi không có hiệu lực ngay.
  const logout = useCallback(async () => {
    userRef.current = null;
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    setStats(null);
    await clearStoredAccountData();
  }, []);

  // Tự động xử lý khi thẻ đăng nhập hết hạn, không do ai bấm.
  // Đăng ký một hàm cho utils/api gọi lại mỗi khi backend trả 401.
  // Bốn việc theo thứ tự: xóa ref, quay về màn đăng nhập, báo cho người dùng,
  // rồi mới đăng xuất hẳn.
  // Đăng xuất để sau cùng và chờ hiệu ứng chuyển màn chạy xong,
  // vì đăng xuất ngay sẽ làm các màn đang mở render lại lúc chưa kịp thoát.
  useEffect(() => {
    setOnUnauthorized(() => {
      // Đã xử lý một lần rồi thì thôi, tránh hiện hai ba lần thông báo
      // khi nhiều request cùng nhận 401 một lúc.
      if (!tokenRef.current) return;
      tokenRef.current = null;
      router.replace("/auth/login");
      const t = resolveLanguage(langRef.current) === "vi" ? vi : en;
      Alert.alert(t.auth.sessionExpiredTitle, t.auth.sessionExpiredMsg);
      InteractionManager.runAfterInteractions(() => { logout(); });
    });
    // Dọn dẹp khi Provider bị gỡ, để utils/api không giữ hàm cũ.
    return () => setOnUnauthorized(null);
  }, [logout]);

  // Backend trả mã bằng _id còn app dùng id, nên phải đổi tên trường ở đây.
  const mergeAndStoreUser = useCallback(async (patch: UserPatch) => {
    const current = userRef.current;
    if (!current) return;
    const next = { ...current, ...patch, id: patch._id ?? current.id };
    userRef.current = next;
    setUser(next);
    await saveStoredUser(next);
  }, []);

  // Tải lại hồ sơ từ backend. Các màn Hồ sơ và Cài đặt gọi khi mở màn,
  // để lấy BMI và TDEE mới nhất chứ không dùng bản cũ trong máy.
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const data = await fetchProfileRequest(token);
    await mergeAndStoreUser(data.user);
    setStats(data.stats);
  }, [mergeAndStoreUser, token]);

  // Lưu hồ sơ sau khi sửa. Dùng ở màn Sửa hồ sơ, màn Cài đặt,
  // và bước thiết lập lần đầu.
  const updateProfile = async (data: ProfileUpdate) => {
    if (!token) return;
    const res = await updateProfileRequest(data, token);
    await mergeAndStoreUser(res.user);
    setStats(res.stats);
    if (data.language) await setLanguagePreference(data.language);
    return res;
  };

  // Đổi tên hiển thị. Tách riêng khỏi updateProfile vì backend
  // có địa chỉ riêng và quy tắc kiểm tên riêng.
  const changeName = async (name: string) => {
    if (!token) return;
    const res = await changeNameRequest(name, token);
    await mergeAndStoreUser(res.user);
  };

  // Xóa tài khoản rồi đăng xuất luôn. Nếu backend lỗi thì lỗi ném ngược
  // về màn Cài đặt và dòng đăng xuất bên dưới không chạy.
  const deleteAccount = async (password: string) => {
    if (!token) return;
    await deleteAccountRequest(password, token);
    await logout();
  };

  const uploadAvatar = async (localUri: string) => {
    if (!token) return;
    const avatar = await uploadAvatarRequest(localUri, token);
    await mergeAndStoreUser({ avatar });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        languagePreference,
        setLanguagePreference,
        login,
        replaceSessionToken,
        requestRegistrationOTP,
        register,
        logout,
        fetchProfile,
        updateProfile,
        changeName,
        uploadAvatar,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Cách mọi màn hình lấy tài khoản và các hàm ở trên.
// Báo lỗi ngay nếu gọi bên ngoài AuthProvider, để bắt lỗi lúc code
// thay vì gặp giá trị rỗng khó lần ra nguyên nhân.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
