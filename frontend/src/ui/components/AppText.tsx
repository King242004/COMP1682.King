import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { theme } from "../theme";

type Variant =
  | "h0"
  | "h1"
  | "h2"
  | "body"
  | "body2"
  | "caption"
  | "muted"
  | "subtle";

// Be Vietnam Pro across the whole app: one modern sans with full Vietnamese
// diacritic coverage, so headings and body stay consistent in both languages.
// Custom fonts encode their weight in the FILE, so we map the resolved
// fontWeight to the matching family and strip fontWeight — otherwise Android
// fake-bolds the wrong file. Hierarchy comes from size and weight, not family.
function resolveWeight(w: TextStyle["fontWeight"]): number {
  if (w === "bold") return 700;
  if (w === "normal" || w == null) return 400;
  return Number(w) || 400;
}

function fontFamilyForWeight(w: number) {
  if (w >= 800) return "BeVietnamPro_800ExtraBold";
  if (w >= 700) return "BeVietnamPro_700Bold";
  if (w >= 600) return "BeVietnamPro_600SemiBold";
  if (w >= 500) return "BeVietnamPro_500Medium";
  return "BeVietnamPro_400Regular";
}

export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const base: TextStyle = {
    color: theme.colors.text,
    ...(variant === "muted"
      ? { ...theme.type.body2, color: theme.colors.muted }
      : variant === "subtle"
        ? { ...theme.type.caption, color: theme.colors.subtle }
        : theme.type[variant]),
  };

  // Flatten so inline overrides (e.g. fontWeight: "800") pick the right file too
  const { fontWeight, ...flat } = StyleSheet.flatten([base, style]) as TextStyle;
  const w = resolveWeight(fontWeight);
  const fontFamily = fontFamilyForWeight(w);

  return <Text {...props} style={[flat, { fontFamily }]} />;
}
