// ═══ FILE NÀY LÀM GÌ ═══
// Giữ tài khoản với thẻ đăng nhập cho cả app. Màn nào cần thì gọi useAuth.
//
// Ai gọi tới: app/_layout bọc ngoài cùng, rồi gần như màn nào cũng gọi useAuth.
// Nhận vào:   email với mật khẩu, hoặc phiên cũ đọc từ máy lúc mở app.
// Trả ra:     user, token, và các hàm login, register, logout, sửa hồ sơ.
// Khi lỗi:    đọc phiên cũ hỏng thì để user rỗng, app tự về màn Đăng nhập.
//
// Nhớ: phải bọc ngoài cùng, vì hai Provider kia cần token mới gọi mạng được.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, InteractionManager } from "react-native";
import { router } from "expo-router";
import { setOnUnauthorized } from "../../utils/apiClient";
import { en } from "../../i18n/en";
import { vi } from "../../i18n/vi";
import { resolveLanguage, type Lang } from "../../utils/languageUtils";
import type { AuthContextType, AuthSession, ProfileUpdate, Stats, User, UserPatch } from "./authTypes";
import { changeNameRequest, deleteAccountRequest, fetchProfileRequest, loginRequest, registerRequest, sendRegistrationOTP, updateProfileRequest, uploadAvatarRequest } from "./authApi";
import { clearStoredAccountData, clearStoredAuthSession, loadStoredAuthSession, loadStoredLanguagePreference, saveStoredAuthSession, saveStoredLanguagePreference, saveStoredUser } from "./authSession";

// Thân file chia làm năm khối, mỗi khối một việc. Khối nào cũng tự nói đến từ đâu, đi tiếp đâu.
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [languagePreference, setLanguagePreferenceState] = useState<Lang | null>(null);

  // Ba ref này là bản sao của state ở trên.
  // Cần vì hàm lo thẻ hết hạn ở dưới chỉ đăng ký một lần duy nhất.
  // Nó mà đọc state thường thì mãi thấy giá trị của lần dựng đầu tiên.
  const userRef = useRef<User | null>(null);
  // Thẻ đăng nhập. Ref này còn kiêm cửa chặn gọi hai lần khi thẻ hết hạn.
  const tokenRef = useRef<string | null>(null);
  // Ngôn ngữ, để câu báo thẻ hết hạn hiện đúng tiếng người dùng đang chọn.
  const langRef = useRef<string | null>(null);
  userRef.current = user;
  tokenRef.current = token;
  langRef.current = user?.language ?? languagePreference;

  // ══════════════════════════════════════════════════════════
  // TỰ ĐỌC PHIÊN CŨ
  // Không ai bấm, tự chạy lúc mở app. Cả 4 bước nằm gọn ở đây, không gọi mạng.
  // Xong thì app/index.tsx nhìn user với isLoading để chọn /tabs hay /auth/login.
  // ══════════════════════════════════════════════════════════

  // ĐỌC PHIÊN BƯỚC 1. Chạy đúng một lần lúc mở app, nhờ mảng rỗng [] ở cuối.
  // Có khối này thì mở app mới không phải đăng nhập lại.
  useEffect(() => {
    // Tách thành hàm riêng vì useEffect không nhận hàm async trực tiếp.
    async function loadAuth() {
      try {
        // ĐỌC PHIÊN BƯỚC 2. Đọc từ máy qua authSession, không gọi mạng.
        // Cho chạy song song vì hai cái không phụ thuộc nhau.
        const [session, storedLanguage] = await Promise.all([
          loadStoredAuthSession(),
          loadStoredLanguagePreference(),
        ]);
        setLanguagePreferenceState(storedLanguage);
        // ĐỌC PHIÊN BƯỚC 3. Có phiên cũ thì đặt vào state.
        // Không có thì user vẫn rỗng, app sẽ đưa về màn Đăng nhập.
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      } catch {
        // Dữ liệu lưu hỏng thì xóa sạch. Thà bắt đăng nhập lại còn hơn kẹt màn trắng.
        await clearStoredAuthSession().catch(() => {});
      } finally {
        // ĐỌC PHIÊN BƯỚC 4. Báo đã đọc xong. Để trong finally nên lỗi cũng chạy.
        // Thiếu dòng này là app/index.tsx chờ mãi, màn hình đứng trắng.
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  // ══════════════════════════════════════════════════════════
  // ĐĂNG NHẬP
  // Đến từ LoginScreen.tsx. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Xong thì LoginScreen tự chuyển sang /tabs.
  // ══════════════════════════════════════════════════════════

  // ĐĂNG NHẬP BƯỚC 1. LoginScreen bấm nút xong gọi thẳng vào đây.
  const login = async (email: string, password: string) => {
    // ĐĂNG NHẬP BƯỚC 2. authApi.loginRequest gửi POST /auth/login qua apiClient;
    // Route này gọi hàm login trong backend/src/controllers/authController.js;
    // hàm đó kiểm mật khẩu, lưu ngôn ngữ và trả AuthSession.
    // Gửi kèm ngôn ngữ ngay từ đây nên KHÔNG phải gọi thêm lượt PUT /profile nữa.
    // Sai mật khẩu là dòng này ném lỗi, LoginScreen bắt rồi hiện.
    const data = await loginRequest(email, password, languagePreference);
    await saveSession(data);
  };

  // ĐĂNG NHẬP BƯỚC 3. Lưu thẻ với hồ sơ. Đăng ký cũng dùng lại hàm này.
  // Ghi qua authSession xong mới đổi state để lỗi lưu không tạo phiên chỉ tồn tại trên giao diện.
  const saveSession = useCallback(async (session: AuthSession) => {
    await saveStoredAuthSession(session);
    userRef.current = session.user;
    tokenRef.current = session.token;
    setUser(session.user);
    setToken(session.token);
  }, []);

  // ══════════════════════════════════════════════════════════
  // ĐĂNG KÝ
  // Đến từ RegisterScreen.tsx. Hai bước: xin mã, rồi gửi mã kèm thông tin.
  // Xong thì dùng lại BƯỚC 3 của khối ĐĂNG NHẬP, nên có thẻ luôn, không phải đăng nhập lại.
  // ══════════════════════════════════════════════════════════

  // ĐĂNG KÝ BƯỚC 1. Xin mã 6 số rồi CHỜ.
  // Đường đi: sendRegistrationOTP → apiClient → POST /auth/register/send-otp → authController.sendRegistrationOTP → otpService → email relay
  const requestRegistrationOTP = async (email: string) => {
    await sendRegistrationOTP(email, resolveLanguage(languagePreference ?? user?.language));
  };

  // ĐĂNG KÝ BƯỚC 2. authApi.registerRequest gửi POST /auth/register qua apiClient;
  // Route này gọi hàm register trong backend/src/controllers/authController.js
  // để kiểm OTP và tạo tài khoản.
  // Gửi kèm ngôn ngữ luôn, cùng lý do như đăng nhập.
  // authController.register trả AuthSession nên xong bước này là vào app ngay.
  const register = async (name: string, email: string, password: string, otp: string) => {
    const data = await registerRequest(name, email, password, otp, languagePreference);
    await saveSession(data);
  };

  // ══════════════════════════════════════════════════════════
  // ĐĂNG XUẤT VÀ THẺ HẾT HẠN
  // Hai lối vào, cùng một đích:
  //   ProfileScreen.tsx     người dùng bấm nút Đăng xuất rồi chuyển sang /auth/login
  //   utils/apiClient.ts    tự gọi khi một route riêng tư trả 401
  // Cả hai lối đều chuyển sang /auth/login trước khi dọn state và bộ nhớ phiên.
  // ══════════════════════════════════════════════════════════

  // Lối một: người dùng bấm Đăng xuất ở ProfileScreen, gọi thẳng hàm này.
  // Nhớ: xóa ref trước rồi mới xóa state. State đổi không có hiệu lực ngay đâu.
  const logout = useCallback(async () => {
    userRef.current = null;
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    setStats(null);
    await clearStoredAccountData();
  }, []);

  // Lối hai: thẻ hết hạn, không ai bấm cả.
  // Đăng ký callback vào apiClient.setOnUnauthorized để mọi response 401 dùng chung một lối logout.
  // Bốn bước bên trong, và THỨ TỰ là quan trọng, xem từng mốc bên dưới.
  // Nhớ: phải đứng sau logout, vì mảng phụ thuộc ở cuối có nhắc tới nó.
  useEffect(() => {
    setOnUnauthorized(() => {
      // THẺ HẾT HẠN BƯỚC 1. Xóa ref ngay, và chặn luôn lần gọi thứ hai.
      // Nhiều request cùng dính 401 mà không chặn là hiện hai ba cái thông báo.
      if (!tokenRef.current) return;
      tokenRef.current = null;
      // THẺ HẾT HẠN BƯỚC 2. Đưa về màn Đăng nhập trước, cho người dùng thấy ngay.
      router.replace("/auth/login");
      // THẺ HẾT HẠN BƯỚC 3. Báo cho người dùng biết vì sao bị đá ra.
      const t = resolveLanguage(langRef.current) === "vi" ? vi : en;
      Alert.alert(t.auth.sessionExpiredTitle, t.auth.sessionExpiredMsg);
      // THẺ HẾT HẠN BƯỚC 4. Đăng xuất SAU CÙNG, và chờ hiệu ứng chuyển màn xong.
      // Đăng xuất sớm là mấy màn đang mở render lại lúc chưa kịp thoát, nhìn giật.
      InteractionManager.runAfterInteractions(() => {
        void logout().catch((error) => console.error("Could not clear expired auth session:", error));
      });
    });
    // Provider bị gỡ thì dọn, đừng để apiClient giữ hàm cũ.
    return () => setOnUnauthorized(null);
  }, [logout]);

  // Thay token mới vào state với máy. Màn Đổi mật khẩu gọi, vì đổi xong là thẻ cũ chết hết.
  const replaceSessionToken = async (nextToken: string) => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    await saveStoredAuthSession({ token: nextToken, user: currentUser });
    tokenRef.current = nextToken;
    setToken(nextToken);
  };

  // ══════════════════════════════════════════════════════════
  // HỒ SƠ VÀ CÀI ĐẶT
  // Khối này KHÔNG có mốc BƯỚC, và đó là cố ý: nó không phải một luồng
  // liền mạch, chỉ là mấy việc lẻ gom lại, gọi cái nào cũng được, không có thứ tự.
  // Đến từ ProfileScreen, EditProfileScreen, SettingsScreen, Thiết lập lần đầu.
  // Đi tiếp qua authApi → apiClient → backend/src/controllers/profileController.js
  // hoặc backend/src/controllers/accountController.js tùy thao tác.
  // ══════════════════════════════════════════════════════════

  const setLanguagePreference = useCallback(async (language: Lang) => {
    setLanguagePreferenceState(language);
    await saveStoredLanguagePreference(language);
  }, []);

  // profileController.js và accountController.js trả `_id`; state frontend chỉ giữ `id`.
  const mergeAndStoreUser = useCallback(async (patch: UserPatch) => {
    const current = userRef.current;
    if (!current) return;
    const { _id, ...fields } = patch;
    const next = { ...current, ...fields, id: _id ?? fields.id ?? current.id };
    await saveStoredUser(next);
    userRef.current = next;
    setUser(next);
  }, []);

  // Tải hồ sơ qua authApi.fetchProfileRequest → GET /profile → profileController.getProfile.
  // để lấy BMI và TDEE mới nhất chứ không dùng bản cũ trong máy.
  // Nhớ: phải đứng sau mergeAndStoreUser, vì mảng phụ thuộc có nhắc tới nó.
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const data = await fetchProfileRequest(token);
    await mergeAndStoreUser(data.user);
    setStats(data.stats);
  }, [mergeAndStoreUser, token]);

  // Lưu hồ sơ sau khi sửa. Dùng ở màn Sửa hồ sơ, màn Cài đặt, và bước Thiết lập lần đầu.
  const updateProfile = async (data: ProfileUpdate) => {
    if (!token) return;
    const res = await updateProfileRequest(data, token);
    await mergeAndStoreUser(res.user);
    setStats(res.stats);
    if (data.language) await setLanguagePreference(data.language);
    return res;
  };

  // Đổi tên hiển thị qua PUT /user/name vì accountController.changeName có luật kiểm riêng.
  const changeName = async (name: string) => {
    if (!token) return;
    const res = await changeNameRequest(name, token);
    await mergeAndStoreUser(res.user);
  };

  // Xóa tài khoản rồi đăng xuất luôn.
  // accountController.deleteAccount trả lỗi thì apiRequest ném về SettingsScreen;
  // dòng logout dưới không chạy.
  const deleteAccount = async (password: string) => {
    if (!token) return;
    await deleteAccountRequest(password, token);
    await logout();
  };

  // accountController.uploadAvatar tải ảnh lên Cloudinary và trả URL;
  // mergeAndStoreUser chỉ lưu URL, không giữ file ảnh trong máy.
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

// Đây là cách mọi màn lấy tài khoản với các hàm ở trên.
// Gọi ngoài AuthProvider là báo lỗi ngay, để bắt lúc code chứ đừng để gặp giá trị rỗng rồi mò.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
