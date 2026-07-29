import { Platform } from "react-native";

// Bản web không sử dụng expo-notifications.
const isWeb = Platform.OS === "web";

type NotificationsModule = typeof import("expo-notifications");
let notificationsModule: NotificationsModule | null = null;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (isWeb) return null;
  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }
  return notificationsModule;
}

export async function ensureNotificationPermissions() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") {
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Nội dung lấy từ i18n để lời nhắc dùng đúng ngôn ngữ của ứng dụng.
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  content: { title: string; body: string }
) {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return null;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content,
// Trigger DAILY lặp lại mỗi ngày vào đúng giờ và phút đã chọn.
// API expo-notifications mới yêu cầu khai báo rõ type của trigger.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelNotification(id: string | null | undefined) {
  if (!id) return;
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Bỏ qua vì lỗi hủy lịch cũ không được làm gián đoạn việc đặt lịch mới.
  }
}

