// ═══ FILE NÀY LÀM GÌ ═══
// Lớp bọc quanh thư viện thông báo của Expo.
//
// Ai gọi tới: reminderSettings, khi bật hoặc tắt lời nhắc ghi món
// Nhận vào:   nội dung và giờ muốn nhắc
// Trả ra:     mã của lời nhắc đã đặt
// Khi lỗi:    người dùng chưa cho phép thông báo thì trả rỗng, không báo lỗi ầm ĩ
import * as Notifications from "expo-notifications";

async function ensureNotificationPermissions() {
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
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
  // Bỏ qua vì lỗi hủy lịch cũ không được làm gián đoạn việc đặt lịch mới.
  }
}

