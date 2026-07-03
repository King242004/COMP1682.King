// Manual barcode entry — self-contained (owns its input + validation).
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
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
  const [code, setCode] = useState("");

  const submit = () => {
    const trimmed = code.trim();
    if (!/^\d{8,14}$/.test(trimmed)) {
      Alert.alert("Invalid barcode", "Barcode must be 8 to 14 digits.");
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
              <AppText variant="h2">Enter barcode</AppText>
              <AppText variant="muted" style={styles.subtitle}>Type the 8-14 digit number under the bars.</AppText>
            </View>
            <TextField
              label="Barcode number"
              placeholder="e.g. 8934563138189"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <View style={styles.actions}>
              <View style={styles.flex1}>
                <Button title="Cancel" variant="secondary" onPress={cancel} />
              </View>
              <View style={styles.flex1}>
                <Button title="Look up" onPress={submit} />
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
