import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { useT } from "@/i18n";
import { theme, macroGoals } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { buildDaySummaries } from "@/features/progress/summary";
import { WeightSection } from "@/features/weight/WeightSection";
import { mealStreak } from "@/utils/streak";
import { MacroBar } from "@/features/progress/MacroBar";
import { WeeklyBarChart } from "@/features/progress/WeeklyBarChart";
import { MacroRatioList } from "@/features/progress/MacroRatioList";
import { ConsistencyRow } from "@/features/progress/ConsistencyRow";

type Tab = "calories" | "macros" | "trends" | "weight";

export default function ProgressScreen() {
  const { user } = useAuth();
  // Use historyMeals (all logged days) — `meals` only holds the selected date.
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>("calories");
  const [range, setRange] = useState<7 | 30>(7); // stats window (7 or 30 trailing days)

  const tabs: { key: Tab; label: string }[] = [
    { key: "calories", label: t.progress.tabCalories },
    { key: "macros", label: t.progress.tabNutrition },
    { key: "trends", label: t.progress.tabWeekly },
    { key: "weight", label: t.weight.tab },
  ];

  useEffect(() => { fetchMealHistory(); }, []);

  const goal = user?.calorieGoal ?? 2000;
  const { protein: proteinGoal, carbs: carbsGoal, fat: fatGoal } = macroGoals(goal);

  const summaries = buildDaySummaries(historyMeals, goal, range);
  const todaySummary = summaries[summaries.length - 1];
  const maxCalories = summaries.reduce((max, s) => Math.max(max, s.calories), 0) || 1;
  const daysWithMeals = summaries.filter((s) => s.calories > 0);

  const avgCalories = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.calories, 0) / daysWithMeals.length) : 0;
  const daysOnTrack = summaries.filter((s) => s.onTrack).length;

  // Best day = closest to goal among days with meals
  const bestDay = daysWithMeals.length > 0
    ? daysWithMeals.reduce((best, s) => (s.distToGoal < best.distToGoal ? s : best), daysWithMeals[0])
    : null;

  // Streak — SAME helper as the AppHeader 🔥 pill, so the two never disagree
  // (the old local loop capped at the 7-day window: header said 12, here said 7)
  const streak = mealStreak(historyMeals.map((m) => m.date));

  const avgProtein = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.protein, 0) / daysWithMeals.length) : 0;
  const avgCarbs = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.carbs, 0) / daysWithMeals.length) : 0;
  const avgFat = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.fat, 0) / daysWithMeals.length) : 0;

  const todayBarColor = todaySummary.calories > goal
    ? theme.colors.danger
    : todaySummary.onTrack
    ? theme.colors.accent
    : theme.colors.primary;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header + 7/30-day window toggle */}
        <View>
          <ScreenHeader
            title={t.progress.title}
            right={
              <View style={styles.rangeToggle}>
                {([7, 30] as const).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRange(r)}
                    style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                  >
                    <AppText style={[styles.rangeText, range === r && styles.rangeTextActive]}>
                      {r === 7 ? t.progress.range7 : t.progress.range30}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            }
          />
          <AppText variant="muted" style={styles.subtitle}>{t.progress.subtitle(range)}</AppText>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}
              >
                <AppText style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</AppText>
              </Pressable>
            );
          })}
        </View>

        {/* CALORIES TAB */}
        {activeTab === "calories" && (
          <>
            {/* Today card */}
            <Card style={styles.todayCard}>
              <AppText variant="subtle" style={styles.todayLabel}>{t.progress.today}</AppText>
              <View style={styles.todayValueRow}>
                <AppText variant="h0" style={styles.todayValue}>{todaySummary.calories.toLocaleString()}</AppText>
                <AppText variant="muted">/ {goal.toLocaleString()} {t.common.kcal}</AppText>
              </View>
              <View style={styles.todayTrack}>
                <View style={[styles.todayFill, { width: `${Math.min(todaySummary.ratio, 1) * 100}%`, backgroundColor: todayBarColor }]} />
              </View>
              <View style={styles.todayFooter}>
                <AppText variant="subtle" style={styles.todayFootText}>
                  {todaySummary.calories > goal
                    ? t.progress.overGoal((todaySummary.calories - goal).toLocaleString())
                    : t.progress.remaining(Math.max(0, goal - todaySummary.calories).toLocaleString())}
                </AppText>
                <AppText style={[styles.todayStatus, { color: todaySummary.onTrack ? theme.colors.accent : theme.colors.subtle }]}>
                  {todaySummary.onTrack ? t.progress.onTrack : `${Math.round(todaySummary.ratio * 100)}%`}
                </AppText>
              </View>
            </Card>

            <WeeklyBarChart
              summaries={summaries}
              goal={goal}
              maxCalories={maxCalories}
              title={range === 7 ? t.progress.thisWeek : t.progress.lastNDays(30)}
            />

            {/* Stats row */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statPrimary}>{avgCalories > 0 ? avgCalories.toLocaleString() : "—"}</AppText>
                <AppText variant="subtle" style={styles.statLabel}>{t.progress.avgKcalDay}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statAccent}>{daysOnTrack}/{range}</AppText>
                <AppText variant="subtle" style={styles.statLabel}>{t.progress.daysOnTrack}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statOrange}>{streak}🔥</AppText>
                <AppText variant="subtle" style={styles.statLabel}>{t.progress.dayStreak}</AppText>
              </Card>
            </View>
          </>
        )}

        {/* NUTRITION TAB */}
        {activeTab === "macros" && (
          <>
            {/* Today's macros */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHead}>
                <AppText variant="h2">{t.progress.todaysNutrition}</AppText>
                <AppText variant="subtle" style={styles.sectionMeta}>{t.progress.basedOn(goal.toLocaleString())}</AppText>
              </View>
              {todaySummary.protein > 0 || todaySummary.carbs > 0 || todaySummary.fat > 0 ? (
                <View style={styles.macroList}>
                  <MacroBar label={t.labels.protein} value={todaySummary.protein} total={proteinGoal} color={theme.colors.accent2} />
                  <MacroBar label={t.labels.carbs} value={todaySummary.carbs} total={carbsGoal} color={theme.colors.accent} />
                  <MacroBar label={t.labels.fat} value={todaySummary.fat} total={fatGoal} color={theme.colors.indigo} />
                </View>
              ) : (
                <AppText variant="subtle">{t.progress.noMacroToday}</AppText>
              )}
            </Card>

            {/* Daily targets */}
            <Card style={styles.targetCard}>
              <AppText variant="h2">{t.progress.dailyTargets}</AppText>
              <AppText variant="subtle" style={styles.targetSub}>{t.progress.targetsSub(goal.toLocaleString())}</AppText>
              <View style={styles.targetRow}>
                {[
                  { label: t.labels.protein, value: proteinGoal, color: theme.colors.accent2 },
                  { label: t.labels.carbs, value: carbsGoal, color: theme.colors.accent },
                  { label: t.labels.fat, value: fatGoal, color: theme.colors.indigo },
                ].map((m, i) => (
                  <View key={m.label} style={[styles.targetCol, i > 0 && styles.targetColDivider]}>
                    <View style={[styles.targetDot, { backgroundColor: m.color }]} />
                    <AppText variant="h2" style={[styles.targetValue, { color: m.color }]}>{m.value}g</AppText>
                    <AppText variant="subtle" style={styles.targetLabel}>{m.label}</AppText>
                  </View>
                ))}
              </View>
            </Card>

            {/* Weekly averages */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHead}>
                <AppText variant="h2">{t.progress.weeklyAverage}</AppText>
                <AppText variant="subtle" style={styles.sectionMeta}>{t.progress.daysLogged(daysWithMeals.length)}</AppText>
              </View>
              {daysWithMeals.length > 0 ? (
                <View style={styles.macroList}>
                  <MacroBar label={t.labels.protein} value={avgProtein} total={proteinGoal} color={theme.colors.accent2} />
                  <MacroBar label={t.labels.carbs} value={avgCarbs} total={carbsGoal} color={theme.colors.accent} />
                  <MacroBar label={t.labels.fat} value={avgFat} total={fatGoal} color={theme.colors.indigo} />
                </View>
              ) : (
                <AppText variant="subtle">{t.progress.noMacroWeek}</AppText>
              )}
            </Card>

            <MacroRatioList summaries={summaries} />
          </>
        )}

        {/* WEEKLY TAB */}
        {activeTab === "trends" && (
          <>
            {/* Streak card */}
            {streak > 0 && (
              <Card style={styles.streakCard}>
                <View style={styles.streakRow}>
                  <AppText style={styles.streakEmoji}>🔥</AppText>
                  <View>
                    <AppText variant="h2" style={styles.streakTitle}>{t.progress.streakBang(streak)}</AppText>
                    <AppText variant="subtle" style={styles.streakSub}>{t.progress.streakSub}</AppText>
                  </View>
                </View>
              </Card>
            )}

            {/* Weekly summary table */}
            <Card style={styles.sectionCard}>
              <AppText variant="h2">{t.progress.weeklySummary}</AppText>
              <View style={styles.summaryList}>
                {summaries.map((day) => (
                  <View key={day.key} style={styles.summaryRow}>
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
                          : day.calories > goal ? theme.colors.danger
                          : day.onTrack ? theme.colors.accent
                          : theme.colors.primary,
                      }]}>
                        {day.calories > 0 ? `${day.calories.toLocaleString()} ${t.common.kcal}` : "—"}
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

            {/* Best day = closest to goal */}
            {bestDay && (
              <Card style={styles.bestCard}>
                <AppText variant="h2" style={styles.bestTitle}>{t.progress.closestToGoal}</AppText>
                <AppText variant="muted">
                  {bestDay.onTrack
                    ? t.progress.closestOnTrack(bestDay.fullLabel, bestDay.calories.toLocaleString())
                    : t.progress.closestOff(bestDay.fullLabel, bestDay.calories.toLocaleString(), Math.abs(bestDay.calories - goal).toLocaleString())}
                </AppText>
              </Card>
            )}

            {/* Consistency stays a WEEK widget — 30 dots would be unreadable */}
            <ConsistencyRow
              summaries={summaries.slice(-7)}
              goal={goal}
              daysLogged={summaries.slice(-7).filter((s) => s.calories > 0).length}
            />
          </>
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
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.tintSoft },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  pressed: { opacity: 0.7 },

  // Today card
  todayCard: { padding: theme.space.xl, gap: theme.space.md },
  todayLabel: { fontSize: 12 },
  todayValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  todayValue: { fontSize: 32, color: theme.colors.primary },
  todayTrack: { height: 8, borderRadius: 99, backgroundColor: theme.colors.tint, overflow: "hidden" },
  todayFill: { height: "100%", borderRadius: 99 },
  todayFooter: { flexDirection: "row", justifyContent: "space-between" },
  todayFootText: { fontSize: 12 },
  todayStatus: { fontSize: 12, fontWeight: "700" },

  // Stats row
  statsRow: { flexDirection: "row", gap: theme.space.md },
  statCard: { flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" },
  statPrimary: { color: theme.colors.primary, fontSize: 18 },
  statAccent: { color: theme.colors.accent, fontSize: 18 },
  statOrange: { color: theme.colors.accent2, fontSize: 18 },
  statLabel: { fontSize: 11, textAlign: "center" },

  // Generic section card
  sectionCard: { padding: theme.space.lg, gap: theme.space.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionMeta: { fontSize: 11 },
  macroList: { gap: theme.space.md },
  bold: { fontWeight: "700" },

  // Daily targets
  targetCard: { padding: theme.space.lg, gap: theme.space.md },
  targetSub: { fontSize: 12 },
  targetRow: { flexDirection: "row" },
  targetCol: { flex: 1, alignItems: "center", gap: 4 },
  targetColDivider: { borderLeftWidth: 0.5, borderLeftColor: theme.colors.border },
  targetDot: { width: 8, height: 8, borderRadius: 4 },
  targetValue: { fontSize: 18 },
  targetLabel: { fontSize: 11 },

  // Streak card
  streakCard: { padding: theme.space.lg, gap: 6, backgroundColor: "rgba(255,138,61,0.06)", borderColor: "rgba(255,138,61,0.2)" },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakEmoji: { fontSize: 24 },
  streakTitle: { color: theme.colors.accent2 },
  streakSub: { fontSize: 12 },

  // Weekly summary
  summaryList: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  summaryLeft: { gap: 2 },
  summaryMeta: { fontSize: 11 },
  summaryRight: { alignItems: "flex-end", gap: 2 },
  summaryKcal: { fontSize: 14, fontWeight: "700" },
  summaryDelta: { fontSize: 11 },

  // Best day
  bestCard: { padding: theme.space.lg, gap: 6, borderColor: "rgba(5,150,105,0.2)", backgroundColor: "rgba(5,150,105,0.06)" },
  bestTitle: { fontSize: 14 },
});
