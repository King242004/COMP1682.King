import { StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { DaySummary } from "./summary";

// Per-day protein/carb/fat ratio as a stacked mini-bar (7 days).
export function MacroRatioList({ summaries }: { summaries: DaySummary[] }) {
  return (
    <Card style={styles.card}>
      <AppText variant="h2">Daily macro ratio</AppText>
      <View style={styles.list}>
        {summaries.map((day) => {
          const totalMacroG = day.protein + day.carbs + day.fat;
          const pPct = totalMacroG > 0 ? Math.round((day.protein / totalMacroG) * 100) : 0;
          const cPct = totalMacroG > 0 ? Math.round((day.carbs / totalMacroG) * 100) : 0;
          const fPct = totalMacroG > 0 ? Math.round((day.fat / totalMacroG) * 100) : 0;
          return (
            <View key={day.key} style={styles.row}>
              <View style={styles.head}>
                <AppText variant="body2" style={day.isToday ? styles.bold : undefined}>
                  {day.label}{day.isToday ? " (Today)" : ""}
                </AppText>
                {totalMacroG > 0 ? (
                  <AppText variant="subtle" style={styles.meta}>P {pPct}% · C {cPct}% · F {fPct}%</AppText>
                ) : (
                  <AppText variant="subtle" style={styles.meta}>No data</AppText>
                )}
              </View>
              {totalMacroG > 0 ? (
                <View style={styles.stack}>
                  <View style={{ flex: pPct, backgroundColor: theme.colors.accent2 }} />
                  <View style={{ flex: cPct, backgroundColor: theme.colors.accent }} />
                  <View style={{ flex: fPct, backgroundColor: theme.colors.indigo }} />
                </View>
              ) : (
                <View style={styles.stackEmpty} />
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.lg, gap: theme.space.md },
  list: { gap: 12 },
  row: { gap: 6 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "700" },
  meta: { fontSize: 11 },
  stack: { flexDirection: "row", height: 5, borderRadius: 99, overflow: "hidden", gap: 1 },
  stackEmpty: { height: 5, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.06)" },
});
