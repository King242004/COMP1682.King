// ═══ FILE NÀY LÀM GÌ ═══
// Biểu đồ cột lượng calo theo ngày, dùng cho chế độ xem Tuần.
//
// Ai gọi tới: ProgressScreen
// Nhận vào:   calo từng ngày và mục tiêu calo
// Trả ra:     bảy cột, kèm vạch ngang đánh dấu mục tiêu
// Khi lỗi:    ngày chưa ghi món thì cột cao 0, không bỏ trống chỗ

import { Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { ChartLegend } from "./ConsistencyRow";
import { ON_TRACK_MAX_PERCENT, ON_TRACK_MIN_PERCENT } from "./progressSummary";

// Chiều cao vùng vẽ, và chiều cao tối đa của một cột bên trong vùng đó.
// Hai số này vừa dùng trong style vừa dùng trong phép tính vạch mục tiêu,
// nên phải khai một chỗ. Trước đây chúng bị gõ tay ở ba nơi rời nhau, sửa
// chiều cao trong style là vạch mục tiêu lệch khỏi cột mà không có gì báo.
const CHART_HEIGHT = 100;
const BAR_MAX_HEIGHT = 80;

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
  // Chế độ tháng cột rất mảnh, nên bỏ số trên từng cột và chỉ ghi nhãn cách 5 cột
  const many = bars.length > 10;
  return (
    <View style={styles.wrap}>
      <View style={styles.chartWrap}>
        {goalTop != null && (
          <View style={[styles.goalLine, { top: CHART_HEIGHT - (goalTop / max) * BAR_MAX_HEIGHT }]} />
        )}
        <View style={[styles.bars, many && styles.barsTight]}>
          {bars.map((bar, i) => {
            const barH = Math.max(4, (bar.value / max) * BAR_MAX_HEIGHT);
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
        <ChartLegend
          items={[
            { color: theme.colors.subtle, label: t.progress.goalLine(goalTop.toLocaleString()), line: true },
            { color: theme.colors.accent, label: t.progress.onTrackRange(ON_TRACK_MIN_PERCENT, ON_TRACK_MAX_PERCENT) },
            { color: theme.colors.accent2, label: t.progress.overGoalShort },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.space.md },
  chartWrap: { position: "relative" },
  goalLine: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: theme.colors.subtle, zIndex: 1 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: CHART_HEIGHT },
  barsTight: { gap: 2 },
  barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  barValue: { fontSize: 9, color: theme.colors.subtle },
  bar: { width: "100%", borderRadius: 6 },
  barFocus: { borderWidth: 2, borderColor: theme.colors.primary },
  barLabel: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  barLabelFocus: { fontWeight: "700", color: theme.colors.primary },
  dimmed: { opacity: 0.3 },
});
