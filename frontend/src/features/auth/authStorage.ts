// ═══ FILE NÀY LÀM GÌ ═══
// Cất và lấy dữ liệu phiên nhạy cảm trong bộ nhớ máy.
//
// Ai gọi tới: authSession, là file lo cả phiên đăng nhập
// Nhận vào:   JWT hoặc hồ sơ cần cất
// Trả ra:     dữ liệu đã cất trước đó, hoặc rỗng nếu chưa từng đăng nhập
// Khi lỗi:    đọc kho mã hóa thất bại thì coi như chưa đăng nhập,
//             app đưa về màn Đăng nhập thay vì treo
//
// JWT và hồ sơ sức khỏe đều nhạy cảm nên cất cả hai trong SecureStore.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
const SECURE_TOKEN_KEY = "mealmate.auth.token";
const SECURE_USER_KEY = "mealmate.auth.user";
const LEGACY_TOKEN_KEY = "token";
const LEGACY_USER_KEY = "user";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function loadAuthToken(): Promise<string | null> {
  const secureToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY, secureOptions);
  if (secureToken) return secureToken;

  // Chuyển JWT của người dùng cũ sang SecureStore một lần.
  // Sau khi chuyển xong thì xóa bản cũ chưa được mã hóa.
  const legacyToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken) {
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, legacyToken, secureOptions);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  }
  return legacyToken;
}

// Lưu thẻ vào kho mã hóa, đồng thời xóa bản cũ ở kho thường nếu còn sót.
export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token, secureOptions);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function loadAuthUser(): Promise<string | null> {
  const secureUser = await SecureStore.getItemAsync(SECURE_USER_KEY, secureOptions);
  if (secureUser) return secureUser;

  // authSession.ts từng lưu hồ sơ trong AsyncStorage. Chuyển bản cũ sang SecureStore một lần.
  const legacyUser = await AsyncStorage.getItem(LEGACY_USER_KEY);
  if (legacyUser) {
    await SecureStore.setItemAsync(SECURE_USER_KEY, legacyUser, secureOptions);
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
  }
  return legacyUser;
}

export async function saveAuthUser(user: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_USER_KEY, user, secureOptions);
  await AsyncStorage.removeItem(LEGACY_USER_KEY);
}

// Xóa thẻ ở CẢ hai kho, để không sót bản nào khi đăng xuất.
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY, secureOptions);
}

export async function clearAuthUser(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_USER_KEY);
  await SecureStore.deleteItemAsync(SECURE_USER_KEY, secureOptions);
}
