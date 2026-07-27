import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "../theme";
import { AppText } from "./AppText";

// Consistent screen header: dark back chevron + bold title on one row.
// Used by every pushed sub-flow so back buttons look the same everywhere.
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
        // Titled header: chevron + big title
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
        // No title: chevron + "Back" at the same h1 size as other headers
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
