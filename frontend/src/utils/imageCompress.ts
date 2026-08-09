// ═══ FILE NÀY LÀM GÌ ═══
// Thu nhỏ và nén một tấm ảnh trước khi gửi lên mạng.
//
// Ai gọi tới: ScanScreen, CoachScreen và PhotoPickerModal.
// Nhận vào:   đường dẫn ảnh trong máy, và có cần chuỗi base64 hay không
// Trả ra:     đường dẫn ảnh đã nén, kèm base64 nếu có xin
// Khi lỗi:    nén hỏng thì trả null, nơi gọi tự quyết định làm gì tiếp
//
// Vì sao gom lại: hai nơi trên cùng thu về bề ngang 1024 và cùng nén mức 0.5,
// khác nhau đúng một điểm là luồng Coach cần thêm base64 vì nó nhét ảnh vào JSON,
// còn luồng quét gửi file riêng. Trước ngày 9/8/2026 hai nơi chép nguyên phép nén.
//
// Nhớ: 1024 và 0.5 là mức đã cân giữa nhẹ và đủ nét cho AI nhìn. Hạ thêm thì AI
//      đoán kém đi, nâng lên thì mạng di động gửi rất lâu.
import * as ImageManipulator from "expo-image-manipulator";

const MAX_WIDTH = 1024;
const COMPRESS = 0.5;

export async function compressForUpload(
  uri: string,
  options: { base64?: boolean } = {},
): Promise<{ uri: string; base64?: string } | null> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: COMPRESS, format: ImageManipulator.SaveFormat.JPEG, base64: options.base64 },
    );
    return { uri: result.uri, base64: result.base64 };
  } catch {
    return null;
  }
}
