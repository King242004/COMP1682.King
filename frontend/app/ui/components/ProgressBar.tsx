import { View } from "react-native";
import { theme } from "../theme";

export function ProgressBar({
  value,
}: {
  value: number; // 0..1
}) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      style={{
        height: 10,
        borderRadius: theme.radius.pill,
        backgroundColor: "rgba(11, 42, 111, 0.12)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${clamped * 100}%`,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.pill,
        }}
      />
    </View>
  );
}

