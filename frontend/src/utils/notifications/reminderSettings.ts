// ═══ FILE NÀY LÀM GÌ ═══
// Quản lý bốn lời nhắc ghi món, mỗi bữa một lời nhắc.
//
// Ai gọi tới: RemindersScreen, và authSession lúc đăng xuất để dọn lời nhắc
// Nhận vào:   bữa nào, bật hay tắt, và giờ muốn nhắc
// Trả ra:     trạng thái bốn lời nhắc
// Khi lỗi:    chưa được cấp quyền thông báo thì tắt công tắc lại, không để bật giả
// Trạng thái lưu trong bộ nhớ máy, KHÔNG lưu trên server.
// LUỒNG BẬT MỘT LỜI NHẮC
// 1. màn Nhắc nhở gọi applyReminder
// 2. hủy lịch cũ của bữa đó trước, tránh đổi giờ mà lịch cũ vẫn chạy
// 3. đặt lịch mới qua notifications.scheduleDailyReminder
// 4. lưu trạng thái xuống bộ nhớ máy
// Giới hạn cần biết: lịch đã đặt do hệ điều hành giữ, nên thông báo vẫn hiện
// dù bữa đó đã ghi món rồi. Muốn bỏ thì phải chạy code đúng lúc thông báo bật lên,
// việc này cần bản dựng riêng thay vì Expo Go.
// Đăng xuất sẽ hủy hết, để không nhắc nhầm tài khoản khác.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleDailyReminder, cancelNotification } from "./notificationService";

// Mỗi loại bữa ăn có một thông báo hằng ngày để nội dung nhắc đúng tên bữa.
// Hạn chế: thông báo đã lên lịch do hệ điều hành quản lý nên vẫn hiện dù món đã được ghi.
// Muốn bỏ thông báo của bữa đã ghi thì cần chạy code đúng lúc thông báo xuất hiện,
// việc này cần bản phát triển riêng thay vì ứng dụng thử nghiệm tiêu chuẩn.

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

const STORAGE_KEY = "mealReminders";
const LEGACY_ID_KEY = "mealReminderId";
const LEGACY_TIME_KEY = "mealReminderTime";

export function emptyReminders(): ReminderMap {
  return MEAL_KEYS.reduce((acc, k) => {
    acc[k] = { enabled: false, time: DEFAULT_TIMES[k], id: null };
    return acc;
  }, {} as ReminderMap);
}

export function parseTime(raw: string): [number, number] | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return [h, min];
}

export function formatTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const toMinutes = (t: string) => {
  const p = parseTime(t);
  return p ? p[0] * 60 + p[1] : 0;
};

  // Người đã dùng kiểu một thông báo cũ vẫn giữ được thông báo đó.
  // Mã thông báo cũ được chuyển sang bữa có giờ mặc định gần nhất.
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

export async function loadReminders(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return migrateLegacy(emptyReminders());
  try {
    const saved = JSON.parse(raw) as Partial<ReminderMap>;
    // Gộp với dữ liệu mặc định để phiên bản mới thêm bữa vẫn không bị thiếu khóa.
    const state = emptyReminders();
    for (const k of MEAL_KEYS) if (saved[k]) state[k] = { ...state[k], ...saved[k] };
    return state;
  } catch {
    return emptyReminders();
  }
}

async function persist(state: ReminderMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Bật, tắt hoặc đổi giờ nhắc. Thông báo cũ của bữa sẽ được hủy trước,
// tránh việc đổi giờ nhưng thông báo cũ vẫn tiếp tục xuất hiện.
export async function applyReminder(
  state: ReminderMap,
  key: MealKey,
  next: { enabled: boolean; time: string },
  content: { title: string; body: string }
): Promise<ReminderMap> {
  const updated: ReminderMap = { ...state, [key]: { ...state[key] } };

  await cancelNotification(updated[key].id);
  updated[key].id = null;
  updated[key].time = next.time;
  updated[key].enabled = next.enabled;

  if (next.enabled) {
    const parsed = parseTime(next.time);
    if (parsed) {
      const id = await scheduleDailyReminder(parsed[0], parsed[1], content);
      // Mã rỗng nghĩa là quyền thông báo bị từ chối nên công tắc phải trở về tắt.
      updated[key].id = id;
      updated[key].enabled = !!id;
    }
  }

  await persist(updated);
  return updated;
}

export function enabledCount(state: ReminderMap) {
  return MEAL_KEYS.filter((k) => state[k].enabled).length;
}

// Hủy toàn bộ lịch nhắc và xóa dữ liệu khi đăng xuất để không nhắc nhầm tài khoản.
export async function cancelAllReminders() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ReminderMap>;
      await Promise.all(MEAL_KEYS.map((k) => cancelNotification(saved[k]?.id)));
    }
    // Xóa cả khóa cũ nếu người dùng đăng xuất trước khi từng mở màn nhắc nhở.
    await cancelNotification(await AsyncStorage.getItem(LEGACY_ID_KEY));
  } catch {
  // Nếu hủy thất bại vẫn phải cho phép đăng xuất.
  }
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_ID_KEY, LEGACY_TIME_KEY]);
}
