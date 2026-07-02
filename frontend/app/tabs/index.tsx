// HOME SCREEN
import { useCallback, useState, useMemo } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { getExercisesByDate, deleteExercise, type Exercise } from "@/utils/exercise";
import { getPlanMeals, type PlanMeal } from "@/utils/plan";
import { getInsight, getCachedInsight, cacheInsight, INSIGHT_TTL_MS, type CoachInsight } from "@/utils/coach";
import { dateKey } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme, macroGoals } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "☕" },
  { key: "lunch", label: "Lunch", icon: "🥗" },
  { key: "dinner", label: "Dinner", icon: "🍽️" },
  { key: "snack", label: "Snacks", icon: "🍎" },
];

function getLast7Days() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from Monday of current week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Go back to Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const dayLabelsFixed = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Big friendly progress ring for the hero calorie card
function CalorieRing({ eaten, goal }: { eaten: number; goal: number }) {
  const size = 116;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const over = eaten > goal;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(37,99,235,0.10)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={over ? theme.colors.danger : theme.colors.primary}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText style={{ fontSize: 22, fontWeight: "800", color: over ? theme.colors.danger : theme.colors.primary }}>
        {Math.round(progress * 100)}%
      </AppText>
      <AppText variant="subtle" style={{ fontSize: 10 }}>of goal</AppText>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { meals, dailyTotals, historyMeals, fetchMealsByDate, fetchMealHistory } = useMeals();

  const today = new Date();
  const todayKey = dateKey(today);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalBurned, setTotalBurned] = useState(0);
  const [coachInsight, setCoachInsight] = useState<CoachInsight | null>(null);
  const [planToday, setPlanToday] = useState<PlanMeal[]>([]);
  const [planWorkout, setPlanWorkout] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    if (!token) return;
    try {
      const { exercises, totalBurned } = await getExercisesByDate(token, selectedDate);
      setExercises(exercises);
      setTotalBurned(totalBurned);
    } catch {
      setExercises([]);
      setTotalBurned(0);
    }
  }, [token, selectedDate]);

  // Today's plan (meals not yet eaten + AI workout tip) for the Home card
  const loadPlanToday = useCallback(async () => {
    if (!token) return;
    try {
      const { meals, workouts } = await getPlanMeals(token, todayKey, todayKey);
      setPlanToday(meals);
      setPlanWorkout(workouts[todayKey] || null);
    } catch {
      setPlanToday([]);
      setPlanWorkout(null);
    }
  }, [token, todayKey]);

  // Coach insight is for "today" only. Show cached instantly; only hit Gemini when
  // the cache is stale (TTL) — this runs on EVERY focus, so without the TTL each
  // visit to Home would burn a free-tier AI request.
  const lang = resolveLanguage(user?.language);
  const loadInsight = useCallback(async () => {
    if (!token || selectedDate !== todayKey) { setCoachInsight(null); return; }
    const cached = await getCachedInsight(todayKey, lang);
    if (cached) {
      setCoachInsight(cached.insight);
      if (Date.now() - cached.at < INSIGHT_TTL_MS) return; // fresh enough → no AI call
    }
    try {
      const fresh = await getInsight(token, todayKey, lang);
      setCoachInsight(fresh);
      cacheInsight(todayKey, lang, fresh);
    } catch {
      if (!cached) setCoachInsight(null);
    }
  }, [token, selectedDate, todayKey, lang]);

  // Refetch on focus (and when the selected date changes) so meals/workouts logged
  // elsewhere — e.g. "Eat" from the Meal Plan — show up on return.
  useFocusEffect(
    useCallback(() => {
      fetchMealsByDate(selectedDate);
      fetchMealHistory();
      loadExercises();
      loadInsight();
      loadPlanToday();
    }, [selectedDate, loadExercises, loadInsight, loadPlanToday])
  );

  const onDeleteExercise = (item: Exercise) => {
    Alert.alert("Delete workout?", `Remove "${item.name}" from today.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setExercises((prev) => prev.filter((e) => e.id !== item.id));
          setTotalBurned((prev) => prev - item.caloriesBurned);
          try {
            await deleteExercise(token, item.id);
          } catch {
            loadExercises(); // resync on failure
          }
        },
      },
    ]);
  };

  // Streak calculation
  const streak = useMemo(() => {
    const loggedDaysSet = new Set(historyMeals.map((m) => m.date));
    let count = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const key = dateKey(d);
      if (loggedDaysSet.has(key)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [historyMeals]);

  const goal = user?.calorieGoal ?? 2000;
  const eaten = dailyTotals.calories;
  const remaining = Math.max(0, goal - eaten);

  const totalCarbs = dailyTotals.carbs;
  const totalFat = dailyTotals.fat;
  const totalProtein = dailyTotals.protein;

  const last7 = getLast7Days();
  const loggedDays = new Set(historyMeals.map((m) => m.date));

  const mealsByType = (type: MealType) =>
    meals.filter((m) => m.mealType === type);

  const isToday = selectedDate === todayKey;

  return (
    <Screen padded={false} style={{ paddingTop: 0 }}>
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="h1">
            {isToday ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </AppText>
          {streak > 0 && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: "rgba(255,160,0,0.12)",
              borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
              borderWidth: 1, borderColor: "rgba(255,160,0,0.25)",
            }}>
              <AppText style={{ fontSize: 16 }}>🔥</AppText>
              <AppText style={{ fontSize: 14, fontWeight: "700", color: "#E67E00" }}>
                {streak} day{streak > 1 ? "s" : ""}
              </AppText>
            </View>
          )}
        </View>

        {/* 7-day row - clickable */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {last7.map((d, i) => {
            const key = dateKey(d);
            const logged = loggedDays.has(key);
            const isSelected = key === selectedDate;
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => ({
                  width: 42, paddingVertical: 9,
                  borderRadius: 16,
                  alignItems: "center", gap: 5,
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : logged
                    ? "rgba(37,99,235,0.10)"
                    : theme.colors.surface,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  // Subtle lift for unselected chips so they read as tappable
                  ...(isSelected ? {
                    shadowColor: theme.colors.primary,
                    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 8, elevation: 4,
                  } : {}),
                })}
              >
                <AppText style={{
                  fontSize: 10, fontWeight: "700",
                  color: isSelected ? "rgba(255,255,255,0.8)" : theme.colors.subtle,
                }}>
                  {dayLabelsFixed[i]}
                </AppText>
                <AppText style={{
                  fontSize: 14, fontWeight: "800",
                  color: isSelected ? "#fff" : logged ? theme.colors.primary : theme.colors.muted,
                }}>
                  {d.getDate()}
                </AppText>
                {/* Tiny dot marks logged days */}
                <View style={{
                  width: 5, height: 5, borderRadius: 3,
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.9)"
                    : logged ? theme.colors.accent : "transparent",
                }} />
              </Pressable>
            );
          })}
        </View>

        {/* Hero calorie ring card */}
        <Card style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ gap: 10, flex: 1 }}>
              <View style={{ gap: 2 }}>
                <AppText variant="subtle" style={{ fontSize: 12 }}>Eaten</AppText>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
                  <AppText variant="h0" style={{ fontSize: 34, color: theme.colors.text }}>
                    {eaten.toLocaleString()}
                  </AppText>
                  <AppText variant="muted" style={{ fontSize: 13 }}>
                    / {goal.toLocaleString()} kcal
                  </AppText>
                </View>
              </View>
              <View style={{
                alignSelf: "flex-start",
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: eaten > goal ? "rgba(229,72,77,0.10)" : "rgba(47,191,113,0.12)",
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
              }}>
                <AppText style={{
                  fontSize: 13, fontWeight: "700",
                  color: eaten > goal ? theme.colors.danger : "#1A9D58",
                }}>
                  {eaten > goal
                    ? `${(eaten - goal).toLocaleString()} over goal`
                    : `${remaining.toLocaleString()} kcal left`}
                </AppText>
              </View>
            </View>
            <CalorieRing eaten={eaten} goal={goal} />
          </View>
        </Card>

        {/* Macros card */}
        <Card style={{ padding: theme.space.lg }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { label: "Carbs", value: totalCarbs, goal: macroGoals(goal).carbs, color: theme.colors.accent },
              { label: "Fat", value: totalFat, goal: macroGoals(goal).fat, color: theme.colors.indigo },
              { label: "Protein", value: totalProtein, goal: macroGoals(goal).protein, color: theme.colors.accent2 },
            ].map((m, i) => (
              <View key={m.label} style={{
                flex: 1, alignItems: "center",
                borderLeftWidth: i > 0 ? 0.5 : 0,
                borderLeftColor: theme.colors.border,
                gap: 6, paddingHorizontal: 4,
              }}>
                <AppText variant="subtle" style={{ fontSize: 11 }}>{m.label}</AppText>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                  <AppText variant="h2" style={{ fontSize: 15 }}>{Math.round(m.value)}</AppText>
                  <AppText variant="subtle" style={{ fontSize: 10 }}>g</AppText>
                </View>
                <AppText variant="subtle" style={{ fontSize: 10 }}>/ {m.goal}g</AppText>
                <View style={{
                  height: 6, width: "80%", borderRadius: 99,
                  backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden",
                }}>
                  <View style={{
                    height: "100%",
                    width: `${Math.min(m.value / m.goal, 1) * 100}%`,
                    borderRadius: 99,
                    backgroundColor: m.color,
                  }} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Activity — closes the calories IN/OUT loop */}
        <Card style={{ padding: theme.space.lg, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: "rgba(255,138,61,0.12)",
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name="flame" size={18} color={theme.colors.accent2} />
              </View>
              <View>
                <AppText variant="h2" style={{ fontSize: 15 }}>Activity</AppText>
                <AppText variant="subtle" style={{ fontSize: 12 }}>
                  {totalBurned > 0 ? `${totalBurned} kcal burned` : "No workout logged"}
                </AppText>
              </View>
            </View>
            {isToday && (
              <Pressable
                onPress={() => router.push("/exercise/log-workout" as any)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                  backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.08)",
                })}
              >
                <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>Log</AppText>
              </Pressable>
            )}
          </View>

          {/* Net calories: eaten − burned */}
          {totalBurned > 0 && (
            <View style={{
              flexDirection: "row", justifyContent: "space-between", alignItems: "center",
              backgroundColor: "rgba(37,99,235,0.05)", borderRadius: 12, padding: theme.space.md,
            }}>
              <AppText variant="subtle" style={{ fontSize: 12 }}>Net calories (eaten − burned)</AppText>
              <AppText style={{ fontSize: 15, fontWeight: "800", color: theme.colors.text }}>
                {(eaten - totalBurned).toLocaleString()} kcal
              </AppText>
            </View>
          )}

          {/* Logged workouts */}
          {exercises.map((ex) => (
            <View key={ex.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AppText variant="body2" style={{ fontWeight: "600" }}>{ex.name}</AppText>
                <AppText variant="subtle" style={{ fontSize: 11 }}>{ex.durationMin} min · {ex.caloriesBurned} kcal</AppText>
              </View>
              {isToday && (
                <Pressable onPress={() => onDeleteExercise(ex)} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.subtle} />
                </Pressable>
              )}
            </View>
          ))}
        </Card>

        {/* Today's plan — surfaces the weekly plan (and its AI generation) on Home */}
        {isToday && (() => {
          const pending = planToday.filter((p) => !p.done);
          const vi = lang === "vi";
          return (
            <Pressable
              onPress={() => router.push("/plan/weekly" as any)}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}
            >
              <Card style={{ padding: theme.space.lg, gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: "rgba(99,102,241,0.12)",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name="calendar" size={18} color={theme.colors.indigo} />
                  </View>
                  <AppText variant="h2" style={{ fontSize: 15, flex: 1 }}>
                    {vi ? "Kế hoạch hôm nay" : "Today's plan"}
                  </AppText>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
                </View>

                {planToday.length === 0 ? (
                  <AppText variant="muted" style={{ fontSize: 13 }}>
                    {vi ? "Chưa có kế hoạch tuần — để AI tạo cho bạn ✨" : "No weekly plan yet — let the AI build one for you ✨"}
                  </AppText>
                ) : pending.length === 0 ? (
                  <AppText variant="muted" style={{ fontSize: 13 }}>
                    {vi ? "Đã hoàn thành kế hoạch hôm nay 🎉" : "Today's plan is all done 🎉"}
                  </AppText>
                ) : (
                  pending.slice(0, 2).map((p) => (
                    <View key={p.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.indigo }} />
                      <AppText variant="body2" style={{ flex: 1 }}>{p.name}</AppText>
                      <AppText variant="subtle" style={{ fontSize: 11 }}>{p.calories} kcal</AppText>
                    </View>
                  ))
                )}

                {!!planWorkout && (
                  <View style={{
                    flexDirection: "row", alignItems: "flex-start", gap: 8,
                    backgroundColor: "rgba(255,138,61,0.08)", borderRadius: 10, padding: 8,
                  }}>
                    <AppText style={{ fontSize: 13 }}>🏃</AppText>
                    <AppText variant="subtle" style={{ flex: 1, fontSize: 12 }}>{planWorkout}</AppText>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })()}

        {/* Diary */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <AppText variant="h2">Diary</AppText>
            <Pressable onPress={() => router.push("/meals/history")}>
              <AppText variant="subtle" style={{ fontSize: 13, color: theme.colors.primary }}>View all</AppText>
            </Pressable>
          </View>

          {MEAL_TYPES.map((mt) => {
            const typeMeals = mealsByType(mt.key);
            const typeCalories = typeMeals.reduce((s, m) => s + m.calories, 0);
            const typeCarbs = typeMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
            const typeFat = typeMeals.reduce((s, m) => s + (m.fat ?? 0), 0);
            const typeProtein = typeMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
            const totalMacroG = typeCarbs + typeFat + typeProtein;
            const carbPct = totalMacroG > 0 ? Math.round((typeCarbs / totalMacroG) * 100) : 0;
            const fatPct = totalMacroG > 0 ? Math.round((typeFat / totalMacroG) * 100) : 0;
            const proteinPct = totalMacroG > 0 ? Math.round((typeProtein / totalMacroG) * 100) : 0;

            return (
              <Card key={mt.key} style={{ padding: theme.space.lg, gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {/* Icon sits in a soft tinted square — friendlier than a bare emoji */}
                    <View style={{
                      width: 42, height: 42, borderRadius: 14,
                      backgroundColor: "rgba(37,99,235,0.08)",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <AppText style={{ fontSize: 20 }}>{mt.icon}</AppText>
                    </View>
                    <View>
                      <AppText variant="h2" style={{ fontSize: 15 }}>{mt.label}</AppText>
                      {typeMeals.length > 0 && (
                        <AppText variant="subtle" style={{ fontSize: 12 }}>
                          {typeMeals[0].name}{typeMeals.length > 1 ? ` and ${typeMeals.length - 1} more` : ""}
                        </AppText>
                      )}
                    </View>
                  </View>
                  {isToday && (
                    <Pressable
                      onPress={() => router.push({
                        pathname: "/meals/add",
                        params: { mealType: mt.key },
                      })}
                      style={({ pressed }) => ({
                        paddingHorizontal: 14, paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.08)",
                      })}
                    >
                      <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>
                        Log
                      </AppText>
                    </Pressable>
                  )}
                </View>

                {typeMeals.length > 0 ? (
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.text }}>
                        {typeCalories} cal
                      </AppText>
                      {carbPct > 0 && <AppText variant="subtle" style={{ fontSize: 11 }}>· C {carbPct}%</AppText>}
                      {fatPct > 0 && <AppText variant="subtle" style={{ fontSize: 11 }}>· F {fatPct}%</AppText>}
                      {proteinPct > 0 && <AppText variant="subtle" style={{ fontSize: 11 }}>· P {proteinPct}%</AppText>}
                    </View>
                    <View style={{ flexDirection: "row", height: 3, borderRadius: 99, overflow: "hidden", gap: 1 }}>
                      {carbPct > 0 && <View style={{ flex: carbPct, backgroundColor: theme.colors.accent }} />}
                      {fatPct > 0 && <View style={{ flex: fatPct, backgroundColor: theme.colors.indigo }} />}
                      {proteinPct > 0 && <View style={{ flex: proteinPct, backgroundColor: theme.colors.accent2 }} />}
                    </View>
                  </View>
                ) : (
                  <AppText variant="subtle" style={{ fontSize: 12 }}>No meals logged</AppText>
                )}
              </Card>
            );
          })}
        </View>

        {/* AI Coach — flagship entry */}
        {isToday && (
          <Pressable
            onPress={() => router.push("/tabs/coach" as any)}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}
          >
            <Card style={{
              padding: theme.space.lg,
              borderColor: "rgba(37,99,235,0.20)",
              backgroundColor: "rgba(37,99,235,0.05)",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <AppText variant="h2" style={{ fontSize: 15 }}>AI Coach</AppText>
                    {coachInsight && (
                      <View style={{
                        flexDirection: "row", alignItems: "center", gap: 3,
                        backgroundColor: "rgba(37,99,235,0.10)",
                        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
                      }}>
                        <AppText style={{ fontSize: 11, fontWeight: "800", color: theme.colors.primary }}>
                          {coachInsight.score}
                        </AppText>
                        <AppText style={{ fontSize: 10, color: theme.colors.primary }}>/100</AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="muted" style={{ fontSize: 13 }}>
                    {coachInsight?.summary || "Get personalized analysis and ask anything about your nutrition."}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
              </View>

              {/* Top warning, if any */}
              {coachInsight && coachInsight.warnings.length > 0 && (
                <View style={{
                  flexDirection: "row", gap: 6, alignItems: "flex-start", marginTop: 10,
                  backgroundColor: "rgba(229,72,77,0.08)", borderRadius: 10, padding: 10,
                }}>
                  <Ionicons name="warning-outline" size={15} color={theme.colors.danger} />
                  <AppText style={{ fontSize: 12, color: theme.colors.danger, flex: 1 }}>
                    {coachInsight.warnings[0]}
                  </AppText>
                </View>
              )}
            </Card>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}
