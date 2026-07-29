import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { compressImage } from "@/features/scan/api";
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
  const onCloseRef = useRef(onClose);
  const onDoneRef = useRef(onDone);
  onCloseRef.current = onClose;
  onDoneRef.current = onDone;

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
