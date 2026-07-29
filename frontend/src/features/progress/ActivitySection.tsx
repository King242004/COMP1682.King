import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { getExerciseHistory, type Exercise } from "@/features/exercise/api";
import { dateKey } from "@/utils/date";
import { WeeklyBarChart, type Bar } from "./WeeklyBarChart";
import { MonthHeatmap } from "./MonthHeatmap";

type Mode = "week" | "month" | "year";
type BurnDay = { key: string; label: string; fullLabel: string; isToday: boolean; isFuture: boolean; burned: number; count: number };
type BurnMonth = { key: string; label: string; burned: number; count: number; isFuture: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

// Mỗi ngày trong khoảng có một dòng, từ ngày cũ nhất đến hôm nay.
// `locale` giúp nhãn theo ngôn ngữ ứng dụng thay vì ngôn ngữ điện thoại.
function buildBurnDays(exercises: Exercise[], windowDays: Date[], locale?: string): BurnDay[] {
  const todayK = dateKey(new Date());
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return windowDays.map((d) => {
    const key = dateKey(d);
    const dayEx = exercises.filter((e) => e.date === key);
    return {
      key,
      label: d.toLocaleDateString(locale, { weekday: "short" }),
      fullLabel: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" }),
      isToday: key === todayK,
      isFuture: d.getTime() > todayStart.getTime(),
      burned: dayEx.reduce((s, e) => s + e.caloriesBurned, 0),
      count: dayEx.length,
    };
  });
}

// Tổng calo tiêu hao của 12 tháng dùng cho biểu đồ Năm.
function buildBurnMonths(exercises: Exercise[], year: number, locale?: string): BurnMonth[] {
  const now = new Date();
  const out: BurnMonth[] = [];
  for (let m = 0; m < 12; m++) {
    const monthEx = exercises.filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === m;
    });
    out.push({
      key: `${year}-${pad(m + 1)}`,
      label: new Date(year, m, 1).toLocaleDateString(locale, { month: "short" }),
      burned: monthEx.reduce((s, e) => s + e.caloriesBurned, 0),
      count: monthEx.length,
      isFuture: year > now.getFullYear() || (year === now.getFullYear() && m > now.getMonth()),
    });
  }
  return out;
}

// Phần hoạt động có cách bố trí giống tab calo: chuyển khoảng thời gian, biểu đồ,
// tổng và trung bình calo tiêu hao, mức duy trì tập luyện và các số liệu.
export function ActivitySection({ mode, anchor, windowDays, locale, selectedKey, onSelectKey, periodLabel, onShiftPeriod, nextDisabled }: {
  mode: Mode;
  anchor: Date;
  windowDays: Date[];
  locale?: string;
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  periodLabel: string;
  onShiftPeriod: (delta: 1 | -1) => void;
  nextDisabled: boolean;
}) {
  const { token, user } = useAuth();
  const t = useT();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const days = windowDays.length;
  const year = anchor.getFullYear();
  // Chế độ Năm cần đủ 12 tháng, còn Tuần và Tháng chỉ cần khoảng đang xem.
  const start = mode === "year" ? `${year}-01-01` : dateKey(windowDays[0]);
  const end = mode === "year" ? `${year}-12-31` : dateKey(windowDays[windowDays.length - 1]);

    // Dùng chuỗi ngày ổn định làm phụ thuộc thay vì dùng chính mảng.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    getExerciseHistory(token, start, end)
      .then((ex) => { if (alive) setExercises(ex); })
      .catch(() => { if (alive) setExercises([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token, start, end]);

  // Mục tiêu số buổi mỗi tuần dựa trên mức vận động: ít 3, vừa 4, cao 5.
  const weekTarget = ({ sedentary: 3, moderate: 4, active: 5 } as Record<string, number>)[user?.activityLevel ?? ""] ?? 4;

  const burnDays = buildBurnDays(exercises, windowDays, locale);
  const burnMonths = mode === "year" ? buildBurnMonths(exercises, year, locale) : [];

  // Tuần dùng cột theo ngày, Năm dùng 12 cột theo tháng, Tháng dùng bản đồ nhiệt.
  const bars: Bar[] = mode === "year"
    ? burnMonths.map((mt, i) => ({ key: mt.key, label: String(i + 1), fullLabel: mt.label, value: mt.burned, color: theme.colors.accent2, dim: mt.isFuture }))
    : burnDays.map((d, i) => ({ key: d.key, label: t.labels.daysShort[i], value: d.burned, color: theme.colors.accent2, dim: d.isFuture }));
  const maxValue = (mode === "year"
    ? Math.max(0, ...burnMonths.map((mt) => mt.burned))
    : burnDays.reduce((m, d) => Math.max(m, d.burned), 0)) || 1;

  // Tính tổng và trung bình theo ngày có hoạt động hoặc theo tháng có hoạt động.
  const activeDays = burnDays.filter((d) => d.count > 0);
  const activeMonths = burnMonths.filter((mt) => mt.count > 0);
  const totalWorkouts = mode === "year"
    ? burnMonths.reduce((s, mt) => s + mt.count, 0)
    : burnDays.reduce((s, d) => s + d.count, 0);
  const periodTotal = bars.reduce((s, b) => s + b.value, 0);
  const activeUnits = mode === "year" ? activeMonths.length : activeDays.length;
  const periodAvg = activeUnits > 0 ? Math.round(periodTotal / activeUnits) : 0;
  const maxMonth = mode === "year" ? Math.max(0, ...burnMonths.map((mt) => mt.burned)) : 0;

  const selBar = selectedKey ? bars.find((b) => b.key === selectedKey) ?? null : null;

  // Mức duy trì trong tuần so sánh số ngày tập với mục tiêu tuần.
  const daysTrained = burnDays.filter((d) => d.count > 0).length;

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>;
  }

  return (
    <>
      {/* Một thẻ gồm chuyển khoảng thời gian, biểu đồ và tổng số liệu. */}
      <Card style={styles.heroCard}>
        <View style={styles.periodNav}>
          <Pressable onPress={() => onShiftPeriod(-1)} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          </Pressable>
          <AppText variant="body2" style={styles.periodLabel}>{periodLabel}</AppText>
          <Pressable onPress={() => onShiftPeriod(1)} disabled={nextDisabled} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
            <Ionicons name="chevron-forward" size={22} color={nextDisabled ? theme.colors.border : theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.chartBox}>
          {totalWorkouts === 0 ? (
            <AppText variant="subtle" style={styles.emptyChart}>{t.progress.noActivity}</AppText>
          ) : mode === "month" ? (
            <MonthHeatmap
              cells={burnDays.map((d) => ({ key: d.key, value: d.burned, isFuture: d.isFuture, isToday: d.isToday }))}
              maxValue={maxValue}
              selectedKey={selectedKey}
              onSelect={onSelectKey}
              shade={theme.colors.accent2}
            />
          ) : (
            <WeeklyBarChart bars={bars} maxValue={maxValue} focusKey={selectedKey ?? undefined} onSelect={onSelectKey} />
          )}
        </View>

        {selBar && (
          <AppText variant="subtle" style={styles.selectedLine}>
            {(selBar.fullLabel ?? selBar.label)}: {selBar.value.toLocaleString()} {t.common.kcal}
          </AppText>
        )}

        <View style={styles.totalGroup}>
          <AppText variant="subtle" style={styles.totalLabel}>{t.progress.burnedTotal}</AppText>
          <View style={styles.totalValueRow}>
            <AppText variant="h0" style={styles.totalValue}>{periodTotal.toLocaleString()}</AppText>
            <AppText variant="muted">{t.common.kcal}</AppText>
          </View>
        </View>

        <AppText variant="subtle" style={styles.avgText}>
          {(mode === "year" ? t.progress.avgKcalMonth : t.progress.avgKcalDay)}: {periodAvg.toLocaleString()} {t.common.kcal}
        </AppText>
      </Card>

      {/* Mức duy trì tập luyện chỉ hiện ở chế độ Tuần. */}
      {mode === "week" && (
        <Card style={styles.consistencyCard}>
          <View style={styles.consistencyHead}>
            <AppText variant="h2">{t.progress.actConsistency}</AppText>
            <AppText variant="subtle" style={[styles.consistencyMeta, daysTrained >= weekTarget && styles.metaMet]}>
              {t.progress.actDaysTrainedOf7(daysTrained)}
            </AppText>
          </View>
          <View style={styles.dotRow}>
            {burnDays.map((d, i) => {
              const trained = d.count > 0;
              const showRing = d.isToday && !trained;
              return (
                <View key={d.key} style={styles.dotCol}>
                  <View style={[styles.dot, trained ? styles.dotTrained : styles.dotRest, showRing && styles.dotRing]}>
                    {trained && <Ionicons name="barbell" size={14} color="#fff" />}
                  </View>
                  <AppText style={[styles.dotLabel, d.isToday && styles.dotLabelToday]}>{t.labels.daysShort[i]}</AppText>
                </View>
              );
            })}
          </View>
          <AppText variant="subtle" style={styles.targetText}>{t.progress.actWeekTarget(weekTarget)}</AppText>
        </Card>
      )}

      {/* Số liệu theo ngày hoạt động hoặc theo tháng hoạt động. */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <AppText variant="h2" style={styles.statOrange}>{totalWorkouts}</AppText>
          <AppText variant="subtle" style={styles.statLabel}>{t.progress.actTotalWorkouts}</AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppText variant="h2" style={styles.statAccent}>{mode === "year" ? `${activeMonths.length}/12` : `${activeDays.length}/${days}`}</AppText>
          <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.actActiveMonths : t.progress.actActiveDays}</AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppText variant="h2" style={styles.statPrimary}>
            {mode === "year" ? (maxMonth > 0 ? maxMonth.toLocaleString() : "-") : (periodAvg > 0 ? periodAvg.toLocaleString() : "-")}
          </AppText>
          <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.actAvgBurnedMonth : t.progress.actAvgBurned}</AppText>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: theme.space.xl, alignItems: "center" },

  // Thẻ chính có kiểu giống thẻ hôm nay trong ProgressScreen.
  heroCard: { padding: theme.space.xl, gap: theme.space.md },
  periodNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodLabel: { fontWeight: "700" },
  pressed: { opacity: 0.7 },
  chartBox: { marginTop: theme.space.sm },
  emptyChart: { paddingVertical: theme.space.lg, textAlign: "center" },
  selectedLine: { fontSize: 12, fontWeight: "700", color: theme.colors.accent2 },
  totalGroup: { gap: 2 },
  totalLabel: { fontSize: 12 },
  totalValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  totalValue: { fontSize: 32, color: theme.colors.accent2 },
  avgText: { fontSize: 12 },

  // Khu vực mức duy trì tập luyện.
  consistencyCard: { padding: theme.space.lg, gap: theme.space.md },
  consistencyHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  consistencyMeta: { fontSize: 12 },
  metaMet: { color: theme.colors.accent, fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 6 },
  dotCol: { flex: 1, alignItems: "center", gap: 4 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dotTrained: { backgroundColor: theme.colors.accent2 },
  dotRest: { backgroundColor: theme.colors.tint },
  dotRing: { borderWidth: 1.5, borderColor: theme.colors.accent2 },
  dotLabel: { fontSize: 10, fontWeight: "500", color: theme.colors.subtle },
  dotLabelToday: { fontWeight: "700", color: theme.colors.accent2 },
  targetText: { fontSize: 11 },

  // Hàng số liệu có kiểu giống ProgressScreen.
  statsRow: { flexDirection: "row", gap: theme.space.md },
  statCard: { flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" },
  statPrimary: { color: theme.colors.primary, fontSize: 18 },
  statAccent: { color: theme.colors.accent, fontSize: 18 },
  statOrange: { color: theme.colors.accent2, fontSize: 18 },
  statLabel: { fontSize: 11, textAlign: "center" },
});
