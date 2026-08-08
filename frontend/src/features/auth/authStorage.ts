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
// ══════════════════════════════════════════════════════════
// BỐN KHÓA LƯU TRỮ
//
// Không phải luồng. Hai khóa của kho mã hóa, và hai khóa của kho thường đời cũ.
// Mọi hàm bên dưới đều dùng tới bốn khóa này.
// ══════════════════════════════════════════════════════════

// Hai khóa hiện dùng, nằm trong SecureStore, tức kho có mã hóa của hệ điều hành.
const SECURE_TOKEN_KEY = "mealmate.auth.token";
// Khóa hồ sơ, đi cặp với khóa thẻ ngay trên.
const SECURE_USER_KEY = "mealmate.auth.user";
// Hai khóa đời cũ, hồi đó còn lưu trong AsyncStorage, tức kho KHÔNG mã hóa.
// Còn giữ để chuyển người dùng cũ sang kho mới, và để xóa cho sạch lúc đăng xuất.
const LEGACY_TOKEN_KEY = "token";
// Khóa hồ sơ đời cũ, đi cặp với khóa thẻ ngay trên.
const LEGACY_USER_KEY = "user";

// Chỉ mở khóa được khi máy đã mở khóa, và KHÔNG cho sao lưu sang máy khác.
// Chọn mức chặt nhất vì đây là thẻ đăng nhập với hồ sơ sức khỏe.
const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// ══════════════════════════════════════════════════════════
// SÁU CỬA ĐỌC GHI
//
// Không phải luồng. Ba cặp đọc, ghi, xóa cho thẻ và cho hồ sơ.
// Đến từ authSession, gọi cái nào cũng được.
//
// Nhớ: hai hàm ĐỌC còn kiêm việc chuyển dữ liệu đời cũ sang kho mã hóa.
//      Chuyển đúng một lần cho mỗi máy, vì chuyển xong là xóa bản cũ đi.
// ══════════════════════════════════════════════════════════

// Đọc thẻ. Có trong kho mã hóa thì trả luôn, không có thì mới dò kho cũ.
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

// Đọc hồ sơ. Cách làm giống hệt loadAuthToken ở trên.
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

// Lưu hồ sơ vào kho mã hóa, đồng thời xóa bản cũ ở kho thường nếu còn sót.
export async function saveAuthUser(user: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_USER_KEY, user, secureOptions);
  await AsyncStorage.removeItem(LEGACY_USER_KEY);
}

// Xóa thẻ ở CẢ hai kho, để không sót bản nào khi đăng xuất.
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY, secureOptions);
}

// Xóa hồ sơ ở CẢ hai kho, cùng lý do với clearAuthToken ở trên.
export async function clearAuthUser(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_USER_KEY);
  await SecureStore.deleteItemAsync(SECURE_USER_KEY, secureOptions);
}
