import { Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export type Bar = { key: string; label: string; fullLabel?: string; value: number; color: string; dim?: boolean };

// Generic bar chart used by Progress for every granularity: 7 daily bars (week),
// ~30 daily bars (month) or 12 monthly bars (year). Renders bare (no Card) so it
// can sit inside the summary card. Tapping a bar calls onSelect(key).
export function WeeklyBarChart({ bars, maxValue, goalTop, focusKey, onSelect }: {
  bars: Bar[];
  maxValue: number;
  goalTop?: number;      // goal value for the reference line (daily modes only)
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
          // Bars top out at 80px inside the 100px row, so align the goal line the
          // same way (100 − scaledHeight) instead of measuring from the very top.
          <View style={[styles.goalLine, { top: 100 - (goalTop / max) * 80 }]} />
        )}
        <View style={[styles.bars, many && styles.barsTight]}>
          {bars.map((bar, i) => {
            const barH = Math.max(4, (bar.value / max) * 80);
            const isFocus = !!focusKey && bar.key === focusKey;
            const dim = !!focusKey ? !isFocus : !!bar.dim;
            // Week (7) and year (12) bars are few enough to label every column;
            // only a very dense daily run (>13) thins labels to every 5th.
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
      {/* Legend (only when a goal line is shown, i.e. daily modes) */}
      {goalTop != null && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendLine} />
            <AppText variant="subtle" style={styles.legendText}>{t.progress.goalLine(goalTop.toLocaleString())}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.accent }]} />
            <AppText variant="subtle" style={styles.legendText}>{t.progress.onTrackRange}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.accent2 }]} />
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
  legendText: { fontSize: 11 },
});
