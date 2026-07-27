import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { buildDaySummaries, getWeekDays, getMonthDays, getYearMonthTotals } from "@/features/progress/summary";
import { WeightSection } from "@/features/weight/WeightSection";
import { ActivitySection } from "@/features/progress/ActivitySection";
import { mealStreak } from "@/utils/streak";
import { resolveLanguage, localeTag } from "@/utils/language";
import { useAnimatedNumber } from "@/ui/useAnimatedNumber";
import { WeeklyBarChart, type Bar } from "@/features/progress/WeeklyBarChart";
import { MonthHeatmap } from "@/features/progress/MonthHeatmap";
import { ConsistencyRow } from "@/features/progress/ConsistencyRow";

type Tab = "calories" | "activity" | "weight";
type Mode = "week" | "month" | "year";

export default function ProgressScreen() {
  const { user } = useAuth();
  // Use historyMeals (all logged days) — `meals` only holds the selected date.
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();
  const locale = localeTag(resolveLanguage(user?.language)); // dates follow app language
  const [activeTab, setActiveTab] = useState<Tab>("calories");
  const [mode, setMode] = useState<Mode>("week");
  // Anchor = a date inside the current period; ‹ › arrows move it by week/month/year.
  const [anchor, setAnchor] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [selectedKey, setSelectedKey] = useState<string | null>(null); // tapped bar
  const now = new Date(); now.setHours(0, 0, 0, 0);

  // Daily-detail widgets + the other tabs aren't month-bucket aware, so Year
  // clamps their window to the anchor's month.
  const subMode: "week" | "month" = mode === "week" ? "week" : "month";
  const windowDays = subMode === "week"
    ? getWeekDays(anchor)
    : getMonthDays(anchor.getFullYear(), anchor.getMonth());
  const days = windowDays.length;

  // Priority order: calories in → activity out → weight.
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "calories", label: t.progress.tabCalories, icon: "flame-outline" },
    { key: "activity", label: t.progress.tabActivity, icon: "walk-outline" },
    { key: "weight", label: t.weight.tab, icon: "scale-outline" },
  ];

  useEffect(() => { fetchMealHistory(); }, [fetchMealHistory]);

  const goal = user?.calorieGoal ?? 2000;

  const summaries = buildDaySummaries(historyMeals, goal, windowDays, locale);
  const daysWithMeals = summaries.filter((s) => s.calories > 0);
  const streak = mealStreak(historyMeals.map((m) => m.date));

  // Chart bars: daily bars (week/month) or 12 monthly bars (year).
  const yearMonths = mode === "year" ? getYearMonthTotals(historyMeals, anchor.getFullYear(), locale) : [];
  const bars: Bar[] = mode === "year"
    ? yearMonths.map((mt, i) => ({ key: mt.key, label: String(i + 1), fullLabel: mt.label, value: mt.calories, color: theme.colors.primary, dim: mt.isFuture }))
    : summaries.map((d, i) => ({
        key: d.key,
        label: subMode === "week" ? t.labels.daysShort[i] : d.key.slice(-2),
        value: d.calories,
        color: d.calories > goal ? theme.colors.accent2 : d.onTrack ? theme.colors.accent : theme.colors.primary,
        dim: d.isFuture,
      }));
  // Include the goal in the scale (daily modes) so the goal line always fits on
  // the chart even when every day is under goal.
  const rawMax = bars.reduce((m, b) => Math.max(m, b.value), 0);
  const maxValue = (mode === "year" ? rawMax : Math.max(rawMax, goal)) || 1;

  // Period total + average (per day for week/month, per month for year)
  const unitsWithData = mode === "year" ? yearMonths.filter((mt) => mt.calories > 0).length : daysWithMeals.length;
  const maxMonth = mode === "year" ? Math.max(0, ...yearMonths.map((mt) => mt.calories)) : 0;
  const periodTotal = bars.reduce((s, b) => s + b.value, 0);
  const periodAvg = unitsWithData > 0 ? Math.round(periodTotal / unitsWithData) : 0;
  const heroCaloriesAnimated = useAnimatedNumber(periodTotal);

  const daysOnTrack = summaries.filter((s) => s.onTrack).length;

  // Hero macros follow the period: avg per logged DAY (week/month) or avg per
  // logged MONTH (year), so the number matches the calorie average beside it.
  const macroUnits: { protein: number; carbs: number; fat: number }[] =
    mode === "year" ? yearMonths.filter((mt) => mt.calories > 0) : daysWithMeals;
  const heroMacro = (pick: (u: { protein: number; carbs: number; fat: number }) => number) =>
    macroUnits.length > 0 ? Math.round(macroUnits.reduce((sum, u) => sum + pick(u), 0) / macroUnits.length) : 0;
  const heroProtein = heroMacro((u) => u.protein);
  const heroCarbs = heroMacro((u) => u.carbs);
  const heroFat = heroMacro((u) => u.fat);

  const bestDay = daysWithMeals.length > 0
    ? daysWithMeals.reduce((best, s) => (s.distToGoal < best.distToGoal ? s : best), daysWithMeals[0])
    : null;

  const selectedBar = selectedKey ? bars.find((b) => b.key === selectedKey) ?? null : null;
  const selectedSummary = selectedKey ? summaries.find((s) => s.key === selectedKey) ?? null : null;

  // ‹ › navigator label + movement
  const periodLabel = mode === "week"
    ? `${windowDays[0].toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${windowDays[6].toLocaleDateString(locale, { day: "numeric", month: "short" })}`
    : mode === "month"
    ? anchor.toLocaleDateString(locale, { month: "long", year: "numeric" })
    : String(anchor.getFullYear());
  const shiftPeriod = (delta: 1 | -1) => {
    const d = new Date(anchor);
    if (mode === "week") d.setDate(d.getDate() + delta * 7);
    else if (mode === "month") d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + delta);
    d.setHours(0, 0, 0, 0);
    setAnchor(d);
    setSelectedKey(null);
  };
  const nextDisabled = mode === "week"
    ? getWeekDays(anchor)[0].getTime() >= getWeekDays(now)[0].getTime()
    : mode === "month"
    ? anchor.getFullYear() > now.getFullYear() || (anchor.getFullYear() === now.getFullYear() && anchor.getMonth() >= now.getMonth())
    : anchor.getFullYear() >= now.getFullYear();
  const avgLabel = mode === "year" ? t.progress.avgKcalMonth : t.progress.avgKcalDay;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header + Week/Month/Year toggle */}
        <ScreenHeader
          title={t.progress.title}
          right={
            <View style={styles.rangeToggle}>
              {(["week", "month", "year"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => { setMode(m); setSelectedKey(null); }}
                  style={[styles.rangeBtn, mode === m && styles.rangeBtnActive]}
                >
                  <AppText style={[styles.rangeText, mode === m && styles.rangeTextActive]}>
                    {m === "week" ? t.progress.rangeWeek : m === "month" ? t.progress.rangeMonth : t.progress.rangeYear}
                  </AppText>
                </Pressable>
              ))}
            </View>
          }
        />

        {/* Tabs — 4 equal-width tabs (icon + label) fit the phone width */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}
              >
                <Ionicons name={tab.icon as any} size={18} color={active ? "#fff" : theme.colors.subtle} />
                <AppText style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>{tab.label}</AppText>
              </Pressable>
            );
          })}
        </View>

        {/* CALORIES TAB */}
        {activeTab === "calories" && (
          <>
            {/* One card: ‹ period › navigator → chart → period totals */}
            <Card style={styles.todayCard}>
              <View style={styles.periodNav}>
                <Pressable onPress={() => shiftPeriod(-1)} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
                </Pressable>
                <AppText variant="body2" style={styles.periodLabel}>{periodLabel}</AppText>
                <Pressable onPress={() => shiftPeriod(1)} disabled={nextDisabled} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="chevron-forward" size={22} color={nextDisabled ? theme.colors.border : theme.colors.primary} />
                </Pressable>
              </View>

              <View style={styles.chartBox}>
                {mode === "month" ? (
                  <MonthHeatmap
                    cells={summaries.map((s) => ({ key: s.key, value: s.calories, isFuture: s.isFuture, isToday: s.isToday }))}
                    maxValue={maxValue}
                    selectedKey={selectedKey}
                    onSelect={(k) => setSelectedKey(k === selectedKey ? null : k)}
                  />
                ) : (
                  <WeeklyBarChart
                    bars={bars}
                    maxValue={maxValue}
                    goalTop={mode === "year" ? undefined : goal}
                    focusKey={selectedKey ?? undefined}
                    onSelect={(k) => setSelectedKey(k === selectedKey ? null : k)}
                  />
                )}
              </View>

              {/* Tapped unit → its value */}
              {selectedBar && (
                <AppText variant="subtle" style={styles.selectedLine}>
                  {(selectedSummary?.fullLabel ?? selectedBar.fullLabel ?? selectedBar.label)}: {selectedBar.value.toLocaleString()} {t.common.kcal}
                </AppText>
              )}

              {/* Total — label sits tight above the number */}
              <View style={styles.eatenGroup}>
                <AppText variant="subtle" style={styles.todayLabel}>{t.progress.eatenLabel}</AppText>
                <View style={styles.todayValueRow}>
                  <AppText variant="h0" style={styles.todayValue}>{heroCaloriesAnimated.toLocaleString()}</AppText>
                  <AppText variant="muted">{t.common.kcal}</AppText>
                </View>
              </View>

              <AppText variant="subtle" style={styles.todayFootText}>
                {avgLabel}: {periodAvg.toLocaleString()} {t.common.kcal}
              </AppText>

              <View style={styles.macroBlock}>
                <AppText variant="subtle" style={styles.macroNote}>{mode === "year" ? t.progress.avgMacroNoteMonth : t.progress.avgMacroNote}</AppText>
                <View style={styles.focusMacros}>
                  <AppText variant="subtle" style={[styles.focusMacro, { color: theme.colors.accent2 }]}>{t.labels.protein} {heroProtein}g</AppText>
                  <View style={styles.focusMacroDiv} />
                  <AppText variant="subtle" style={[styles.focusMacro, { color: theme.colors.accent }]}>{t.labels.carbs} {heroCarbs}g</AppText>
                  <View style={styles.focusMacroDiv} />
                  <AppText variant="subtle" style={[styles.focusMacro, { color: theme.colors.indigo }]}>{t.labels.fat} {heroFat}g</AppText>
                </View>
              </View>
            </Card>

            {/* Stats — per day (week/month) or per month (year) */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statPrimary}>
                  {mode === "year" ? (maxMonth > 0 ? maxMonth.toLocaleString() : "-") : `${daysWithMeals.length}/${days}`}
                </AppText>
                <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.highestMonth : t.progress.daysLoggedStat}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statAccent}>{mode === "year" ? `${unitsWithData}/12` : `${daysOnTrack}/${days}`}</AppText>
                <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.monthsLoggedStat : t.progress.daysOnTrack}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <View style={styles.statStreak}>
                  <AppText variant="h2" style={styles.statOrange}>{streak}</AppText>
                  <Ionicons name="flame" size={16} color={theme.colors.accent2} />
                </View>
                <AppText variant="subtle" style={styles.statLabel}>{t.progress.dayStreak}</AppText>
              </Card>
            </View>

            {/* Week: full day-by-day list */}
            {mode === "week" && (
              <Card style={styles.sectionCard}>
                <AppText variant="h2">{t.progress.summaryTitle}</AppText>
                <View style={styles.summaryList}>
                  {summaries.map((day) => (
                    <View key={day.key} style={[styles.summaryRow, day.calories === 0 && styles.summaryRowDim]}>
                      <View style={styles.summaryLeft}>
                        <AppText variant="body2" style={day.isToday ? styles.bold : undefined}>
                          {day.fullLabel}{day.isToday ? t.progress.todaySuffix : ""}
                        </AppText>
                        <AppText variant="subtle" style={styles.summaryMeta}>
                          {day.mealCount > 0 ? t.progress.mealsLogged(day.mealCount) : t.progress.noMealsLogged}
                        </AppText>
                      </View>
                      <View style={styles.summaryRight}>
                        <AppText style={[styles.summaryKcal, {
                          color: day.calories === 0 ? theme.colors.subtle
                            : day.calories > goal ? theme.colors.accent2
                            : day.onTrack ? theme.colors.accent
                            : theme.colors.primary,
                        }]}>
                          {day.calories > 0 ? `${day.calories.toLocaleString()} ${t.common.kcal}` : "-"}
                        </AppText>
                        {day.calories > 0 && (
                          <AppText variant="subtle" style={styles.summaryDelta}>
                            {day.calories > goal
                              ? t.progress.over((day.calories - goal).toLocaleString())
                              : day.onTrack ? t.progress.onTrack
                              : t.progress.under((goal - day.calories).toLocaleString())}
                          </AppText>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Month: heatmap already shows each day → just a "logged X/N" line */}
            {mode === "month" && (
              <Card style={styles.sectionCard}>
                <AppText variant="subtle">{t.progress.daysLoggedMonth(daysWithMeals.length, days)}</AppText>
              </Card>
            )}

            {/* Best day = closest to goal (week/month only) */}
            {mode !== "year" && bestDay && (
              <Card style={styles.bestCard}>
                <View style={styles.bestHead}>
                  <Ionicons name="trophy-outline" size={16} color={theme.colors.accent} />
                  <AppText variant="h2" style={styles.bestTitle}>{t.progress.closestToGoal}</AppText>
                </View>
                <AppText variant="muted">
                  {bestDay.onTrack
                    ? t.progress.closestOnTrack(bestDay.fullLabel, bestDay.calories.toLocaleString())
                    : t.progress.closestOff(bestDay.fullLabel, bestDay.calories.toLocaleString(), Math.abs(bestDay.calories - goal).toLocaleString())}
                </AppText>
              </Card>
            )}

            {/* Week: 7-day consistency dots */}
            {mode === "week" && (
              <ConsistencyRow
                summaries={summaries.slice(-7)}
                goal={goal}
                daysLogged={summaries.slice(-7).filter((s) => s.calories > 0).length}
              />
            )}

            {/* Year: month-by-month breakdown */}
            {mode === "year" && (
              <Card style={styles.sectionCard}>
                <AppText variant="h2">{t.progress.monthlyTitle}</AppText>
                <View style={styles.summaryList}>
                  {yearMonths.map((mt) => (
                    <View key={mt.key} style={[styles.summaryRow, mt.calories === 0 && styles.summaryRowDim]}>
                      <AppText variant="body2">{mt.label}</AppText>
                      <AppText style={[styles.summaryKcal, { color: mt.calories > 0 ? theme.colors.primary : theme.colors.subtle }]}>
                        {mt.calories > 0 ? `${mt.calories.toLocaleString()} ${t.common.kcal}` : "-"}
                      </AppText>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
        )}

        {/* ACTIVITY TAB — mirrors Calories: period-aware chart + consistency */}
        {activeTab === "activity" && (
          <ActivitySection
            mode={mode}
            anchor={anchor}
            windowDays={windowDays}
            locale={locale}
            selectedKey={selectedKey}
            onSelectKey={(k) => setSelectedKey(k === selectedKey ? null : k)}
            periodLabel={periodLabel}
            onShiftPeriod={shiftPeriod}
            nextDisabled={nextDisabled}
          />
        )}


        {/* WEIGHT TAB — journey tracking, self-contained in features/weight */}
        {activeTab === "weight" && <WeightSection />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  subtitle: { marginTop: -8 },
  rangeToggle: { flexDirection: "row", gap: 4, backgroundColor: theme.colors.tintSoft, borderRadius: 10, padding: 3 },
  rangeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  rangeBtnActive: { backgroundColor: theme.colors.primary },
  rangeText: { fontSize: 12, fontWeight: "700", color: theme.colors.subtle },
  rangeTextActive: { color: "#fff" },
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.tintSoft },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 11, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  pressed: { opacity: 0.7 },

  // Focus-day card
  todayCard: { padding: theme.space.xl, gap: theme.space.md },
  datePick: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    backgroundColor: theme.colors.tintSoft,
  },
  datePickText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  periodNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodLabel: { fontWeight: "700" },
  selectedLine: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  chartBox: { marginTop: theme.space.sm }, // breathing room between the nav and the chart
  todayValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  todayValue: { fontSize: 32, color: theme.colors.primary },
  todayTrack: { height: 8, borderRadius: 99, backgroundColor: theme.colors.tint, overflow: "hidden" },
  todayFill: { height: "100%", borderRadius: 99 },
  todayFooter: { flexDirection: "row", justifyContent: "space-between" },
  todayFootText: { fontSize: 12 },
  todayStatus: { fontSize: 12, fontWeight: "700" },
  focusMacros: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, rowGap: 4 },
  macroNote: { fontSize: 10 },
  eatenGroup: { gap: 2 },
  macroBlock: { gap: 4 },
  todayLabel: { fontSize: 12 },
  focusMacro: { fontSize: 12, fontWeight: "700" },
  focusMacroDiv: { width: 1, height: 11, backgroundColor: theme.colors.border },

  // Date picker (iOS sheet)
  pickerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: theme.space.xl },
  pickerSheet: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, padding: theme.space.md, gap: theme.space.sm },

  // Stats row
  statsRow: { flexDirection: "row", gap: theme.space.md },
  statCard: { flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" },
  statPrimary: { color: theme.colors.primary, fontSize: 18 },
  statAccent: { color: theme.colors.accent, fontSize: 18 },
  statOrange: { color: theme.colors.accent2, fontSize: 18 },
  statStreak: { flexDirection: "row", alignItems: "center", gap: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },

  // Generic section card
  sectionCard: { padding: theme.space.lg, gap: theme.space.lg },
  bold: { fontWeight: "700" },

  // Daily breakdown
  summaryList: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  summaryRowDim: { opacity: 0.4 }, // days not yet logged (incl. future days in month view)
  summaryLeft: { gap: 2 },
  summaryMeta: { fontSize: 11 },
  summaryRight: { alignItems: "flex-end", gap: 2 },
  summaryKcal: { fontSize: 14, fontWeight: "700" },
  summaryDelta: { fontSize: 11 },

  // Best day
  bestCard: { padding: theme.space.lg, gap: 6, borderColor: "rgba(5,150,105,0.2)", backgroundColor: "rgba(5,150,105,0.06)" },
  bestHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  bestTitle: { fontSize: 14 },
});
