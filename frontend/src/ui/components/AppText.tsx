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

// Typography from design-system/meal-snap/MASTER.md: Lora (serif) for headings,
// Raleway (sans) for body. Custom fonts encode their weight in the FILE, so we
// map the resolved fontWeight to the matching family and strip fontWeight —
// otherwise Android fake-bolds the wrong file.
const HEADING_VARIANTS = new Set<Variant>(["h0", "h1", "h2"]);

function resolveWeight(w: TextStyle["fontWeight"]): number {
  if (w === "bold") return 700;
  if (w === "normal" || w == null) return 400;
  return Number(w) || 400;
}

function loraFamily(w: number) {
  if (w >= 700) return "Lora_700Bold";
  if (w >= 600) return "Lora_600SemiBold";
  if (w >= 500) return "Lora_500Medium";
  return "Lora_400Regular";
}

function ralewayFamily(w: number) {
  if (w >= 800) return "Raleway_800ExtraBold";
  if (w >= 700) return "Raleway_700Bold";
  if (w >= 600) return "Raleway_600SemiBold";
  if (w >= 500) return "Raleway_500Medium";
  return "Raleway_400Regular";
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
  const fontFamily = HEADING_VARIANTS.has(variant) ? loraFamily(w) : ralewayFamily(w);

  return <Text {...props} style={[flat, { fontFamily }]} />;
}
