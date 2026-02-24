import { Text, type TextProps, type TextStyle } from "react-native";
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

  return <Text {...props} style={[base, style]} />;
}

