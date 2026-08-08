// ═══ FILE NÀY LÀM GÌ ═══
// Hộp gõ tay mã vạch, dùng khi camera không đọc được mã.
//
// Ai gọi tới: ScanScreen
// Nhận vào:   dãy số người dùng gõ
// Trả ra:     mã vạch đã kiểm hợp lệ
// Khi lỗi:    mã không đủ 8 tới 14 chữ số thì nút xác nhận bị khóa

// Dùng khi camera không đọc được mã vì mã mờ hoặc bao bì bị nhăn.
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { TextField } from "@/ui/components/TextField";
import { INPUT_LIMITS } from "@/config/inputLimits";

export function ManualBarcodeModal({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}) {
  const t = useT();
  const [code, setCode] = useState("");

  // ══════════════════════════════════════════════════════════
  // NHẬP MÃ VẠCH TAY
  //
  // Đến từ màn Quét, khi camera không đọc được mã. Hai bước, không gọi mạng.
  // Xong thì trả mã lên cho màn Quét, màn ĐÓ mới là nơi tra Open Food Facts.
  // ══════════════════════════════════════════════════════════

  // NHẬP MÃ VẠCH BƯỚC 1. Kiểm mã rồi mới trả lên.
  // Mã vạch chuẩn dài 8 tới 14 chữ số, gồm EAN-8, UPC-A và EAN-13.
  // Sai thì báo rồi GIỮ NGUYÊN ô nhập cho họ sửa, đừng bắt gõ lại từ đầu.
  const submit = () => {
    const trimmed = code.trim();
    if (!/^\d{8,14}$/.test(trimmed)) {
      Alert.alert(t.scan.invalidBarcode, t.scan.barcodeDigits);
      return;
    }
    setCode("");
    onSubmit(trimmed);
  };

  // NHẬP MÃ VẠCH BƯỚC 2. Bấm hủy hoặc chạm ra ngoài thì xóa ô rồi đóng.
  // Xóa ô để lần mở sau là ô trống, chứ không còn mã cũ nằm đó.
  const cancel = () => {
    setCode("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={cancel}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <AppText variant="h2">{t.scan.enterBarcode}</AppText>
              <AppText variant="muted" style={styles.subtitle}>{t.scan.barcodeHint}</AppText>
            </View>
            <TextField
              label={t.scan.barcodeLabel}
              placeholder={t.scan.barcodePlaceholder}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={INPUT_LIMITS.BARCODE}
            />
            <View style={styles.actions}>
              <View style={styles.flex1}>
                <Button title={t.common.cancel} variant="secondary" onPress={cancel} />
              </View>
              <View style={styles.flex1}>
                <Button title={t.scan.lookUp} onPress={submit} />
              </View>
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", paddingHorizontal: theme.space.xl,
  },
  card: { padding: theme.space.xl, gap: theme.space.lg },
  header: { gap: 4 },
  subtitle: { fontSize: 13 },
  actions: { flexDirection: "row", gap: theme.space.md },
  flex1: { flex: 1 },
});
