import * as Notifications from 'expo-notifications';

// Xin quyền gửi thông báo; đã có quyền thì thôi, chưa có thì iPhone hỏi người dùng. Trả về true nếu được phép
export async function xinQuyenThongBao(): Promise<boolean> {
  const quyenHienTai = await Notifications.getPermissionsAsync();
  if (quyenHienTai.granted) {
    return true;
  }
  const quyenMoi = await Notifications.requestPermissionsAsync();
  return quyenMoi.granted;
}

// Hủy hết lời nhắc cũ rồi hẹn lại: mỗi giờ nhắc một lời nhắc lặp hằng ngày; tắt nhắc hoặc chưa có quyền thì không hẹn
export async function henLaiNhacUongNuoc(nhacUongNuoc: boolean, gioNhac: string[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!nhacUongNuoc) {
    return;
  }
  const quyen = await Notifications.getPermissionsAsync();
  if (!quyen.granted) {
    return;
  }

  // Mỗi giờ dạng "08:00" tách ra giờ và phút
  for (const gio of gioNhac) {
    const phan = gio.split(':');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Đến giờ uống nước',
        body: 'Mở app để ghi lần uống',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: Number(phan[0]),
        minute: Number(phan[1]),
      },
    });
  }
}

// Hủy hết lời nhắc (lúc đăng xuất)
export async function huyHetNhacUongNuoc(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
