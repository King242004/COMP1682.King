// HOME SCREEN
import { useCallback, useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { getExercisesByDate, deleteExercise, type Exercise } from "@/utils/exercise";
import { getPlanMeals, markPlanEaten, deletePlanMeal, type PlanMeal } from "@/utils/plan";
import {
  getInsight, getCachedInsight, cacheInsight, INSIGHT_TTL_MS, type CoachInsight,
  suggestNextMeal, getCachedSuggestions, cacheSuggestions, nextMealSlot, type MealSuggestions,
} from "@/utils/coach";
import { dateKey, weekNumber } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme, macroGoals } from "@/ui/theme";
import { MEAL_TYPE_META, type MealTypeKey } from "@/ui/mealTypes";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { Skeleton } from "@/ui/components/Skeleton";

function getCurrentWeekDays(weekOffset = 0) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from Monday of the week, shifted back `weekOffset` weeks (0 = this week)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
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

  // "Ăn gì bây giờ?" — user-initiated only (each call = 1 Gemini request), cached
  // per (date + meal slot + lang) so re-taps within the same slot are free.
  const [suggest, setSuggest] = useState<MealSuggestions | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const loadSuggestions = async (force = false) => {
    if (!token || suggestLoading) return;
    setSuggestError(null);
    // Slot = hour-based, skipping meals already logged (mirrors backend nextSlotToSuggest)
    const slot = nextMealSlot(new Date().getHours(), new Set(meals.map((m) => m.mealType)));
    if (!force) {
      const cached = await getCachedSuggestions(todayKey, slot, lang);
      if (cached) { setSuggest(cached); return; }
    }
    setSuggestLoading(true);
    try {
      const fresh = await suggestNextMeal(token, lang);
      setSuggest(fresh);
      cacheSuggestions(todayKey, slot, lang, fresh);
    } catch (e: any) {
      setSuggestError(
        e?.message === "QUOTA"
          ? (lang === "vi" ? "Hôm nay hết lượt AI rồi, thử lại sau nhé." : "Out of AI requests for today — try again later.")
          : (lang === "vi" ? "Không lấy được gợi ý, thử lại nhé." : "Couldn't get suggestions. Please try again.")
      );
    } finally {
      setSuggestLoading(false);
    }
  };

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

  // Suggest slot for "Ăn gì bây giờ?": hour-based, skipping meals already logged.
  // Logging a meal moves the slot forward → cache key changes → stale picks vanish.
  const currentSlot = nextMealSlot(new Date().getHours(), new Set(meals.map((m) => m.mealType)));
  useEffect(() => {
    if (!isToday) return;
    getCachedSuggestions(todayKey, currentSlot, lang).then(setSuggest);
  }, [isToday, currentSlot, lang, todayKey]);

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        {/* Header — title left, week navigator right ("Week N" keeps the arrows apart).
            Forward is disabled at the current week: the diary has no future weeks. */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="h1">
            {isToday ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Pressable
              onPress={() => changeWeek(-1)}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.subtle} />
            </Pressable>
            <AppText variant="body2" style={{ fontWeight: "700", color: weekOffset === 0 ? theme.colors.primary : theme.colors.text }}>
              Week {weekNumber(weekDays[0])}
            </AppText>
            <Pressable
              onPress={() => changeWeek(1)}
              disabled={weekOffset === 0}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: weekOffset === 0 ? 0.25 : pressed ? 0.5 : 1, padding: 4 })}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.subtle} />
            </Pressable>
          </View>
        </View>

        {/* Current week row (Mon→Sun) - past/today clickable, future dimmed */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                style={({ pressed }) => ({
                  opacity: isFuture ? 0.35 : 1,
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

        {/* Diary */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <AppText variant="h2">Diary</AppText>
            <Pressable onPress={() => router.push("/meals/history")} hitSlop={10}>
              <AppText variant="subtle" style={{ fontSize: 13, color: theme.colors.primary }}>View all</AppText>
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
              <Card key={mt.key} style={{ padding: theme.space.lg, gap: 10 }}>
                {/* Header: icon + label | tổng kcal + nút thêm món bên phải */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: mt.bg,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name={mt.icon as any} size={18} color={mt.color} />
                    </View>
                    <AppText variant="h2" style={{ fontSize: 15 }}>{mt.label}</AppText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {typeCalories > 0 && (
                      <AppText style={{ fontSize: 14, fontWeight: "800", color: theme.colors.text }}>
                        {typeCalories} <AppText variant="subtle" style={{ fontSize: 11 }}>kcal</AppText>
                      </AppText>
                    )}
                    {/* Quick add — jumps to Add meal with this meal type preselected */}
                    {isToday && (
                      <Pressable
                        onPress={() => router.push({ pathname: "/meals/add", params: { mealType: mt.key } })}
                        hitSlop={8}
                        style={({ pressed }) => ({
                          width: 26, height: 26, borderRadius: 13,
                          alignItems: "center", justifyContent: "center",
                          backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.10)",
                        })}
                      >
                        <Ionicons name="add" size={17} color={theme.colors.primary} />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Eaten meals — each in its own framed row, tap → detail (edit/delete there) */}
                {typeMeals.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push({ pathname: "/meals/detail", params: { id: m.id } })}
                    style={({ pressed }) => ({
                      flexDirection: "row", alignItems: "center", gap: 8,
                      borderWidth: 1, borderColor: theme.colors.border,
                      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
                      backgroundColor: pressed ? theme.colors.tint : "transparent",
                    })}
                  >
                    <AppText variant="body2" numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: "600" }}>
                      {m.name}
                    </AppText>
                    <AppText variant="subtle" style={{ fontSize: 12 }}>{m.calories} kcal</AppText>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.subtle} />
                  </Pressable>
                ))}

                {/* Planned (not yet eaten) — dashed frame: ✓ logs it, ✕ removes it */}
                {plannedForType.map((p) => (
                  <View
                    key={p.id}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 8,
                      borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
                      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
                    }}
                  >
                    <AppText variant="body2" numberOfLines={1} style={{ flex: 1, fontSize: 13, color: theme.colors.muted }}>
                      {p.name}
                    </AppText>
                    <AppText variant="subtle" style={{ fontSize: 11 }}>{p.calories} kcal</AppText>
                    <Pressable
                      onPress={() => eatPlanned(p)}
                      hitSlop={6}
                      style={({ pressed }) => ({
                        flexDirection: "row", alignItems: "center", gap: 3,
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                        backgroundColor: pressed ? theme.colors.tint : "rgba(47,191,113,0.10)",
                      })}
                    >
                      <Ionicons name="checkmark" size={14} color={theme.colors.accent} />
                      <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>Eat</AppText>
                    </Pressable>
                    <Pressable onPress={() => removePlanned(p)} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                      <Ionicons name="close" size={16} color={theme.colors.subtle} />
                    </Pressable>
                  </View>
                ))}

                {/* Empty only when there is nothing at all in this slot;
                    while fetching, pulse a skeleton instead of flashing "No meals logged" */}
                {typeMeals.length === 0 && plannedForType.length === 0 && (
                  isLoading
                    ? <Skeleton width="55%" height={14} />
                    : <AppText variant="subtle" style={{ fontSize: 12 }}>No meals logged</AppText>
                )}

                {/* Slim macro split bar (percent details live in the Macros card above) */}
                {totalMacroG > 0 && (
                  <View style={{ flexDirection: "row", height: 3, borderRadius: 99, overflow: "hidden", gap: 1 }}>
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
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <AppText variant="h2">Activity</AppText>
            {isToday && (
              <Pressable onPress={() => router.push("/exercise/log-workout" as any)} hitSlop={10}>
                <AppText variant="subtle" style={{ fontSize: 13, color: theme.colors.primary }}>Log workout</AppText>
              </Pressable>
            )}
          </View>

          <Card style={{ padding: theme.space.lg, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: "rgba(255,138,61,0.12)",
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name="flame" size={18} color={theme.colors.accent2} />
              </View>
              <AppText variant="body2" style={{ fontWeight: "700" }}>
                {totalBurned > 0 ? `${totalBurned} kcal burned` : "No workout logged"}
              </AppText>
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

            {/* Logged workouts — framed rows, same language as the Diary */}
            {exercises.map((ex) => (
              <View key={ex.id} style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                borderWidth: 1, borderColor: theme.colors.border,
                borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
              }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="body2" numberOfLines={1} style={{ fontWeight: "600", fontSize: 13 }}>{ex.name}</AppText>
                  <AppText variant="subtle" style={{ fontSize: 11 }}>{ex.durationMin} min · {ex.caloriesBurned} kcal</AppText>
                </View>
                {isToday && (
                  <Pressable onPress={() => onDeleteExercise(ex)} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                    <Ionicons name="trash-outline" size={16} color={theme.colors.subtle} />
                  </Pressable>
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Today's plan — weekly plan status card + "Ăn gì bây giờ?" card in one section */}
        {isToday && (() => {
          const pending = planToday.filter((p) => !p.done);
          const vi = lang === "vi";
          const slot = suggest?.mealType || currentSlot;
          const slotVi: Record<string, string> = { breakfast: "bữa sáng", lunch: "bữa trưa", dinner: "bữa tối", snack: "bữa phụ" };
          const slotName = vi ? (slotVi[slot] || slot) : slot;
          // Planned-but-uneaten dish for this slot → suggestions act as swap options
          const plannedForSlot = planToday.find((p) => p.mealType === slot && !p.done);
          return (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <AppText variant="h2">{vi ? "Dành cho bạn" : "For you"}</AppText>
                <Pressable onPress={() => router.push("/plan/weekly" as any)} hitSlop={10}>
                  <AppText variant="subtle" style={{ fontSize: 13, color: theme.colors.primary }}>
                    {vi ? "Xem tuần" : "View week"}
                  </AppText>
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push("/plan/weekly" as any)}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <Card style={{ padding: theme.space.lg, gap: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: "rgba(99,102,241,0.12)",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name="calendar" size={18} color={theme.colors.indigo} />
                    </View>
                    {/* Title + gray status line (same layout as the suggest card below) */}
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="h2" style={{ fontSize: 15 }}>
                        {vi ? "Kế hoạch tuần" : "Weekly plan"}
                      </AppText>
                      <AppText variant="subtle" numberOfLines={1} style={{ fontSize: 12 }}>
                        {planToday.length === 0
                          ? (vi ? "Chưa có kế hoạch — để AI tạo cho bạn ✨" : "No plan yet — let the AI build one ✨")
                          : pending.length === 0
                          ? (vi ? "Hoàn thành kế hoạch hôm nay 🎉" : "Today's plan is all done 🎉")
                          : (vi ? `${pending.length} món đang chờ trong nhật ký` : `${pending.length} planned meals waiting in your diary`)}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
                  </View>

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

              {/* "Ăn gì bây giờ?" — one tap, AI picks 3 dishes for the next meal slot.
                  When the slot already has a planned dish, picks are swap alternatives. */}
              <Card style={{ padding: theme.space.lg, gap: 10 }}>
              {/* Header — tap generates (cache hit = instant, no AI call) */}
              <Pressable
                onPress={() => loadSuggestions()}
                disabled={suggestLoading}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.8 : 1 })}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: 12,
                  backgroundColor: "rgba(47,191,113,0.12)",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="restaurant" size={17} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="h2" style={{ fontSize: 15 }}>
                    {vi ? "Ăn gì bây giờ?" : "What should I eat now?"}
                  </AppText>
                  <AppText variant="subtle" numberOfLines={2} style={{ fontSize: 12 }}>
                    {suggest
                      ? plannedForSlot
                        ? (vi
                            ? `Món thay thế cho ${plannedForSlot.name} · còn ${suggest.remaining.toLocaleString()} kcal`
                            : `Alternatives to ${plannedForSlot.name} · ${suggest.remaining.toLocaleString()} kcal left`)
                        : (vi
                            ? `Gợi ý cho ${slotName} · còn ${suggest.remaining.toLocaleString()} kcal`
                            : `For your ${slotName} · ${suggest.remaining.toLocaleString()} kcal left`)
                      : plannedForSlot
                      ? (vi
                          ? `Kế hoạch ${slotName} có ${plannedForSlot.name} — muốn đổi món khác?`
                          : `${plannedForSlot.name} is planned for ${slotName} — want something else?`)
                      : (vi
                          ? `AI chọn món cho ${slotName} theo calo còn lại`
                          : `AI picks dishes for your ${slotName} from what's left`)}
                  </AppText>
                </View>
                {suggestLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : suggest ? (
                  /* Regenerate — bypasses the cache (costs 1 AI request) */
                  <Pressable onPress={() => loadSuggestions(true)} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                    <Ionicons name="refresh" size={17} color={theme.colors.subtle} />
                  </Pressable>
                ) : (
                  <View style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    backgroundColor: "rgba(47,191,113,0.10)",
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
                  }}>
                    <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
                    <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>
                      {vi ? "Gợi ý" : "Suggest"}
                    </AppText>
                  </View>
                )}
              </Pressable>

              {!!suggestError && (
                <AppText style={{ fontSize: 12, color: theme.colors.danger }}>{suggestError}</AppText>
              )}

              {/* Suggested dishes — "Thêm" opens Add meal with everything prefilled */}
              {suggest?.suggestions.map((s, i) => (
                <View key={`${i}-${s.name}`} style={{
                  borderWidth: 1, borderColor: theme.colors.border,
                  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 4,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <AppText variant="body2" numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: "600" }}>
                      {s.name}
                    </AppText>
                    <AppText variant="subtle" style={{ fontSize: 12 }}>{s.calories} kcal</AppText>
                    <Pressable
                      onPress={() => router.push({
                        pathname: "/meals/add",
                        params: {
                          mealType: suggest.mealType,
                          prefillName: s.name,
                          prefillCalories: String(s.calories),
                          prefillProtein: String(s.protein),
                          prefillCarbs: String(s.carbs),
                          prefillFat: String(s.fat),
                          source: "suggest",
                        },
                      })}
                      hitSlop={6}
                      style={({ pressed }) => ({
                        flexDirection: "row", alignItems: "center", gap: 3,
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                        backgroundColor: pressed ? theme.colors.tint : "rgba(47,191,113,0.10)",
                      })}
                    >
                      <Ionicons name="add" size={14} color={theme.colors.accent} />
                      <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>
                        {vi ? "Thêm" : "Add"}
                      </AppText>
                    </Pressable>
                  </View>
                  {!!s.reason && <AppText variant="subtle" style={{ fontSize: 11 }}>{s.reason}</AppText>}
                </View>
              ))}
              </Card>
            </View>
          );
        })()}

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
