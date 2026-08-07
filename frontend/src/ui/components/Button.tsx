// ═══ FILE NÀY LÀM GÌ ═══
// Nút bấm dùng chung cho toàn app, có sẵn ba cỡ và các kiểu màu.
//
// Ai gọi tới: gần như mọi màn hình
// Nhận vào:   chữ trên nút, kiểu, cỡ, và hàm chạy khi bấm
// Trả ra:     một nút đã đúng màu và đúng bo góc của app
// Khi lỗi:    đang ở trạng thái chờ thì nút tự khóa, chặn bấm hai lần
import { ReactNode } from "react";
import { Pressable, StyleSheet, View, type PressableProps, type TextStyle, type ViewStyle } from "react-native";
import { theme } from "../theme";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md";

// ══════════════════════════════════════════════════════════
// BỐN BẢNG TRA KIỂU
//
// Không phải luồng, chỉ là bốn bảng tra nhỏ. Gọi cái nào trước cũng được.
// Cả bốn đều được gọi ở khối DỰNG NÚT bên dưới, lúc xếp chồng style.
// ══════════════════════════════════════════════════════════

// Cỡ nút chỉ có hai mức, lg cao 56 còn md cao 48. Không có cỡ nhỏ hơn.
function getSizeStyle(size: Size): ViewStyle {
  return size === "lg" ? styles.large : styles.medium;
}

// Màu nền lúc thường. Tên kiểu trùng luôn tên khóa trong styles nên tra thẳng được.
function getVariantStyle(variant: Variant): ViewStyle {
  return styles[variant];
}

// Màu nền lúc ngón tay đang đè xuống. Đậm hơn màu thường, để người dùng thấy nút đã ăn.
function getPressedVariantStyle(variant: Variant): ViewStyle {
  const pressedStyles: Record<Variant, ViewStyle> = {
    primary: styles.primaryPressed,
    secondary: styles.secondaryPressed,
    ghost: styles.ghostPressed,
    danger: styles.dangerPressed,
  };

  return pressedStyles[variant];
}

// Màu chữ theo kiểu. Phải tách riêng khỏi màu nền, vì nút danger nền đỏ nhạt
// mà chữ lại đỏ đậm, hai màu không suy ra được từ nhau.
function getTextVariantStyle(variant: Variant): TextStyle {
  const textStyles: Record<Variant, TextStyle> = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  return textStyles[variant];
}

// ══════════════════════════════════════════════════════════
// DỰNG NÚT
//
// Đến từ gần như mọi màn. Hai bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì trả về một Pressable đã đủ cỡ, đủ màu nền, đủ màu chữ.
// ══════════════════════════════════════════════════════════

// DỰNG NÚT BƯỚC 1. Nhận props. variant với size đã có sẵn giá trị mặc định,
// nên nơi gọi chỉ cần truyền title và onPress là chạy được.
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
  // DỰNG NÚT BƯỚC 2. Xếp chồng style rồi trả nút ra.
  // Nhớ: THỨ TỰ trong mảng style là quan trọng, cái dưới đè cái trên.
  // base rồi cỡ rồi màu nền, sau đó mới tới màu lúc đang đè, rồi mờ khi bị khóa,
  // cuối cùng là style nơi gọi truyền vào nên nơi gọi luôn đè được hết.
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
