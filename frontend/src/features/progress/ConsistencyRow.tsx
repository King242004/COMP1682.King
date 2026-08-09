// ═══ FILE NÀY LÀM GÌ ═══
// Hàng chấm tròn báo những ngày nào đã ghi món trong khoảng đang xem.
//
// Ai gọi tới: ProgressScreen
// Nhận vào:   danh sách ngày có ghi món
// Trả ra:     một hàng chấm, ngày có món thì tô đậm
// Khi lỗi:    không có nhánh lỗi

import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { DaySummary } from "./progressSummary";

export type LegendItem = {
  color: string;
  label: string;
  line?: boolean;
};

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <View style={legendStyles.row}>
      {items.map((item) => (
        <View key={item.label} style={legendStyles.item}>
          <View style={[item.line ? legendStyles.line : legendStyles.dot, { backgroundColor: item.color }]} />
          <AppText variant="subtle" style={legendStyles.text}>{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}

export type DayDot = {
  key: string;
  color: string;
  isToday: boolean;
  showRing?: boolean;
  ringColor?: string;
  content?: ReactNode;
  todayLabelColor?: string;
};

export function DayDotRow({ days }: { days: DayDot[] }) {
  const t = useT();
  return (
    <View style={dayDotStyles.row}>
      {days.map((day, index) => (
        <View key={day.key} style={dayDotStyles.col}>
          <View
            style={[
              dayDotStyles.dot,
              { backgroundColor: day.color },
              day.showRing && {
                borderWidth: 1.5,
                borderColor: day.ringColor ?? theme.colors.primary,
              },
            ]}
          >
            {day.content}
          </View>
          <AppText
            style={[
              dayDotStyles.label,
              day.isToday && dayDotStyles.labelToday,
              day.isToday && day.todayLabelColor ? { color: day.todayLabelColor } : null,
            ]}
          >
            {t.labels.daysShort[index]}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function PeriodNav({ label, nextDisabled, onShift }: {
  label: string;
  nextDisabled: boolean;
  onShift: (delta: 1 | -1) => void;
}) {
  return (
    <View style={periodStyles.row}>
      <Pressable onPress={() => onShift(-1)} hitSlop={8} style={({ pressed }) => pressed && periodStyles.pressed}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
      </Pressable>
      <AppText variant="body2" style={periodStyles.label}>{label}</AppText>
      <Pressable
        onPress={() => onShift(1)}
        disabled={nextDisabled}
        hitSlop={8}
        style={({ pressed }) => pressed && periodStyles.pressed}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={nextDisabled ? theme.colors.border : theme.colors.primary}
        />
      </Pressable>
    </View>
  );
}

// Bảy chấm thể hiện đúng mục tiêu, vượt mục tiêu, đã ghi hoặc chưa có dữ liệu.
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
      <DayDotRow
        days={summaries.map((day) => ({
          key: day.key,
          // Vượt mục tiêu dùng màu cam cảnh báo, màu đỏ chỉ dành cho lỗi hoặc xóa.
          color: day.onTrack
            ? theme.colors.accent
            : day.calories > goal
            ? theme.colors.accent2
            : day.calories > 0
            ? theme.colors.primary
            : theme.colors.tint,
          isToday: day.isToday,
          showRing: day.isToday && day.calories === 0,
          content: (day.onTrack || day.calories > goal)
            ? <AppText style={styles.mark}>{day.onTrack ? "✓" : "!"}</AppText>
            : null,
        }))}
      />
      {/* Chú thích màu của các chấm. */}
      <ChartLegend
        items={[
          { color: theme.colors.accent, label: t.progress.onTrackShort },
          { color: theme.colors.primary, label: t.progress.logged },
          { color: theme.colors.accent2, label: t.progress.overGoalShort },
        ]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.lg, gap: theme.space.md },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerMeta: { fontSize: 12 },
  mark: { fontSize: 16, fontWeight: "800", color: "#fff" },
});

const legendStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  item: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 3 },
  line: { width: 16, height: 2 },
  text: { fontSize: 11 },
});

const dayDotStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  col: { flex: 1, alignItems: "center", gap: 4 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  labelToday: { fontWeight: "700", color: theme.colors.primary },
});

const periodStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
