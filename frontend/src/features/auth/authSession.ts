// ═══ FILE NÀY LÀM GÌ ═══
// Lưu và xóa cả phiên đăng nhập trong bộ nhớ máy, để mở lại app
// không phải đăng nhập lại từ đầu.
//
// Ai gọi tới: AuthContext, lúc mở app, lúc đăng nhập, và lúc đăng xuất
// Nhận vào:   thẻ đăng nhập và hồ sơ người dùng
// Trả ra:     phiên cũ đọc được từ máy, hoặc rỗng nếu chưa từng đăng nhập
// Khi lỗi:    thiếu thẻ hoặc thiếu hồ sơ thì trả rỗng, coi như chưa đăng nhập
//
// Thẻ đăng nhập cất ở kho mã hóa qua authStorage, còn hồ sơ cất ở kho thường.
// Lúc đăng xuất phải dọn cả các bản nhớ tạm của tài khoản cũ, xem
// USER_CACHE_PREFIXES ở dưới, để tài khoản sau không thấy dữ liệu tài khoản trước.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, User } from "./authTypes";
import type { Lang } from "../../utils/languageUtils";
import { cancelAllReminders } from "../../utils/notifications/reminderSettings";
import { clearAuthToken, loadAuthToken, saveAuthToken } from "./authStorage";

// File này lo việc lưu và xóa phiên đăng nhập trong bộ nhớ máy.
// Thẻ đăng nhập cất ở kho mã hóa, còn hồ sơ cất ở kho thường.

const USER_KEY = "user";
const LANGUAGE_KEY = "language_preference";
// Các loại dữ liệu tạm gắn với riêng một tài khoản, phải dọn khi đăng xuất
// để tài khoản sau không thấy dữ liệu của tài khoản trước.
const USER_CACHE_PREFIXES = ["coach_insight_", "coach_suggest_", "plan_week_", "grocery_"];

export async function loadStoredAuthSession(): Promise<AuthSession | null> {
  const [token, storedUser] = await Promise.all([
    loadAuthToken(),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (token && storedUser) {
    return {
      token,
      user: JSON.parse(storedUser) as User,
    };
  }

  if (token) await clearAuthToken();
  return null;
}

export async function saveStoredUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function saveStoredAuthSession(session: AuthSession): Promise<void> {
  await saveAuthToken(session.token);
  await saveStoredUser(session.user);
}

export async function loadStoredLanguagePreference(): Promise<Lang | null> {
  const language = await AsyncStorage.getItem(LANGUAGE_KEY);
  return language === "vi" || language === "en" ? language : null;
}

export async function saveStoredLanguagePreference(language: Lang): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export async function clearStoredAuthSession(): Promise<void> {
  await Promise.all([
    clearAuthToken(),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

// Bản dọn dẹp đầy đủ khi đăng xuất.
// Phải hủy lời nhắc, nếu không điện thoại vẫn báo nhắc ghi món
// cho tài khoản đã đăng xuất từ lâu.
export async function clearStoredAccountData(): Promise<void> {
  await clearStoredAuthSession();

  try {
    await cancelAllReminders();
    const keys = await AsyncStorage.getAllKeys();
    const staleKeys = keys.filter((key) =>
      USER_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
    );
    if (staleKeys.length) await AsyncStorage.multiRemove(staleKeys);
  } catch {
  // Phiên đăng nhập đã được xóa ở phía trên.
  }
}
