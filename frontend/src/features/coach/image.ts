import * as ImageManipulator from "expo-image-manipulator";

// Thu nhỏ, nén và đổi ảnh món ăn sang base64 để Coach xử lý nhanh hơn.
export async function compressToBase64(uri: string): Promise<{ uri: string; base64: string } | null> {
  try {
    const r = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return r.base64 ? { uri: r.uri, base64: r.base64 } : null;
  } catch {
    return null;
  }
}
