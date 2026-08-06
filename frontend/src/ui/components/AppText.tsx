// Thẻ chữ dùng chung cho toàn app, thay cho Text của React Native.
// Nhờ file này mà đổi kiểu chữ một chỗ là cả app đổi theo.
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

  const { fontWeight, ...flat } = StyleSheet.flatten([base, style]) as TextStyle;
  const w = resolveWeight(fontWeight);
  const fontFamily = fontFamilyForWeight(w);

  return <Text {...props} style={[flat, { fontFamily }]} />;
}
