// ═══ FILE NÀY LÀM GÌ ═══
// Khung bảng trượt dùng chung cho cả kết quả mã vạch lẫn danh sách món nhận diện.
//
// Ai gọi tới: CandidatesSheet, ProductSheet
// Nhận vào:   nội dung muốn hiện bên trong
// Trả ra:     một bảng trượt lên từ đáy màn
// Khi lỗi:    đóng bảng thì trả quyền điều khiển về ScanScreen

// CandidatesSheet và ProductSheet truyền nội dung vào; đóng sheet trả quyền điều khiển về ScanScreen.
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export function ScanBottomSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <View>
              <AppText variant="h2">{title}</AppText>
              {subtitle ? <AppText variant="muted" style={styles.subtitle}>{subtitle}</AppText> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginBottom: theme.space.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space.md,
  },
  subtitle: { fontSize: 13 },
});
