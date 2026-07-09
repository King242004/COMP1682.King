import { StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

// Labelled progress bar for one macro (value / total + percent).
export function MacroBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  const pct = Math.round(ratio * 100);
  // ≥100% = warning orange, not danger red (red = errors/destructive)
  const pctColor = pct >= 100 ? theme.colors.accent2 : pct >= 80 ? theme.colors.accent : theme.colors.subtle;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <AppText variant="body2">{label}</AppText>
        </View>
        <View style={styles.valueRow}>
          <AppText variant="subtle">{Math.round(value)}g / {total}g</AppText>
          <AppText style={[styles.pct, { color: pctColor }]}>{pct}%</AppText>
        </View>
      </View>
      <View style={styles.track}>
        {/* runtime width → inline is allowed */}
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pct: { fontSize: 11, fontWeight: "700" },
  track: { height: 6, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
});
