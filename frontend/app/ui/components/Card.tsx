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
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.space.lg,
          ...shadow(1),
        },
        style,
      ]}
    />
  );
}

