import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme, shadow } from "../theme";
import { AppText } from "./AppText";

export type ActionItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

// Themed bottom-sheet menu (Instagram/WEAR-style ⋯ menu). Tapping the backdrop
// or an item closes it; the parent owns `visible`.
export function ActionSheet({
  visible,
  onClose,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  items: ActionItem[];
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop taps on the sheet itself from closing */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          {items.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => { onClose(); item.onPress(); }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={item.destructive ? theme.colors.danger : theme.colors.text}
              />
              <AppText style={[styles.label, item.destructive && styles.labelDanger]}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 10, paddingBottom: 34, paddingHorizontal: theme.space.sm,
    ...shadow(3),
  },
  grabber: {
    alignSelf: "center", width: 40, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.border, marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, paddingHorizontal: theme.space.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  rowPressed: { backgroundColor: theme.colors.tintSoft, borderRadius: 12 },
  label: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
  labelDanger: { color: theme.colors.danger },
});
