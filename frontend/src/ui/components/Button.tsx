import { ReactNode } from "react";
import { Pressable, StyleSheet, View, type PressableProps, type TextStyle, type ViewStyle } from "react-native";
import { theme } from "../theme";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md";

function getSizeStyle(size: Size): ViewStyle {
  return size === "lg" ? styles.large : styles.medium;
}

function getVariantStyle(variant: Variant): ViewStyle {
  return styles[variant];
}

function getPressedVariantStyle(variant: Variant): ViewStyle {
  const pressedStyles: Record<Variant, ViewStyle> = {
    primary: styles.primaryPressed,
    secondary: styles.secondaryPressed,
    ghost: styles.ghostPressed,
    danger: styles.dangerPressed,
  };

  return pressedStyles[variant];
}

function getTextVariantStyle(variant: Variant): TextStyle {
  const textStyles: Record<Variant, TextStyle> = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  return textStyles[variant];
}

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      {...props}
      style={({ pressed: isPressed }) => [
        styles.base,
        getSizeStyle(size),
        getVariantStyle(variant),
        isPressed && !disabled && styles.pressed,
        isPressed && !disabled && getPressedVariantStyle(variant),
        disabled && styles.disabled,
        style,
      ]}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
      <AppText variant="body" style={[styles.text, getTextVariantStyle(variant)]}>
        {title}
      </AppText>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  large: { height: 56, paddingHorizontal: theme.space.xl },
  medium: { height: 48, paddingHorizontal: theme.space.lg },
  primary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  secondary: { backgroundColor: theme.colors.tint },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "rgba(229,72,77,0.10)" },
  pressed: { transform: [{ scale: 0.98 }] },
  primaryPressed: { backgroundColor: theme.colors.primary2 },
  secondaryPressed: { backgroundColor: "rgba(8,145,178,0.18)" },
  ghostPressed: { opacity: 0.7 },
  dangerPressed: { backgroundColor: "rgba(229,72,77,0.18)" },
  disabled: { opacity: 0.45 },
  left: { marginLeft: -4 },
  right: { marginRight: -4 },
  text: { fontWeight: "800" },
  primaryText: { color: "#FFFFFF" },
  secondaryText: { color: theme.colors.primary },
  ghostText: { color: theme.colors.text },
  dangerText: { color: theme.colors.danger },
});
