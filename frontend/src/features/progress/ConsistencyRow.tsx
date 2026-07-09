import { StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { DaySummary } from "./summary";

// 7-day consistency dots (✓ on track / ! over / · logged / empty) + legend.
export function ConsistencyRow({ summaries, goal, daysLogged }: {
  summaries: DaySummary[]; goal: number; daysLogged: number;
}) {
  const t = useT();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="h2">{t.progress.consistency}</AppText>
        <AppText variant="subtle" style={styles.headerMeta}>{t.progress.daysLoggedOf7(daysLogged)}</AppText>
      </View>
      <View style={styles.row}>
        {summaries.map((day) => {
          // Over-goal = warning orange, not danger red (red = errors/destructive)
          const bg = day.onTrack
            ? theme.colors.accent
            : day.calories > goal
            ? theme.colors.accent2
            : day.calories > 0
            ? theme.colors.primary
            : theme.colors.tint;
          const showRing = day.isToday && day.calories === 0;
          return (
            <View key={day.key} style={styles.col}>
              <View style={[styles.circle, { backgroundColor: bg }, showRing && styles.circleRing]}>
                {day.calories > 0 && (
                  <AppText style={styles.mark}>
                    {day.onTrack ? "✓" : day.calories > goal ? "!" : "·"}
                  </AppText>
                )}
              </View>
              <AppText style={[styles.dayLabel, day.isToday ? styles.dayLabelToday : null]}>
                {day.label[0]}
              </AppText>
            </View>
          );
        })}
      </View>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.accent }]} />
          <AppText variant="subtle" style={styles.legendText}>{t.progress.onTrackShort}</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <AppText variant="subtle" style={styles.legendText}>{t.progress.logged}</AppText>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerMeta: { fontSize: 12 },
  row: { flexDirection: "row", gap: 6 },
  col: { flex: 1, alignItems: "center", gap: 4 },
  circle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  circleRing: { borderWidth: 1.5, borderColor: theme.colors.primary },
  mark: { fontSize: 13, color: "#fff" },
  dayLabel: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  dayLabelToday: { fontWeight: "700", color: theme.colors.primary },
  legend: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11 },
});
