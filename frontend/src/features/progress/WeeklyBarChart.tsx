// Biểu đồ cột lượng calo theo ngày, dùng cho chế độ xem Tuần.
import { Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export type Bar = { key: string; label: string; fullLabel?: string; value: number; color: string; dim?: boolean };

export function WeeklyBarChart({ bars, maxValue, goalTop, focusKey, onSelect }: {
  bars: Bar[];
  maxValue: number;
  // Mục tiêu dùng cho đường tham chiếu, chỉ áp dụng ở chế độ theo ngày.
  goalTop?: number;
  focusKey?: string;
  onSelect?: (key: string) => void;
}) {
  const t = useT();
  const max = maxValue || 1;
  // Dense (month) mode: bars get thin — drop per-bar values, label every 5th
  const many = bars.length > 10;
  return (
    <View style={styles.wrap}>
      <View style={styles.chartWrap}>
        {goalTop != null && (
          <View style={[styles.goalLine, { top: 100 - (goalTop / max) * 80 }]} />
        )}
        <View style={[styles.bars, many && styles.barsTight]}>
          {bars.map((bar, i) => {
            const barH = Math.max(4, (bar.value / max) * 80);
            const isFocus = !!focusKey && bar.key === focusKey;
            const dim = !!focusKey ? !isFocus : !!bar.dim;
            const label = bars.length > 13 && !(i % 5 === 0 || i === bars.length - 1 || isFocus)
              ? ""
              : bar.label;
            const Col: React.ElementType = onSelect ? Pressable : View;
            return (
              <Col
                key={bar.key}
                style={styles.barCol}
                {...(onSelect ? { onPress: () => onSelect(bar.key) } : {})}
              >
                {!many && bar.value > 0 && (
                  <AppText style={[styles.barValue, dim && styles.dimmed]}>
                    {bar.value >= 1000 ? `${(bar.value / 1000).toFixed(1)}k` : bar.value}
                  </AppText>
                )}
                <View style={[
                  styles.bar,
                  { height: barH, backgroundColor: bar.value > 0 ? bar.color : theme.colors.tint },
                  dim && styles.dimmed,
                  isFocus && styles.barFocus,
                ]} />
                <AppText style={[styles.barLabel, isFocus && styles.barLabelFocus, dim && styles.dimmed]} numberOfLines={1}>
                  {label}
                </AppText>
              </Col>
            );
          })}
        </View>
      </View>
      {goalTop != null && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendLine} />
            <AppText variant="subtle" style={styles.legendText}>{t.progress.goalLine(goalTop.toLocaleString())}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendOnTrack]} />
            <AppText variant="subtle" style={styles.legendText}>{t.progress.onTrackRange}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendOver]} />
            <AppText variant="subtle" style={styles.legendText}>{t.progress.overGoalShort}</AppText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.space.md },
  chartWrap: { position: "relative" },
  goalLine: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: theme.colors.subtle, zIndex: 1 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 100 },
  barsTight: { gap: 2 },
  barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  barValue: { fontSize: 9, color: theme.colors.subtle },
  bar: { width: "100%", borderRadius: 6 },
  barFocus: { borderWidth: 2, borderColor: theme.colors.primary },
  barLabel: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  barLabelFocus: { fontWeight: "700", color: theme.colors.primary },
  dimmed: { opacity: 0.3 },
  legend: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 16, height: 2, backgroundColor: theme.colors.subtle },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendOnTrack: { backgroundColor: theme.colors.accent },
  legendOver: { backgroundColor: theme.colors.accent2 },
  legendText: { fontSize: 11 },
});
