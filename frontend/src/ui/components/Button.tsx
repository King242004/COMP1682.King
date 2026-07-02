import { ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { theme } from "../theme";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md";

export function Button({
  title,
  onPress,
  left,
  right,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...props
}: Omit<PressableProps, "children"> & {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
}) {
  const height = size === "lg" ? 56 : 48;
  const paddingX = size === "lg" ? theme.space.xl : theme.space.lg;

  const base: ViewStyle = {
    height,
    borderRadius: theme.radius.button,
    paddingHorizontal: paddingX,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor:
      variant === "primary"
        ? theme.colors.primary
        : variant === "danger"
          ? "rgba(229,72,77,0.10)"
          : variant === "secondary"
            ? theme.colors.tint
            : "transparent",
    // Soft glow under primary button so it feels "tappable"
    ...(variant === "primary" && {
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 5,
    }),
  };

  const textColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "danger"
        ? theme.colors.danger
        : variant === "secondary"
          ? theme.colors.primary
          : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      {...props}
      style={({ pressed: isPressed }) => [
        base,
        isPressed && !disabled && {
          backgroundColor:
            variant === "primary"
              ? theme.colors.primary2
              : variant === "danger"
                ? "rgba(229,72,77,0.18)"
                : variant === "secondary"
                  ? "rgba(8,145,178,0.18)"
                  : "transparent",
          transform: [{ scale: 0.98 }],
          opacity: variant === "ghost" ? 0.7 : 1,
        },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {left ? <View style={{ marginLeft: -4 }}>{left}</View> : null}
      <AppText variant="body" style={{ color: textColor, fontWeight: "800" }}>
        {title}
      </AppText>
      {right ? <View style={{ marginRight: -4 }}>{right}</View> : null}
    </Pressable>
  );
}
