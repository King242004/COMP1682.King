// HOME SCREEN
import { useCallback, useState, useRef } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { getExercisesByDate, deleteExercise, type Exercise } from "@/features/exercise/api";
import { getPlanMeals, markPlanEaten, deletePlanMeal, type PlanMeal } from "@/features/plan/api";
import { getInsight, getCachedInsight, cacheInsight, INSIGHT_TTL_MS, type CoachInsight } from "@/features/coach/api";
import { SuggestMealCard } from "@/features/plan/SuggestMealCard";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { getCurrentWeekDays, dayLabelsFixed } from "@/features/home/week";
import { dateKey, weekNumber } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme, macroGoals, shadow } from "@/ui/theme";
import { MEAL_TYPE_META, type MealTypeKey } from "@/ui/mealTypes";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { Skeleton } from "@/ui/components/Skeleton";

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { meals, dailyTotals, historyMeals, isLoading, fetchMealsByDate, fetchMealHistory } = useMeals();

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

  // Tick a planned meal inside the Diary → logs it to the real diary (markEaten)
  const eatingPlanRef = useRef(false); // in-flight guard against double-tap
  const eatPlanned = async (p: PlanMeal) => {
    if (!token || eatingPlanRef.current) return;
    eatingPlanRef.current = true;
    try {
      await markPlanEaten(token, p.id);
      await Promise.all([fetchMealsByDate(todayKey), loadPlanToday()]);
    } catch {
      Alert.alert("Error", "Couldn't log this meal. Please try again.");
    } finally {
      eatingPlanRef.current = false;
    }
  };

  // Remove a planned meal right from the Diary (edit lives in the Plan screen)
  const removePlanned = (p: PlanMeal) => {
    Alert.alert("Remove from plan?", `Remove "${p.name}" from today's plan.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setPlanToday((prev) => prev.filter((x) => x.id !== p.id));
          try {
            await deletePlanMeal(token, p.id);
          } catch {
            loadPlanToday(); // resync on failure
          }
        },
      },
    ]);
  };

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

  // Pull-to-refresh re-runs every loader (insight still respects its TTL cache)
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMealsByDate(selectedDate),
      fetchMealHistory(),
      loadExercises(),
      loadInsight(),
      loadPlanToday(),
    ]);
    setRefreshing(false);
  }, [selectedDate, loadExercises, loadInsight, loadPlanToday]);

  // Refetch on focus (and when the selected date changes) so meals/workouts logged
  // elsewhere — e.g. "Eat" from the Meal Plan — show up on return.
  useFocusEffect(
    useCallback(() => {
      // Day rollover: if the app stayed open past midnight, "today" moved on.
      // Follow it when the user was still looking at the old today — the state
      // change re-renders with a fresh todayKey and re-runs this effect.
      const freshToday = dateKey(new Date());
      if (todayKey !== freshToday && selectedDate === todayKey) {
        setSelectedDate(freshToday);
        return;
      }
      fetchMealsByDate(selectedDate);
      fetchMealHistory();
      loadExercises();
      loadInsight();
      loadPlanToday();
    }, [selectedDate, todayKey, loadExercises, loadInsight, loadPlanToday])
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

  const goal = user?.calorieGoal ?? 2000;
  const eaten = dailyTotals.calories;
  const remaining = Math.max(0, goal - eaten);

  const totalCarbs = dailyTotals.carbs;
  const totalFat = dailyTotals.fat;
  const totalProtein = dailyTotals.protein;

  // Diary week browsing: back through the past freely, forward only up to the
  // current week — future diary days don't exist (that's the Plan screen's job).
  const [weekOffset, setWeekOffset] = useState(0);
  const changeWeek = (delta: number) => {
    const next = weekOffset + delta;
    if (next > 0) return;
    setWeekOffset(next);
    setSelectedDate(next === 0 ? todayKey : dateKey(getCurrentWeekDays(next)[0]));
  };

  const weekDays = getCurrentWeekDays(weekOffset);
  const loggedDays = new Set(historyMeals.map((m) => m.date));

  const mealsByType = (type: MealTypeKey) =>
    meals.filter((m) => m.mealType === type);

  const isToday = selectedDate === todayKey;
  const vi = lang === "vi";

  return (
    <Screen padded={false} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        {/* Header — title left, week navigator right ("Week N" keeps the arrows apart).
            Forward is disabled at the current week: the diary has no future weeks. */}
        <View style={styles.headerRow}>
          <AppText variant="h1">
            {isToday ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </AppText>
          <View style={styles.weekNav}>
            <Pressable
              onPress={() => changeWeek(-1)}
              hitSlop={10}
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressedDim]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.subtle} />
            </Pressable>
            <AppText variant="body2" style={[styles.weekLabel, weekOffset === 0 && styles.weekLabelCurrent]}>
              Week {weekNumber(weekDays[0])}
            </AppText>
            <Pressable
              onPress={() => changeWeek(1)}
              disabled={weekOffset === 0}
              hitSlop={10}
              style={({ pressed }) => [styles.navBtn, weekOffset === 0 ? styles.navBtnDisabled : pressed && styles.pressedDim]}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.subtle} />
            </Pressable>
          </View>
        </View>

        {/* Current week row (Mon→Sun) - past/today clickable, future dimmed */}
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const key = dateKey(d);
            const logged = loggedDays.has(key);
            const isSelected = key === selectedDate;
            const isFuture = key > todayKey; // YYYY-MM-DD so string compare works
            return (
              <Pressable
                key={i}
                disabled={isFuture}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => [
                  styles.dayChip,
                  logged && styles.dayChipLogged,
                  // Soft UI: every chip floats gently; the selected one sits deeper
                  isSelected ? styles.dayChipSelected : shadow(1),
                  isFuture && styles.dayChipFuture,
                  pressed && styles.dayChipPressed,
                ]}
              >
                <AppText style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {dayLabelsFixed[i]}
                </AppText>
                <AppText style={[styles.dayNum, isSelected ? styles.dayNumSelected : logged && styles.dayNumLogged]}>
                  {d.getDate()}
                </AppText>
                {/* Tiny dot marks logged days */}
                <View style={[styles.dayDot, isSelected ? styles.dayDotSelected : logged && styles.dayDotLogged]} />
              </Pressable>
            );
          })}
        </View>

        {/* Today summary — calories + macros merged into ONE elevated soft card
            (Soft UI Evolution: fewer, deeper blocks instead of many flat ones) */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.eatenBlock}>
              <View style={styles.eatenNumBlock}>
                <AppText variant="subtle" style={styles.smallLabel}>Eaten</AppText>
                <View style={styles.baselineRow}>
                  <AppText variant="h0" style={styles.kcalBig}>{eaten.toLocaleString()}</AppText>
                  <AppText variant="muted" style={styles.kcalGoal}>/ {goal.toLocaleString()} kcal</AppText>
                </View>
              </View>
              <View style={[styles.statusChip, eaten > goal && styles.statusChipOver]}>
                <AppText style={[styles.statusChipText, eaten > goal && styles.statusChipTextOver]}>
                  {eaten > goal
                    ? `${(eaten - goal).toLocaleString()} over goal`
                    : `${remaining.toLocaleString()} kcal left`}
                </AppText>
              </View>
            </View>
            <ProgressRing eaten={eaten} goal={goal} caption="of goal" />
          </View>

          <View style={styles.divider} />

          <View style={styles.macroRow}>
            {[
              { label: "Carbs", value: totalCarbs, goal: macroGoals(goal).carbs, color: theme.colors.accent },
              { label: "Fat", value: totalFat, goal: macroGoals(goal).fat, color: theme.colors.indigo },
              { label: "Protein", value: totalProtein, goal: macroGoals(goal).protein, color: theme.colors.accent2 },
            ].map((m) => (
              <View key={m.label} style={styles.macroCol}>
                <AppText variant="subtle" style={styles.macroLabel}>{m.label}</AppText>
                <View style={styles.baselineRowTight}>
                  <AppText variant="h2" style={styles.macroVal}>{Math.round(m.value)}</AppText>
                  <AppText variant="subtle" style={styles.macroUnit}>g</AppText>
                </View>
                <AppText variant="subtle" style={styles.macroUnit}>/ {m.goal}g</AppText>
                <View style={styles.macroTrack}>
                  {/* width known only at runtime */}
                  <View style={[styles.macroFill, { width: `${Math.min(m.value / m.goal, 1) * 100}%`, backgroundColor: m.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Diary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">Diary</AppText>
            <Pressable onPress={() => router.push("/meals/history")} hitSlop={10}>
              <AppText variant="subtle" style={styles.sectionLink}>View all</AppText>
            </Pressable>
          </View>

          {MEAL_TYPE_META.map((mt) => {
            const typeMeals = mealsByType(mt.key);
            const typeCalories = typeMeals.reduce((s, m) => s + m.calories, 0);
            const typeCarbs = typeMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
            const typeFat = typeMeals.reduce((s, m) => s + (m.fat ?? 0), 0);
            const typeProtein = typeMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
            const totalMacroG = typeCarbs + typeFat + typeProtein;
            const carbPct = totalMacroG > 0 ? Math.round((typeCarbs / totalMacroG) * 100) : 0;
            const fatPct = totalMacroG > 0 ? Math.round((typeFat / totalMacroG) * 100) : 0;
            const proteinPct = totalMacroG > 0 ? Math.round((typeProtein / totalMacroG) * 100) : 0;

            const plannedForType = isToday
              ? planToday.filter((p) => p.mealType === mt.key && !p.done)
              : [];

            return (
              <Card key={mt.key} style={styles.mealCard}>
                {/* Header: icon + label | tổng kcal + nút thêm món bên phải */}
                <View style={styles.mealCardHeader}>
                  <View style={styles.mealCardTitle}>
                    <View style={[styles.iconBox, { backgroundColor: mt.bg }]}>
                      <Ionicons name={mt.icon as any} size={18} color={mt.color} />
                    </View>
                    <AppText variant="h2" style={styles.cardTitleText}>{mt.label}</AppText>
                  </View>
                  <View style={styles.mealCardRight}>
                    {typeCalories > 0 && (
                      <AppText style={styles.typeKcal}>
                        {typeCalories} <AppText variant="subtle" style={styles.typeKcalUnit}>kcal</AppText>
                      </AppText>
                    )}
                    {/* Quick add — preselects this meal type AND the day being viewed.
                        Back-logging a past day is allowed (people forget); the week
                        strip already blocks future days. */}
                    <Pressable
                      onPress={() => router.push({ pathname: "/meals/add", params: { mealType: mt.key, date: selectedDate } })}
                      hitSlop={8}
                      style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                    >
                      <Ionicons name="add" size={17} color={theme.colors.primary} />
                    </Pressable>
                  </View>
                </View>

                {/* Eaten meals — soft inset rows, tap → detail (edit/delete there) */}
                {typeMeals.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push({ pathname: "/meals/detail", params: { id: m.id } })}
                    style={({ pressed }) => [styles.mealRow, pressed && styles.rowPressed]}
                  >
                    <AppText variant="body2" numberOfLines={1} style={styles.mealName}>{m.name}</AppText>
                    <AppText variant="subtle" style={styles.mealKcal}>{m.calories} kcal</AppText>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.subtle} />
                  </Pressable>
                ))}

                {/* Planned (not yet eaten) — dashed frame: ✓ logs it, ✕ removes it */}
                {plannedForType.map((p) => (
                  <View key={p.id} style={styles.plannedRow}>
                    <AppText variant="body2" numberOfLines={1} style={styles.plannedName}>{p.name}</AppText>
                    <AppText variant="subtle" style={styles.plannedKcal}>{p.calories} kcal</AppText>
                    <Pressable
                      onPress={() => eatPlanned(p)}
                      hitSlop={6}
                      style={({ pressed }) => [styles.eatBtn, pressed && styles.rowPressed]}
                    >
                      <Ionicons name="checkmark" size={14} color={theme.colors.accent} />
                      <AppText style={styles.eatBtnText}>Eat</AppText>
                    </Pressable>
                    <Pressable onPress={() => removePlanned(p)} hitSlop={8} style={({ pressed }) => pressed && styles.pressedDim}>
                      <Ionicons name="close" size={16} color={theme.colors.subtle} />
                    </Pressable>
                  </View>
                ))}

                {/* Empty only when there is nothing at all in this slot;
                    while fetching, pulse a skeleton instead of flashing "No meals logged" */}
                {typeMeals.length === 0 && plannedForType.length === 0 && (
                  isLoading
                    ? <Skeleton width="55%" height={14} />
                    : <AppText variant="subtle" style={styles.emptyText}>No meals logged</AppText>
                )}

                {/* Slim macro split bar (percent details live in the summary card above) */}
                {totalMacroG > 0 && (
                  <View style={styles.splitBar}>
                    {carbPct > 0 && <View style={{ flex: carbPct, backgroundColor: theme.colors.accent }} />}
                    {fatPct > 0 && <View style={{ flex: fatPct, backgroundColor: theme.colors.indigo }} />}
                    {proteinPct > 0 && <View style={{ flex: proteinPct, backgroundColor: theme.colors.accent2 }} />}
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Activity — section header outside (same rhythm as Diary), Log as header link */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">Activity</AppText>
            {isToday && (
              <Pressable onPress={() => router.push("/exercise/log-workout" as any)} hitSlop={10}>
                <AppText variant="subtle" style={styles.sectionLink}>Log workout</AppText>
              </Pressable>
            )}
          </View>

          <Card style={styles.mealCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.iconBox, styles.flameBox]}>
                <Ionicons name="flame" size={18} color={theme.colors.accent2} />
              </View>
              <AppText variant="body2" style={styles.burnedText}>
                {totalBurned > 0 ? `${totalBurned} kcal burned` : "No workout logged"}
              </AppText>
            </View>

            {/* Net calories: eaten − burned */}
            {totalBurned > 0 && (
              <View style={styles.netRow}>
                <AppText variant="subtle" style={styles.smallLabel}>Net calories (eaten − burned)</AppText>
                <AppText style={styles.netVal}>{(eaten - totalBurned).toLocaleString()} kcal</AppText>
              </View>
            )}

            {/* Logged workouts — soft inset rows, same language as the Diary */}
            {exercises.map((ex) => (
              <View key={ex.id} style={styles.workoutRow}>
                <View style={styles.flex1}>
                  <AppText variant="body2" numberOfLines={1} style={styles.mealName}>{ex.name}</AppText>
                  <AppText variant="subtle" style={styles.workoutMeta}>{ex.durationMin} min · {ex.caloriesBurned} kcal</AppText>
                </View>
                {isToday && (
                  <Pressable onPress={() => onDeleteExercise(ex)} hitSlop={6} style={({ pressed }) => pressed && styles.pressedDim}>
                    <Ionicons name="trash-outline" size={16} color={theme.colors.subtle} />
                  </Pressable>
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* For you — weekly plan status card + "Ăn gì bây giờ?" card in one section */}
        {isToday && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="h2">{vi ? "Dành cho bạn" : "For you"}</AppText>
              <Pressable onPress={() => router.push("/plan/weekly" as any)} hitSlop={10}>
                <AppText variant="subtle" style={styles.sectionLink}>{vi ? "Xem tuần" : "View week"}</AppText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/plan/weekly" as any)}
              style={({ pressed }) => pressed && styles.pressedFaint}
            >
              <Card style={styles.mealCard}>
                <View style={styles.planHeader}>
                  <View style={[styles.iconBox, styles.planIconBox]}>
                    <Ionicons name="calendar" size={18} color={theme.colors.indigo} />
                  </View>
                  {/* Title + gray status line (same layout as the suggest card below) */}
                  <View style={styles.planTitleBlock}>
                    <AppText variant="h2" style={styles.cardTitleText}>
                      {vi ? "Kế hoạch tuần" : "Weekly plan"}
                    </AppText>
                    <AppText variant="subtle" numberOfLines={1} style={styles.smallLabel}>
                      {(() => {
                        const pending = planToday.filter((p) => !p.done);
                        return planToday.length === 0
                          ? (vi ? "Chưa có kế hoạch — để AI tạo cho bạn ✨" : "No plan yet — let the AI build one ✨")
                          : pending.length === 0
                          ? (vi ? "Hoàn thành kế hoạch hôm nay 🎉" : "Today's plan is all done 🎉")
                          : (vi ? `${pending.length} món đang chờ trong nhật ký` : `${pending.length} planned meals waiting in your diary`);
                      })()}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
                </View>

                {!!planWorkout && (
                  <View style={styles.workoutTip}>
                    <AppText style={styles.tipEmoji}>🏃</AppText>
                    <AppText variant="subtle" style={styles.tipText}>{planWorkout}</AppText>
                  </View>
                )}
              </Card>
            </Pressable>

            {/* "Ăn gì bây giờ?" — extracted to src/features/plan/SuggestMealCard */}
            <SuggestMealCard planToday={planToday} />
          </View>
        )}

        {/* AI Coach — flagship entry */}
        {isToday && (
          <Pressable
            onPress={() => router.push("/tabs/coach" as any)}
            style={({ pressed }) => pressed && styles.pressedScale}
          >
            <Card style={styles.coachCard}>
              <View style={styles.planHeader}>
                <View style={styles.coachIcon}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View style={styles.planTitleBlock}>
                  <View style={styles.coachTitleRow}>
                    <AppText variant="h2" style={styles.cardTitleText}>AI Coach</AppText>
                    {coachInsight && (
                      <View style={styles.scoreChip}>
                        <AppText style={styles.scoreVal}>{coachInsight.score}</AppText>
                        <AppText style={styles.scoreMax}>/100</AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="muted" style={styles.coachSummary}>
                    {coachInsight?.summary || "Get personalized analysis and ask anything about your nutrition."}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
              </View>

              {/* Top warning, if any */}
              {coachInsight && coachInsight.warnings.length > 0 && (
                <View style={styles.warnRow}>
                  <Ionicons name="warning-outline" size={15} color={theme.colors.danger} />
                  <AppText style={styles.warnText}>{coachInsight.warnings[0]}</AppText>
                </View>
              )}
            </Card>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 0 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: 40,
    gap: theme.space.lg,
  },

  // Shared bits
  flex1: { flex: 1 },
  pressedDim: { opacity: 0.5 },
  pressedFaint: { opacity: 0.9 },
  pressedScale: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  smallLabel: { fontSize: 12 },
  divider: { height: 1, backgroundColor: theme.colors.border },
  baselineRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  baselineRowTight: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitleText: { fontSize: 15 },

  // Header + week navigator
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  weekNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  navBtn: { padding: 4 },
  navBtnDisabled: { opacity: 0.25 },
  weekLabel: { fontWeight: "700", color: theme.colors.text },
  weekLabelCurrent: { color: theme.colors.primary },

  // Week day chips
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 42, paddingVertical: 9, borderRadius: 14,
    alignItems: "center", gap: 5,
    backgroundColor: theme.colors.surface,
  },
  dayChipLogged: { backgroundColor: "rgba(8,145,178,0.10)" },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 4,
  },
  dayChipFuture: { opacity: 0.35 },
  dayChipPressed: { transform: [{ scale: 0.94 }] },
  dayLabel: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  dayLabelSelected: { color: "rgba(255,255,255,0.8)" },
  dayNum: { fontSize: 14, fontWeight: "800", color: theme.colors.muted },
  dayNumLogged: { color: theme.colors.primary },
  dayNumSelected: { color: "#fff" },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  dayDotLogged: { backgroundColor: theme.colors.accent },
  dayDotSelected: { backgroundColor: "rgba(255,255,255,0.9)" },

  // Today summary card
  summaryCard: { padding: theme.space.xl, gap: theme.space.lg, ...shadow(2) },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eatenBlock: { gap: 10, flex: 1 },
  eatenNumBlock: { gap: 2 },
  kcalBig: { fontSize: 34, color: theme.colors.text },
  kcalGoal: { fontSize: 13 },
  statusChip: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(5,150,105,0.12)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
  },
  statusChipOver: { backgroundColor: "rgba(229,72,77,0.10)" },
  statusChipText: { fontSize: 13, fontWeight: "700", color: theme.colors.accent },
  statusChipTextOver: { color: theme.colors.danger },
  macroRow: { flexDirection: "row", gap: 12 },
  macroCol: { flex: 1, alignItems: "center", gap: 6, paddingHorizontal: 4 },
  macroLabel: { fontSize: 11 },
  macroVal: { fontSize: 15 },
  macroUnit: { fontSize: 10 },
  macroTrack: { height: 6, width: "80%", borderRadius: 99, backgroundColor: "rgba(22,78,99,0.08)", overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: 99 },

  // Sections
  section: { gap: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionLink: { fontSize: 13, color: theme.colors.primary },

  // Diary meal cards
  mealCard: { padding: theme.space.lg, gap: 10 },
  mealCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealCardTitle: { flexDirection: "row", alignItems: "center", gap: 10 },
  mealCardRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeKcal: { fontSize: 14, fontWeight: "800", color: theme.colors.text },
  typeKcalUnit: { fontSize: 11 },
  addBtn: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(8,145,178,0.10)",
  },
  addBtnPressed: { backgroundColor: theme.colors.tint },
  mealRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    // Soft inset row instead of a hard border (Soft UI Evolution)
    backgroundColor: theme.colors.bg,
  },
  rowPressed: { backgroundColor: theme.colors.tint },
  mealName: { flex: 1, fontSize: 13, fontWeight: "600" },
  mealKcal: { fontSize: 12 },
  plannedRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  plannedName: { flex: 1, fontSize: 13, color: theme.colors.muted },
  plannedKcal: { fontSize: 11 },
  eatBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(5,150,105,0.10)",
  },
  eatBtnText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  emptyText: { fontSize: 12 },
  splitBar: { flexDirection: "row", height: 3, borderRadius: 99, overflow: "hidden", gap: 1 },

  // Activity
  activityHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  flameBox: { backgroundColor: "rgba(255,138,61,0.12)" },
  burnedText: { fontWeight: "700" },
  netRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(8,145,178,0.05)", borderRadius: 12, padding: theme.space.md,
  },
  netVal: { fontSize: 15, fontWeight: "800", color: theme.colors.text },
  workoutRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: theme.colors.bg,
  },
  workoutMeta: { fontSize: 11 },

  // For you (weekly plan card)
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconBox: { backgroundColor: "rgba(99,102,241,0.12)" },
  planTitleBlock: { flex: 1, gap: 2 },
  workoutTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(255,138,61,0.08)", borderRadius: 10, padding: 8,
  },
  tipEmoji: { fontSize: 13 },
  tipText: { flex: 1, fontSize: 12 },

  // AI Coach card
  coachCard: {
    padding: theme.space.lg,
    borderColor: "rgba(8,145,178,0.20)",
    backgroundColor: "rgba(8,145,178,0.05)",
  },
  coachIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  coachTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(8,145,178,0.10)",
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
  },
  scoreVal: { fontSize: 11, fontWeight: "800", color: theme.colors.primary },
  scoreMax: { fontSize: 10, color: theme.colors.primary },
  coachSummary: { fontSize: 13 },
  warnRow: {
    flexDirection: "row", gap: 6, alignItems: "flex-start", marginTop: 10,
    backgroundColor: "rgba(229,72,77,0.08)", borderRadius: 10, padding: 10,
  },
  warnText: { fontSize: 12, color: theme.colors.danger, flex: 1 },
});
