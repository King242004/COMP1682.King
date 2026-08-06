// Hàng tiêu đề có nút quay lại, dùng cho các màn mở chồng lên.
import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "../theme";
import { AppText } from "./AppText";

// Thanh đầu màn hình dùng chung gồm nút quay lại và tiêu đề đậm trên một hàng.
// Các luồng con cùng sử dụng để nút quay lại luôn có một kiểu.
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const router = useRouter();
  const t = useT();
  const goBack = onBack ?? (() => router.back());
  return (
    <View style={styles.header}>
      {title ? (
        // Có tiêu đề: biểu tượng quay lại và tiêu đề lớn.
        <>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
            style={({ pressed }) => [styles.backIcon, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </Pressable>
          <AppText variant="h1" style={styles.title}>{title}</AppText>
        </>
      ) : (
        // Không có tiêu đề: biểu tượng và chữ quay lại cùng cỡ h1.
        <Pressable
          onPress={goBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
          style={({ pressed }) => [styles.backWithLabel, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          <AppText variant="h1">{t.common.back}</AppText>
        </Pressable>
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.space.md,
  },
  backIcon: { marginLeft: -4 },
  backWithLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: -4,
  },
  title: { flex: 1 },
  pressed: { opacity: 0.5 },
});
