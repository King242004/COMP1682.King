import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMeals } from "../context/MealsContext";
import { theme, macroGoals } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";

type Tab = "calories" | "macros" | "trends";

function getLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getLast7Days() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function MacroBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  const pct = Math.round(ratio * 100);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
          <AppText variant="body2">{label}</AppText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="subtle">{Math.round(value)}g / {total}g</AppText>
          <AppText style={{ fontSize: 11, fontWeight: "700", color: pct >= 100 ? theme.colors.danger : pct >= 80 ? theme.colors.accent : theme.colors.subtle }}>
            {pct}%
          </AppText>
        </View>
      </View>
      <View style={{ height: 6, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${ratio * 100}%`, borderRadius: 99, backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { user } = useAuth();
  // Use historyMeals (all logged days) — `meals` only holds the single selected date,
  // so 7-day stats must read from history.
  const { historyMeals, fetchMealHistory } = useMeals();
  const [activeTab, setActiveTab] = useState<Tab>("calories");

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = getLocalDateKey(today);
  const last7 = getLast7Days();
  const goal = user?.calorieGoal ?? 2000;

  // Macro goals từ calorie goal — dùng helper chung (theme.macroGoals)
  const { protein: proteinGoal, carbs: carbsGoal, fat: fatGoal } = macroGoals(goal);

  // Build daily summaries
  const summaries = last7.map((d) => {
    const key = getLocalDateKey(d);
    // Match on meal.date (logged day, YYYY-MM-DD) not createdAt (insertion timestamp)
    const dayMeals = historyMeals.filter((m) => m.date === key);
    const calories = dayMeals.reduce((s, m) => s + m.calories, 0);
    const ratio = goal > 0 ? calories / goal : 0;
    // On track = ≥ 80% và ≤ 100% goal
    const onTrack = calories > 0 && ratio >= 0.8 && ratio <= 1.0;
    // Distance to goal (for best day calculation)
    const distToGoal = calories > 0 ? Math.abs(calories - goal) : Infinity;

    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullLabel: d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      isToday: key === todayKey,
      calories,
      protein: dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0),
      carbs: dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0),
      fat: dayMeals.reduce((s, m) => s + (m.fat ?? 0), 0),
      mealCount: dayMeals.length,
      onTrack,
      distToGoal,
      ratio,
    };
  });

  const todaySummary = summaries[summaries.length - 1];
  const maxCalories = summaries.reduce((max, s) => Math.max(max, s.calories), 0) || 1;
  const daysWithMeals = summaries.filter((s) => s.calories > 0);

  // Stats
  const avgCalories = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.calories, 0) / daysWithMeals.length)
    : 0;
  const daysOnTrack = summaries.filter((s) => s.onTrack).length;

  // Best day = ngày gần goal nhất (có log bữa ăn)
  const bestDay = daysWithMeals.length > 0
    ? daysWithMeals.reduce((best, s) => s.distToGoal < best.distToGoal ? s : best, daysWithMeals[0])
    : null;

  // Streak = số ngày liên tiếp có log bữa ăn tính từ hôm nay về trước
  const streak = (() => {
    let count = 0;
    for (let i = summaries.length - 1; i >= 0; i--) {
      if (summaries[i].calories > 0) count++;
      else break;
    }
    return count;
  })();

  // Macro weekly averages
  const avgProtein = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.protein, 0) / daysWithMeals.length) : 0;
  const avgCarbs = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.carbs, 0) / daysWithMeals.length) : 0;
  const avgFat = daysWithMeals.length > 0
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.fat, 0) / daysWithMeals.length) : 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "calories", label: "Calories" },
    { key: "macros", label: "Nutrition" },
    { key: "trends", label: "Weekly" },
  ];

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: theme.space.lg,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: 4 }}>
          <AppText variant="h1">Progress</AppText>
          <AppText variant="muted">Your nutrition for the last 7 days.</AppText>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => ({
                  flex: 1, alignItems: "center", paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: active ? theme.colors.primary : "rgba(37,99,235,0.06)",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppText style={{
                  fontSize: 13, fontWeight: "700",
                  color: active ? "#FFFFFF" : theme.colors.subtle,
                }}>
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* CALORIES TAB */}
        {activeTab === "calories" && (
          <>
            {/* Today card */}
            <Card style={{ padding: theme.space.xl, gap: theme.space.md }}>
              <AppText variant="subtle" style={{ fontSize: 12 }}>Today</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <AppText variant="h0" style={{ fontSize: 32, color: theme.colors.primary }}>
                  {todaySummary.calories.toLocaleString()}
                </AppText>
                <AppText variant="muted">/ {goal.toLocaleString()} kcal</AppText>
              </View>
              <View style={{ height: 8, borderRadius: 99, backgroundColor: "rgba(37,99,235,0.08)", overflow: "hidden" }}>
                <View style={{
                  height: "100%",
                  width: `${Math.min(todaySummary.ratio, 1) * 100}%`,
                  borderRadius: 99,
                  backgroundColor: todaySummary.calories > goal
                    ? theme.colors.danger
                    : todaySummary.onTrack
                    ? theme.colors.accent
                    : theme.colors.primary,
                }} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <AppText variant="subtle" style={{ fontSize: 12 }}>
                  {todaySummary.calories > goal
                    ? `${(todaySummary.calories - goal).toLocaleString()} kcal over goal`
                    : `${Math.max(0, goal - todaySummary.calories).toLocaleString()} kcal remaining`}
                </AppText>
                <AppText style={{
                  fontSize: 12, fontWeight: "700",
                  color: todaySummary.onTrack ? theme.colors.accent : theme.colors.subtle,
                }}>
                  {todaySummary.onTrack ? "✓ On track" : `${Math.round(todaySummary.ratio * 100)}%`}
                </AppText>
              </View>
            </Card>

            {/* Weekly bar chart with goal line */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
              <AppText variant="h2">This week</AppText>
              <View style={{ position: "relative" }}>
                {/* Goal line */}
                <View style={{
                  position: "absolute",
                  left: 0, right: 0,
                  top: (1 - goal / maxCalories) * 80,
                  height: 1.5,
                  backgroundColor: theme.colors.accent,
                  zIndex: 1,
                  opacity: goal <= maxCalories ? 1 : 0,
                }} />
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 100 }}>
                  {summaries.map((day) => {
                    const ratio = day.calories / maxCalories;
                    const barH = Math.max(4, ratio * 80);
                    const barColor = day.calories > goal
                      ? theme.colors.danger
                      : day.onTrack
                      ? theme.colors.accent
                      : day.isToday
                      ? theme.colors.primary
                      : "rgba(37,99,235,0.15)";
                    return (
                      <View key={day.key} style={{ flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        {day.calories > 0 && (
                          <AppText style={{ fontSize: 9, color: theme.colors.subtle }}>
                            {day.calories >= 1000 ? `${(day.calories / 1000).toFixed(1)}k` : day.calories}
                          </AppText>
                        )}
                        <View style={{
                          width: "100%", height: barH, borderRadius: 6,
                          backgroundColor: barColor,
                        }} />
                        <AppText style={{
                          fontSize: 10, fontWeight: day.isToday ? "700" : "500",
                          color: day.isToday ? theme.colors.primary : theme.colors.subtle,
                        }}>
                          {day.label[0]}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              </View>
              {/* Legend */}
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 16, height: 2, backgroundColor: theme.colors.accent }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>Goal ({goal.toLocaleString()} kcal)</AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme.colors.accent }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>On track (80–100%)</AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme.colors.danger }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>Over goal</AppText>
                </View>
              </View>
            </Card>

            {/* Stats row */}
            <View style={{ flexDirection: "row", gap: theme.space.md }}>
              <Card style={{ flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" }}>
                <AppText variant="h2" style={{ color: theme.colors.primary, fontSize: 18 }}>
                  {avgCalories > 0 ? avgCalories.toLocaleString() : "—"}
                </AppText>
                <AppText variant="subtle" style={{ fontSize: 11, textAlign: "center" }}>avg kcal/day</AppText>
              </Card>
              <Card style={{ flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" }}>
                <AppText variant="h2" style={{ color: theme.colors.accent, fontSize: 18 }}>
                  {daysOnTrack}/7
                </AppText>
                <AppText variant="subtle" style={{ fontSize: 11, textAlign: "center" }}>days on track</AppText>
              </Card>
              <Card style={{ flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" }}>
                <AppText variant="h2" style={{ color: theme.colors.accent2, fontSize: 18 }}>
                  {streak}🔥
                </AppText>
                <AppText variant="subtle" style={{ fontSize: 11, textAlign: "center" }}>day streak</AppText>
              </Card>
            </View>
          </>
        )}

        {/* NUTRITION TAB */}
        {activeTab === "macros" && (
          <>
            {/* Today's macros */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <AppText variant="h2">Today's nutrition</AppText>
                <AppText variant="subtle" style={{ fontSize: 11 }}>
                  Based on {goal.toLocaleString()} kcal
                </AppText>
              </View>
              {todaySummary.protein > 0 || todaySummary.carbs > 0 || todaySummary.fat > 0 ? (
                <View style={{ gap: theme.space.md }}>
                  <MacroBar label="Protein" value={todaySummary.protein} total={proteinGoal} color={theme.colors.accent2} />
                  <MacroBar label="Carbs" value={todaySummary.carbs} total={carbsGoal} color={theme.colors.accent} />
                  <MacroBar label="Fat" value={todaySummary.fat} total={fatGoal} color={theme.colors.indigo} />
                </View>
              ) : (
                <AppText variant="subtle">No macro data logged today.</AppText>
              )}
            </Card>

            {/* Daily targets */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
              <AppText variant="h2">Daily targets</AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>
                30% protein · 45% carbs · 25% fat from {goal.toLocaleString()} kcal goal
              </AppText>
              <View style={{ flexDirection: "row" }}>
                {[
                  { label: "Protein", value: proteinGoal, color: theme.colors.accent2 },
                  { label: "Carbs", value: carbsGoal, color: theme.colors.accent },
                  { label: "Fat", value: fatGoal, color: theme.colors.indigo },
                ].map((m, i) => (
                  <View key={m.label} style={{
                    flex: 1, alignItems: "center", gap: 4,
                    borderLeftWidth: i > 0 ? 0.5 : 0,
                    borderLeftColor: theme.colors.border,
                  }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
                    <AppText variant="h2" style={{ fontSize: 18, color: m.color }}>{m.value}g</AppText>
                    <AppText variant="subtle" style={{ fontSize: 11 }}>{m.label}</AppText>
                  </View>
                ))}
              </View>
            </Card>

            {/* Weekly averages */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <AppText variant="h2">Weekly average</AppText>
                <AppText variant="subtle" style={{ fontSize: 11 }}>{daysWithMeals.length} days logged</AppText>
              </View>
              {daysWithMeals.length > 0 ? (
                <View style={{ gap: theme.space.md }}>
                  <MacroBar label="Protein" value={avgProtein} total={proteinGoal} color={theme.colors.accent2} />
                  <MacroBar label="Carbs" value={avgCarbs} total={carbsGoal} color={theme.colors.accent} />
                  <MacroBar label="Fat" value={avgFat} total={fatGoal} color={theme.colors.indigo} />
                </View>
              ) : (
                <AppText variant="subtle">No macro data this week.</AppText>
              )}
            </Card>

            {/* Daily macro ratio breakdown */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
              <AppText variant="h2">Daily macro ratio</AppText>
              <View style={{ gap: 12 }}>
                {summaries.map((day) => {
                  const totalMacroG = day.protein + day.carbs + day.fat;
                  const pPct = totalMacroG > 0 ? Math.round((day.protein / totalMacroG) * 100) : 0;
                  const cPct = totalMacroG > 0 ? Math.round((day.carbs / totalMacroG) * 100) : 0;
                  const fPct = totalMacroG > 0 ? Math.round((day.fat / totalMacroG) * 100) : 0;
                  return (
                    <View key={day.key} style={{ gap: 6 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <AppText variant="body2" style={{ fontWeight: day.isToday ? "700" : "500" }}>
                          {day.label}{day.isToday ? " (Today)" : ""}
                        </AppText>
                        {totalMacroG > 0 ? (
                          <AppText variant="subtle" style={{ fontSize: 11 }}>
                            P {pPct}% · C {cPct}% · F {fPct}%
                          </AppText>
                        ) : (
                          <AppText variant="subtle" style={{ fontSize: 11 }}>No data</AppText>
                        )}
                      </View>
                      {totalMacroG > 0 ? (
                        <View style={{ flexDirection: "row", height: 5, borderRadius: 99, overflow: "hidden", gap: 1 }}>
                          <View style={{ flex: pPct, backgroundColor: theme.colors.accent2 }} />
                          <View style={{ flex: cPct, backgroundColor: theme.colors.accent }} />
                          <View style={{ flex: fPct, backgroundColor: theme.colors.indigo }} />
                        </View>
                      ) : (
                        <View style={{ height: 5, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.06)" }} />
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        {/* WEEKLY TAB */}
        {activeTab === "trends" && (
          <>
            {/* Streak card */}
            {streak > 0 && (
              <Card style={{
                padding: theme.space.lg, gap: 6,
                backgroundColor: "rgba(255,138,61,0.06)",
                borderColor: "rgba(255,138,61,0.2)",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <AppText style={{ fontSize: 24 }}>🔥</AppText>
                  <View>
                    <AppText variant="h2" style={{ color: theme.colors.accent2 }}>
                      {streak} day streak!
                    </AppText>
                    <AppText variant="subtle" style={{ fontSize: 12 }}>
                      Keep it up — log meals every day to maintain your streak.
                    </AppText>
                  </View>
                </View>
              </Card>
            )}

            {/* Weekly summary table */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.lg }}>
              <AppText variant="h2">Weekly summary</AppText>
              <View style={{ gap: 10 }}>
                {summaries.map((day) => (
                  <View key={day.key} style={{
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border,
                  }}>
                    <View style={{ gap: 2 }}>
                      <AppText variant="body2" style={{ fontWeight: day.isToday ? "700" : "500" }}>
                        {day.fullLabel}{day.isToday ? " (Today)" : ""}
                      </AppText>
                      <AppText variant="subtle" style={{ fontSize: 11 }}>
                        {day.mealCount > 0 ? `${day.mealCount} meal${day.mealCount !== 1 ? "s" : ""} logged` : "No meals logged"}
                      </AppText>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <AppText style={{
                        fontSize: 14, fontWeight: "700",
                        color: day.calories === 0 ? theme.colors.subtle
                          : day.calories > goal ? theme.colors.danger
                          : day.onTrack ? theme.colors.accent
                          : theme.colors.primary,
                      }}>
                        {day.calories > 0 ? `${day.calories.toLocaleString()} kcal` : "—"}
                      </AppText>
                      {day.calories > 0 && (
                        <AppText variant="subtle" style={{ fontSize: 11 }}>
                          {day.calories > goal
                            ? `+${(day.calories - goal).toLocaleString()} over`
                            : day.onTrack
                            ? "✓ On track"
                            : `${(goal - day.calories).toLocaleString()} under`}
                        </AppText>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* Best day = ngày gần goal nhất */}
            {bestDay && (
              <Card style={{
                padding: theme.space.lg, gap: 6,
                borderColor: "rgba(47,191,113,0.2)",
                backgroundColor: "rgba(47,191,113,0.06)",
              }}>
                <AppText variant="h2" style={{ fontSize: 14 }}>🏆 Closest to goal this week</AppText>
                <AppText variant="muted">
                  {bestDay.fullLabel} — {bestDay.calories.toLocaleString()} kcal
                  {bestDay.onTrack ? " ✓ On track!" : ` (${Math.abs(bestDay.calories - goal).toLocaleString()} kcal from goal)`}
                </AppText>
              </Card>
            )}

            {/* Consistency circles */}
            <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <AppText variant="h2">Consistency</AppText>
                <AppText variant="subtle" style={{ fontSize: 12 }}>
                  {daysWithMeals.length}/7 days logged
                </AppText>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {summaries.map((day) => (
                  <View key={day.key} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: day.onTrack
                        ? theme.colors.accent
                        : day.calories > goal
                        ? theme.colors.danger
                        : day.calories > 0
                        ? theme.colors.primary
                        : "rgba(37,99,235,0.08)",
                      borderWidth: day.isToday && day.calories === 0 ? 1.5 : 0,
                      borderColor: theme.colors.primary,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {day.calories > 0 && (
                        <AppText style={{ fontSize: 13, color: "#fff" }}>
                          {day.onTrack ? "✓" : day.calories > goal ? "!" : "·"}
                        </AppText>
                      )}
                    </View>
                    <AppText style={{
                      fontSize: 10, fontWeight: day.isToday ? "700" : "500",
                      color: day.isToday ? theme.colors.primary : theme.colors.subtle,
                    }}>
                      {day.label[0]}
                    </AppText>
                  </View>
                ))}
              </View>
              {/* Legend */}
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.accent }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>On track</AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>Logged</AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.danger }} />
                  <AppText variant="subtle" style={{ fontSize: 11 }}>Over goal</AppText>
                </View>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}