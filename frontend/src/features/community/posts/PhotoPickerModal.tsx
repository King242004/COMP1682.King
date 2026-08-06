// Bộ chọn ảnh cho bài đăng, cho chọn nhiều ảnh cùng lúc.
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
  const t = useT();
  const opening = useRef(false);
  // Giữ hàm đóng và hàm nhận ảnh trong ref, để useEffect bên dưới
  // không chạy lại mỗi khi màn cha vẽ lại và tạo hàm mới.
  const onCloseRef = useRef(onClose);
  const onDoneRef = useRef(onDone);
  onCloseRef.current = onClose;
  onDoneRef.current = onDone;

  // Tự mở bộ chọn ảnh khi cờ hiện chuyển sang bật.
  // opening chặn mở hai lần nếu màn cha vẽ lại giữa chừng.
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
