// AI-generate confirmation modal (week or single day) + taste note.
// The "remember" checkbox writes the note back to the profile so EVERY AI
// feature (suggest, coach, later generations) shares one taste memory.
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { Lang } from "@/utils/language";

export function GenerateModal({ visible, scope, note, onChangeNote, remember, onToggleRemember, onCancel, onStart, lang }: {
  visible: boolean;
  scope: "week" | "day";
  note: string;
  onChangeNote: (t: string) => void;
  remember: boolean;
  onToggleRemember: () => void;
  onCancel: () => void;
  onStart: () => void;
  lang: Lang;
}) {
  const L = lang === "vi"
    ? {
        weekTitle: "Tạo kế hoạch bằng AI", dayTitle: "Làm lại thực đơn ngày này",
        weekMsg: "AI sẽ lên thực đơn từ hôm nay tới hết tuần theo mục tiêu và tình trạng của bạn. Món đã có trong khoảng này sẽ bị thay.",
        dayMsg: "AI sẽ thay toàn bộ món của ngày này bằng thực đơn mới.",
        notePlaceholder: "Khẩu vị (không bắt buộc): vd không ăn hải sản, thích gà...",
        remember: "Ghi nhớ khẩu vị này — gợi ý món và Coach cũng sẽ theo",
        start: "Tạo ngay", cancel: "Huỷ",
      }
    : {
        weekTitle: "Generate with AI", dayTitle: "Regenerate this day",
        weekMsg: "The AI will plan from today to the end of the week based on your goal and conditions. Existing meals in that range will be replaced.",
        dayMsg: "The AI will replace all meals on this day with a new menu.",
        notePlaceholder: "Preferences (optional): e.g. no seafood, love chicken...",
        remember: "Remember these preferences — meal suggestions and Coach will follow them too",
        start: "Generate", cancel: "Cancel",
      };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={() => {}} style={styles.card}>
          <AppText variant="h2">{scope === "day" ? L.dayTitle : L.weekTitle}</AppText>
          <AppText variant="muted" style={styles.msg}>
            {scope === "day" ? L.dayMsg : L.weekMsg}
          </AppText>
          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder={L.notePlaceholder}
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
            <AppText variant="subtle" style={styles.rememberText}>{L.remember}</AppText>
          </Pressable>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
            >
              <AppText style={styles.cancelText}>{L.cancel}</AppText>
            </Pressable>
            <Pressable
              onPress={onStart}
              style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            >
              <AppText style={styles.startText}>{L.start}</AppText>
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
