// Thẻ trạng thái dùng chung cho danh sách Community: đang trống, lỗi mạng hoặc cần thử lại.
// Các màn feed, thông báo, bài chi tiết và hồ sơ truyền nội dung cùng hành động vào đây.
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";

export function CommunityStateCard({
  icon,
  title,
  subtitle,
  onRetry,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onRetry?: () => void;
}) {
  const t = useT();

  return (
    <Card style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <AppText variant="h2" style={styles.center}>{title}</AppText>
      <AppText variant="muted" style={styles.center}>{subtitle}</AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
          <AppText style={styles.retryText}>{t.common.retry}</AppText>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { textAlign: "center" },
  retry: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  pressed: { opacity: 0.7 },
});
