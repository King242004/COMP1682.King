import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { shadow, theme } from "../theme";

export function Card({
  style,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
// Viền mặc định trong suốt, thẻ nhấn mạnh vẫn có thể truyền borderColor riêng.
          borderWidth: 1,
          borderColor: "transparent",
          padding: theme.space.lg,
          ...shadow(1),
        },
        style,
      ]}
    />
  );
}
