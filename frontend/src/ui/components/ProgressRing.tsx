import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../theme";
import { AppText } from "./AppText";

// Vòng tiến độ calo hiển thị phần trăm ở giữa và đổi đỏ khi vượt mục tiêu.
// Một component dùng được cho mọi kích thước trong Home và chi tiết món.
export function ProgressRing({
  eaten,
  goal,
  size = 116,
  stroke = 11,
  caption,
}: {
  eaten: number;
  goal: number;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const over = eaten > goal;
  const color = over ? theme.colors.danger : theme.colors.primary;
  // Cỡ chữ phần trăm thay đổi theo kích thước vòng tròn.
  const pctSize = Math.max(11, Math.round(size * 0.19));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(8,145,178,0.10)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText style={[styles.pct, { fontSize: pctSize, color }]}>
        {Math.round(progress * 100)}%
      </AppText>
      {caption ? <AppText variant="subtle" style={styles.caption}>{caption}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  pct: { fontWeight: "800" },
  caption: { fontSize: 10 },
});
