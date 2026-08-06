// ═══ FILE NÀY LÀM GÌ ═══
// Thu nhỏ và nén ảnh trước khi gửi kèm tin nhắn cho Coach.
//
// Ai gọi tới: CoachScreen
// Nhận vào:   đường dẫn ảnh trong máy
// Trả ra:     chuỗi base64 đã nén, đủ nhẹ để gửi qua mạng
// Khi lỗi:    ảnh hỏng thì ném lỗi, màn hiện thông báo thay vì gửi rác lên server

import * as ImageManipulator from "expo-image-manipulator";

export async function prepareCoachImage(uri: string): Promise<{ uri: string; base64: string } | null> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return result.base64 ? { uri: result.uri, base64: result.base64 } : null;
  } catch {
    return null;
  }
}
