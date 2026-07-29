import { Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export type HeatCell = { key: string; value: number; isFuture: boolean; isToday: boolean };

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function MonthHeatmap({ cells: data, maxValue, selectedKey, onSelect, shade = theme.colors.primary }: {
  cells: HeatCell[];
  maxValue: number;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  shade?: string;
}) {
  const t = useT();
  const firstDow = data.length ? (new Date(data[0].key + "T00:00:00").getDay() + 6) % 7 : 0;
  const cells: (HeatCell | null)[] = [...Array(firstDow).fill(null), ...data];
  return (
    <View style={styles.wrap}>
      <View style={styles.weekHead}>
        {t.labels.daysShort.map((d, i) => (
          <AppText key={i} variant="subtle" style={styles.weekHeadCell}>{d}</AppText>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((s, i) => {
          if (!s) return <View key={`b${i}`} style={styles.cell} />;
          const dayNum = new Date(s.key + "T00:00:00").getDate();
          const hasData = s.value > 0;
          const intensity = hasData ? 0.18 + 0.62 * Math.min(s.value / maxValue, 1) : 0;
          const isSel = s.key === selectedKey;
          return (
            <Pressable key={s.key} onPress={() => onSelect(s.key)} disabled={s.isFuture} style={styles.cell}>
              <View style={[
                styles.cellBox,
                hasData && { backgroundColor: rgba(shade, intensity) },
                s.isFuture && styles.cellFuture,
                isSel && styles.cellSelected,
              ]}>
                <AppText style={[styles.cellNum, s.isFuture && styles.cellNumFuture, s.isToday && styles.cellNumToday]}>{dayNum}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  weekHead: { flexDirection: "row" },
  weekHeadCell: { width: "14.2857%", textAlign: "center", fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", padding: 2 },
  cellBox: {
    aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tintSoft,
  },
  cellFuture: { backgroundColor: "transparent" },
  cellSelected: { borderWidth: 2, borderColor: theme.colors.primary },
  cellNum: { fontSize: 11, color: theme.colors.text },
  cellNumFuture: { color: theme.colors.border },
  cellNumToday: { fontWeight: "800" },
});
