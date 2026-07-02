import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

// Big friendly progress ring for the Home summary card
export function CalorieRing({ eaten, goal }: { eaten: number; goal: number }) {
  const size = 116;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const over = eaten > goal;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(8,145,178,0.10)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={over ? theme.colors.danger : theme.colors.primary}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText style={{ fontSize: 22, fontWeight: "800", color: over ? theme.colors.danger : theme.colors.primary }}>
        {Math.round(progress * 100)}%
      </AppText>
      <AppText variant="subtle" style={{ fontSize: 10 }}>of goal</AppText>
    </View>
  );
}
