import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// File này lo riêng việc cất giữ thẻ đăng nhập.
// Trên điện thoại thì cất vào kho mã hóa của hệ điều hành, gọi là SecureStore.
// Trên web không có kho đó nên đành cất vào kho thường.
// Vì sao tách riêng: thẻ đăng nhập là thứ nhạy cảm nhất trong app,
// ai lấy được là vào thẳng tài khoản mà không cần mật khẩu.
const SECURE_TOKEN_KEY = "mealmate.auth.token";
const LEGACY_TOKEN_KEY = "token";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function loadAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  }

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
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(LEGACY_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token, secureOptions);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

// Xóa thẻ ở CẢ hai kho, để không sót bản nào khi đăng xuất.
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY, secureOptions);
  }
}
