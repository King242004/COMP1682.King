// Manual barcode entry — self-contained (owns its input + validation).
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { TextField } from "@/ui/components/TextField";

export function ManualBarcodeModal({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}) {
  const t = useT();
  const [code, setCode] = useState("");

  const submit = () => {
    const trimmed = code.trim();
    if (!/^\d{8,14}$/.test(trimmed)) {
      Alert.alert(t.scan.invalidBarcode, t.scan.barcodeDigits);
      return;
    }
    setCode("");
    onSubmit(trimmed);
  };

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
