import { StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { DaySummary } from "./summary";

// Calorie bar chart (7 or 30 day window) with a goal line + legend.
export function WeeklyBarChart({ summaries, goal, maxCalories, title }: {
  summaries: DaySummary[]; goal: number; maxCalories: number; title?: string;
}) {
  const t = useT();
  // 30-day mode: bars get thin — drop per-bar values, label every 5th day only
  const many = summaries.length > 10;
  return (
    <Card style={styles.card}>
      <AppText variant="h2">{title ?? t.progress.thisWeek}</AppText>
      <View style={styles.chartWrap}>
        {/* Goal line (runtime top → inline) */}
        <View style={[styles.goalLine, { top: (1 - goal / maxCalories) * 80, opacity: goal <= maxCalories ? 1 : 0 }]} />
        <View style={[styles.bars, many && styles.barsTight]}>
          {summaries.map((day, i) => {
            const barH = Math.max(4, (day.calories / maxCalories) * 80);
            // Over-goal = warning orange, not danger red (red = errors/destructive)
            const barColor = day.calories > goal
              ? theme.colors.accent2
              : day.onTrack
              ? theme.colors.accent
              : day.isToday
              ? theme.colors.primary
              : theme.colors.tint;
            // Dense mode: day-of-month every 5th bar; weekly mode: weekday initial
            const label = many
              ? (i % 5 === 0 || i === summaries.length - 1 ? day.key.slice(-2) : "")
              : day.label[0];
            return (
              <View key={day.key} style={styles.barCol}>
                {!many && day.calories > 0 && (
                  <AppText style={styles.barValue}>
                    {day.calories >= 1000 ? `${(day.calories / 1000).toFixed(1)}k` : day.calories}
                  </AppText>
                )}
                <View style={[styles.bar, { height: barH, backgroundColor: barColor }]} />
                <AppText style={[styles.barLabel, day.isToday ? styles.barLabelToday : null]} numberOfLines={1}>
                  {label}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendLine} />
          <AppText variant="subtle" style={styles.legendText}>{t.progress.goalLine(goal.toLocaleString())}</AppText>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.lg, gap: theme.space.md },
  chartWrap: { position: "relative" },
  goalLine: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: theme.colors.accent, zIndex: 1 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 100 },
  barsTight: { gap: 2 },
  barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  barValue: { fontSize: 9, color: theme.colors.subtle },
  bar: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  barLabelToday: { fontWeight: "700", color: theme.colors.primary },
  legend: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 16, height: 2, backgroundColor: theme.colors.accent },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11 },
});
