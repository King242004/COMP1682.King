// ═══ FILE NÀY LÀM GÌ ═══
// Quản lý bốn lời nhắc ghi món, mỗi bữa một lời nhắc.
//
// Ai gọi tới: RemindersScreen, và authSession lúc đăng xuất để dọn lời nhắc
// Nhận vào:   bữa nào, bật hay tắt, và giờ muốn nhắc
// Trả ra:     trạng thái bốn lời nhắc
// Khi lỗi:    chưa được cấp quyền thông báo thì tắt công tắc lại, không để bật giả
//
// Nhớ: trạng thái chỉ nằm trong AsyncStorage; không có endpoint đồng bộ tài khoản.
//      Lịch đã đặt là do hệ điều hành giữ, nên thông báo vẫn hiện dù bữa đó
//      đã ghi món rồi. Muốn bỏ thì phải chạy code đúng lúc thông báo bật lên,
//      việc đó cần bản dựng riêng chứ Expo Go không làm được.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleDailyReminder, cancelNotification } from "./notificationService";

// ══════════════════════════════════════════════════════════
// KHUNG DỮ LIỆU
//
// Không phải luồng, chỉ là mấy khóa lưu trữ với mấy hàm đổi qua đổi lại.
// Gọi cái nào trước cũng được. Ba luồng bên dưới đều mượn của khối này.
// ══════════════════════════════════════════════════════════

// Bốn bữa, mỗi bữa một lời nhắc riêng, để câu nhắc gọi đúng tên bữa.
export const MEAL_KEYS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealKey = (typeof MEAL_KEYS)[number];

export type Reminder = { enabled: boolean; time: string; id: string | null };
export type ReminderMap = Record<MealKey, Reminder>;

// Giờ mặc định nằm sau giờ ăn thường gặp vì mục đích là nhắc ghi món, không phải nhắc ăn.
const DEFAULT_TIMES: Record<MealKey, string> = {
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "19:30",
  snack: "16:00",
};

// Khóa để đọc ghi cả bốn lời nhắc trong bộ nhớ máy.
const STORAGE_KEY = "mealReminders";
// Hai khóa của bản cũ, hồi đó cả app chỉ có MỘT lời nhắc chung.
// Còn giữ để migrateLegacy bên dưới chuyển người dùng cũ sang kiểu bốn bữa.
const LEGACY_ID_KEY = "mealReminderId";
// Khóa giờ của lời nhắc chung ngày xưa. Đi cặp với khóa ngay trên.
const LEGACY_TIME_KEY = "mealReminderTime";

// Bốn lời nhắc tắt hết, giờ để mặc định. Dùng làm điểm xuất phát khi máy chưa lưu gì.
export function emptyReminders(): ReminderMap {
  return MEAL_KEYS.reduce((acc, k) => {
    acc[k] = { enabled: false, time: DEFAULT_TIMES[k], id: null };
    return acc;
  }, {} as ReminderMap);
}

// Đọc chuỗi "08:00" ra cặp số giờ với phút. Sai định dạng hoặc quá 23:59 thì trả null,
// nơi gọi thấy null là bỏ qua chứ không đặt lịch bậy.
export function parseTime(raw: string): [number, number] | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return [h, min];
}

// Chiều ngược lại của parseTime. Đệm số 0 nên 8 giờ ra "08:00" chứ không ra "8:0".
export function formatTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Đổi giờ ra tổng số phút, chỉ để so hai mốc giờ xem cái nào gần hơn.
// Dùng đúng một chỗ, ở migrateLegacy bên dưới.
const toMinutes = (t: string) => {
  const p = parseTime(t);
  return p ? p[0] * 60 + p[1] : 0;
};

// ══════════════════════════════════════════════════════════
// ĐỌC LỜI NHẮC
//
// Đến từ RemindersScreen lúc mở màn. Ba bước, đọc từ trên xuống là đúng thứ tự.
// Chỉ đọc bộ nhớ máy, KHÔNG gọi mạng.
// Xong thì màn Nhắc nhở có đủ bốn công tắc với bốn giờ để hiện.
// ══════════════════════════════════════════════════════════

// Chuyển người dùng của bản cũ sang kiểu bốn bữa. Chạy đúng một lần cho mỗi máy,
// vì cuối hàm là xóa luôn hai khóa cũ đi.
// Mã thông báo cũ được gán cho bữa có giờ mặc định gần với giờ cũ nhất.
// Đây là hàm phụ, mốc BƯỚC nằm ở chỗ gọi trong loadReminders bên dưới.
async function migrateLegacy(state: ReminderMap): Promise<ReminderMap> {
  const [legacyId, legacyTime] = await Promise.all([
    AsyncStorage.getItem(LEGACY_ID_KEY),
    AsyncStorage.getItem(LEGACY_TIME_KEY),
  ]);
  if (!legacyId && !legacyTime) return state;

  if (legacyId && legacyTime) {
    const target = MEAL_KEYS.reduce((best, k) =>
      Math.abs(toMinutes(DEFAULT_TIMES[k]) - toMinutes(legacyTime)) <
      Math.abs(toMinutes(DEFAULT_TIMES[best]) - toMinutes(legacyTime))
        ? k
        : best
    );
    state[target] = { enabled: true, time: legacyTime, id: legacyId };
  }

  await AsyncStorage.multiRemove([LEGACY_ID_KEY, LEGACY_TIME_KEY]);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

// ĐỌC LỜI NHẮC BƯỚC 1. Màn Nhắc nhở gọi thẳng vào đây lúc mở màn.
export async function loadReminders(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  // ĐỌC LỜI NHẮC BƯỚC 2. Máy chưa lưu gì thì rẽ sang migrateLegacy ở trên.
  // Có thể là máy mới tinh, mà cũng có thể là người dùng bản cũ chưa đổi qua.
  if (!raw) return migrateLegacy(emptyReminders());
  try {
    const saved = JSON.parse(raw) as Partial<ReminderMap>;
    // ĐỌC LỜI NHẮC BƯỚC 3. Đắp bản đã lưu lên bản mặc định, chứ không lấy thẳng bản đã lưu.
    // Có vậy thì bản sau thêm bữa mới, máy cũ đọc lên vẫn đủ bốn khóa mà không vỡ.
    const state = emptyReminders();
    for (const k of MEAL_KEYS) if (saved[k]) state[k] = { ...state[k], ...saved[k] };
    return state;
  } catch {
    // Dữ liệu lưu hỏng thì trả bản trắng. Thà mất cài đặt còn hơn kẹt màn Nhắc nhở.
    return emptyReminders();
  }
}

// Ghi cả bốn lời nhắc xuống máy. Gọi ở BẬT LỜI NHẮC BƯỚC 5 và trong migrateLegacy.
async function persist(state: ReminderMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ══════════════════════════════════════════════════════════
// BẬT LỜI NHẮC
//
// Đến từ RemindersScreen, mỗi lần gạt công tắc hoặc đổi giờ.
// Năm bước, đọc từ trên xuống là đúng thứ tự. Không gọi mạng,
// chỉ nói chuyện với hệ điều hành qua notificationService.
// Xong thì màn Nhắc nhở nhận bản mới về mà vẽ lại công tắc.
// ══════════════════════════════════════════════════════════

// BẬT LỜI NHẮC BƯỚC 1. Màn Nhắc nhở gọi vào đây, kèm bữa nào và giờ mới.
export async function applyReminder(
  state: ReminderMap,
  key: MealKey,
  next: { enabled: boolean; time: string },
  content: { title: string; body: string }
): Promise<ReminderMap> {
  // BẬT LỜI NHẮC BƯỚC 2. Chép ra bản mới rồi mới sửa, không đụng vào bản cũ.
  // React so bằng địa chỉ ô nhớ, sửa thẳng bản cũ là màn không nhận ra có gì đổi.
  const updated: ReminderMap = { ...state, [key]: { ...state[key] } };

  // BẬT LỜI NHẮC BƯỚC 3. Hủy lịch cũ của bữa này TRƯỚC, rồi CHỜ hủy xong.
  // Bỏ bước này là đổi giờ xong vẫn còn lịch cũ chạy, một ngày kêu hai lần.
  await cancelNotification(updated[key].id);
  updated[key].id = null;
  updated[key].time = next.time;
  updated[key].enabled = next.enabled;

  if (next.enabled) {
    const parsed = parseTime(next.time);
    if (parsed) {
      // BẬT LỜI NHẮC BƯỚC 4. notificationService.scheduleDailyReminder
      // gọi expo-notifications và trả notification id do hệ điều hành cấp.
      const id = await scheduleDailyReminder(parsed[0], parsed[1], content);
      // Mã rỗng nghĩa là người dùng chưa cho quyền thông báo.
      // Phải gạt công tắc về tắt, kẻo màn hiện bật mà thực ra chẳng có lịch nào.
      updated[key].id = id;
      updated[key].enabled = !!id;
    }
  }

  // BẬT LỜI NHẮC BƯỚC 5. Ghi xuống máy rồi trả bản mới cho màn vẽ lại.
  await persist(updated);
  return updated;
}

// Đếm xem đang bật mấy lời nhắc. Màn Nhắc nhở với màn Cài đặt lấy số này hiện ra.
export function enabledCount(state: ReminderMap) {
  return MEAL_KEYS.filter((k) => state[k].enabled).length;
}

// ══════════════════════════════════════════════════════════
// DỌN KHI ĐĂNG XUẤT
//
// Đến từ authSession lúc đăng xuất. Ba bước, đọc từ trên xuống là đúng thứ tự.
// Phải dọn, kẻo máy đổi tài khoản mà vẫn kêu lịch của người trước.
// Xong thì authSession chạy tiếp phần xóa thẻ đăng nhập.
// ══════════════════════════════════════════════════════════

// DỌN BƯỚC 1. Đọc lại bản đã lưu để lấy mã của bốn lời nhắc.
export async function cancelAllReminders() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ReminderMap>;
      // DỌN BƯỚC 2. Hủy cả bốn lịch một lượt rồi CHỜ.
      // Cho chạy song song vì bốn cái không liên quan gì nhau.
      await Promise.all(MEAL_KEYS.map((k) => cancelNotification(saved[k]?.id)));
    }
    // Hủy nốt lịch của bản cũ, phòng người dùng đăng xuất mà chưa từng mở màn Nhắc nhở
    // nên migrateLegacy chưa có dịp chạy.
    await cancelNotification(await AsyncStorage.getItem(LEGACY_ID_KEY));
  } catch {
  // Hủy hụt cũng kệ, đăng xuất vẫn phải đi tiếp. Kẹt ở đây là người dùng thoát không được.
  }
  // DỌN BƯỚC 3. Xóa sạch ba khóa trong máy. Nằm ngoài try nên lỗi ở trên vẫn chạy tới đây.
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_ID_KEY, LEGACY_TIME_KEY]);
}
