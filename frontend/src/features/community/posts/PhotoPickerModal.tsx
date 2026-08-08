// ═══ FILE NÀY LÀM GÌ ═══
// Bộ chọn ảnh cho bài đăng, cho chọn nhiều ảnh cùng lúc.
//
// Ai gọi tới: PostCreateScreen, PostEditScreen
// Nhận vào:   số ảnh tối đa còn được chọn
// Trả ra:     danh sách ảnh đã nén sẵn
// Khi lỗi:    chưa cấp quyền thư viện ảnh thì báo và không mở bộ chọn

// Dùng bộ chọn có sẵn của hệ điều hành chứ không tự viết giao diện thư viện,
// nên không có phần kéo và cắt ảnh riêng trong app.
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { compressImage } from "@/features/scan/scanApi";
import { useT } from "@/i18n";

export function PhotoPickerModal({
  visible,
  maxCount,
  onClose,
  onDone,
}: {
  visible: boolean;
  maxCount: number;
  onClose: () => void;
  onDone: (uris: string[]) => void;
}) {
  // ══════════════════════════════════════════════════════════
  // MỞ BỘ CHỌN ẢNH
  //
  // Đến từ màn Tạo bài và màn Sửa bài. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Không gọi mạng, chỉ nói chuyện với bộ chọn ảnh của hệ điều hành.
  // Xong thì trả danh sách đường dẫn ảnh về cho màn cha.
  // ══════════════════════════════════════════════════════════

  // MỞ BỘ CHỌN ẢNH BƯỚC 1. Nhận cờ hiện với trần số ảnh từ màn cha.
  const t = useT();
  // Cờ chặn mở hai lần. Bộ chọn ảnh của hệ điều hành mà mở chồng là treo màn.
  const opening = useRef(false);
  // Giữ hàm đóng và hàm nhận ảnh trong ref, để useEffect bên dưới
  // không chạy lại mỗi khi màn cha vẽ lại và tạo hàm mới.
  const onCloseRef = useRef(onClose);
  // Cùng lý do với ref ngay trên. Hai dòng gán ngay dưới luôn giữ ref mới nhất.
  const onDoneRef = useRef(onDone);
  onCloseRef.current = onClose;
  onDoneRef.current = onDone;

  // MỞ BỘ CHỌN ẢNH BƯỚC 2. Cờ hiện bật lên thì tự mở bộ chọn, không ai bấm thêm.
  // Component này KHÔNG vẽ gì cả, nó chỉ là cái cớ để chạy đoạn mở bộ chọn ảnh.
  useEffect(() => {
    if (!visible || opening.current) return;
    opening.current = true;

    (async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsMultipleSelection: true,
          selectionLimit: maxCount,
          quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
          const uris = await Promise.all(
            result.assets.slice(0, maxCount).map((asset) => compressImage(asset.uri))
          );
          onDoneRef.current(uris);
        }
      } catch {
        Alert.alert(t.common.errorTitle, t.common.tryAgain);
      } finally {
        opening.current = false;
        onCloseRef.current();
      }
    })();
  }, [maxCount, t.common.errorTitle, t.common.tryAgain, visible]);

  return null;
}
