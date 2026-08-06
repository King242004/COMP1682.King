// Thu nhỏ, nén và đổi ảnh người dùng chọn sang base64 để gửi kèm tin nhắn Coach.
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
