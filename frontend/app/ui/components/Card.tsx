import { View, type ViewProps, type ViewStyle } from "react-native";
import { shadow, theme } from "../theme";

export function Card({
  style,
  ...props
}: ViewProps & { style?: ViewStyle }) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          // Invisible border by default — accent cards can still pass borderColor
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
