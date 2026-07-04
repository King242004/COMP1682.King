import * as ImageManipulator from "expo-image-manipulator";

// Resize + compress a food photo to base64 for the vision coach (smaller = faster).
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
