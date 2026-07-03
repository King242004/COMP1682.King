import { Platform } from "react-native";

// On web we don't use expo-notifications at all.
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

export async function scheduleDailyReminder(hour: number, minute: number) {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return null;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Log your meals",
      body: "Take 10 seconds to log what you just ate in MealMate.",
    },
    // DAILY trigger repeats every day at hour:minute (new expo-notifications API
    // requires an explicit `type` on the trigger object)
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
    // ignore
  }
}

