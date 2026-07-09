import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: theme.space.md }}>
      {title ? (
        // Titled header: chevron + big title
        <>
          <Pressable onPress={goBack} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: -4 })}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </Pressable>
          <AppText variant="h1" style={{ flex: 1 }}>{title}</AppText>
        </>
      ) : (
        // No title: chevron + "Back" at the same h1 size as other headers
        <Pressable onPress={goBack} hitSlop={12} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 4, opacity: pressed ? 0.5 : 1, marginLeft: -4, flex: 1 })}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          <AppText variant="h1">{t.common.back}</AppText>
        </Pressable>
      )}
      {right}
    </View>
  );
}
