// AI-generate confirmation modal (week or single day) + taste note.
// The "remember" checkbox writes the note back to the profile so EVERY AI
// feature (suggest, coach, later generations) shares one taste memory.
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export function GenerateModal({ visible, scope, note, onChangeNote, remember, onToggleRemember, onCancel, onStart }: {
  visible: boolean;
  scope: "week" | "day";
  note: string;
  onChangeNote: (t: string) => void;
  remember: boolean;
  onToggleRemember: () => void;
  onCancel: () => void;
  onStart: () => void;
}) {
  const L = useT().plan;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={() => {}} style={styles.card}>
          <AppText variant="h2">{scope === "day" ? L.genDayTitle : L.genWeekTitle}</AppText>
          <AppText variant="muted" style={styles.msg}>
            {scope === "day" ? L.genDayMsg : L.genWeekMsg}
          </AppText>
          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder={L.genNotePlaceholder}
            placeholderTextColor={theme.colors.subtle}
            multiline
            style={styles.noteInput}
          />
          <Pressable onPress={onToggleRemember} hitSlop={6} style={styles.rememberRow}>
            <Ionicons
              name={remember ? "checkbox" : "square-outline"}
              size={19}
              color={remember ? theme.colors.accent : theme.colors.subtle}
            />
            <AppText variant="subtle" style={styles.rememberText}>{L.genRemember}</AppText>
          </Pressable>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
            >
              <AppText style={styles.cancelText}>{L.cancel}</AppText>{/* shared plan.cancel */}
            </Pressable>
            <Pressable
              onPress={onStart}
              style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            >
              <AppText style={styles.startText}>{L.genStart}</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", padding: theme.space.lg,
  },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 20,
    padding: theme.space.xl, gap: 12,
  },
  msg: { fontSize: 13 },
  noteInput: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, minHeight: 60,
    fontSize: 13, color: theme.colors.text, textAlignVertical: "top",
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rememberText: { fontSize: 12, flex: 1 },
  actions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cancelBtnPressed: { backgroundColor: theme.colors.tint },
  cancelText: { fontWeight: "700", color: theme.colors.subtle },
  startBtn: {
    flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  startBtnPressed: { backgroundColor: theme.colors.primary2 },
  startText: { fontWeight: "700", color: "#fff" },
});
