// MEAL PLAN — weekly planner. Flow/state lives here; the generate + grocery
// modals are in src/features/plan.
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  getPlanMeals,
  deletePlanMeal,
  markPlanEaten,
  generateWeekPlan,
  getGroceryList,
  getCachedGrocery,
  cacheGrocery,
  getCachedPlanWeek,
  cachePlanWeek,
  type PlanMeal,
  type GroceryGroup,
} from "@/features/plan/api";
import { GenerateModal } from "@/features/plan/GenerateModal";
import { GroceryModal } from "@/features/plan/GroceryModal";
import { resolveLanguage } from "@/utils/language";
import { theme } from "@/ui/theme";
import { MEAL_TYPE_META } from "@/ui/mealTypes";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { dateKey } from "@/utils/date";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Monday of the week containing `base`, shifted by `weekOffset` weeks
function mondayOf(base: Date, weekOffset: number) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - ((dow + 6) % 7) + weekOffset * 7);
  return d;
}

export default function MealPlanScreen() {
  const router = useRouter();
  const { token, user, updateProfile } = useAuth();
  const lang = resolveLanguage(user?.language);
  const L = lang === "vi"
    ? {
        generate: "✨ Tạo kế hoạch tuần bằng AI", generating: "AI đang lên kế hoạch...",
        pastWeek: "Tuần này đã qua rồi, chuyển sang tuần hiện tại hoặc tuần sau nhé.",
        redoDay: "Làm lại ngày này",
        confirmTitle: "Bạn có chắc không?",
        confirmWeekMsg: "Các món đang có từ hôm nay tới cuối tuần sẽ bị THAY bằng kế hoạch mới.",
        confirmDayMsg: "Toàn bộ món của ngày này sẽ bị THAY bằng thực đơn mới.",
        continue: "Tiếp tục", cancel: "Huỷ",
        grocery: "🛒 Danh sách đi chợ", groceryLoading: "AI đang tổng hợp nguyên liệu...",
        quota: "Hôm nay hết lượt AI miễn phí, thử lại sau nhé.", genErr: "Chưa tạo được kế hoạch, thử lại nhé.",
        groceryErr: "Chưa tạo được danh sách, thử lại nhé.", error: "Lỗi",
        pastDay: "Ngày này đã qua — chỉ xem lại thôi nhé.",
        emptyHint: "Chưa có món nào cho ngày này — bấm nút ✨ bên dưới để AI lên thực đơn nhé.",
      }
    : {
        generate: "✨ Generate my week with AI", generating: "AI is planning your week...",
        pastWeek: "This week is already over — switch to the current or next week.",
        redoDay: "Regenerate this day",
        confirmTitle: "Are you sure?",
        confirmWeekMsg: "Meals from today to the end of the week will be REPLACED by the new plan.",
        confirmDayMsg: "All meals on this day will be REPLACED by a new menu.",
        continue: "Continue", cancel: "Cancel",
        grocery: "🛒 Grocery list", groceryLoading: "AI is building your list...",
        quota: "Out of free AI quota today — try again later.", genErr: "Couldn't generate the plan. Please try again.",
        groceryErr: "Couldn't build the list. Please try again.", error: "Error",
        pastDay: "This day is over — view only.",
        emptyHint: "Nothing planned for this day — tap the ✨ button below to let the AI build a menu.",
      };

  const todayKey = dateKey(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [plan, setPlan] = useState<PlanMeal[]>([]);
  const [workouts, setWorkouts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  // Generate modal (week or single day) + optional taste note.
  // Note prefills from the profile's saved preferences; "remember" writes it back
  // so EVERY AI feature (suggest, coach, next generations) knows the user's taste.
  const [genVisible, setGenVisible] = useState(false);
  const [genScope, setGenScope] = useState<"week" | "day">("week");
  const [note, setNote] = useState("");
  const [rememberTaste, setRememberTaste] = useState(true);
  // AI grocery list + per-item ticks (persisted per week, see plan api cache)
  const [grocery, setGrocery] = useState<GroceryGroup[] | null>(null);
  const [groceryChecked, setGroceryChecked] = useState<Record<string, boolean>>({});
  const [groceryVisible, setGroceryVisible] = useState(false);
  const [groceryLoading, setGroceryLoading] = useState(false);
  // Signature of the loaded plan — grocery cache is only valid while this matches
  const planSigRef = useRef("");

  const goal = user?.calorieGoal ?? 2000;

  // 7 days (Mon→Sun) of the currently viewed week
  const weekDays = useMemo(() => {
    const monday = mondayOf(new Date(), weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekStart = dateKey(weekDays[0]);
  const weekEnd = dateKey(weekDays[6]);

  const load = useCallback(async () => {
    if (!token) return;
    // Stale-while-revalidate: paint the cached week INSTANTLY (no spinner),
    // then refresh from the network in the background.
    const cached = await getCachedPlanWeek(weekStart);
    if (cached) {
      setPlan(cached.meals);
      setWorkouts(cached.workouts);
      // Seed the signature so a fresh-but-identical fetch doesn't nuke grocery state
      if (!planSigRef.current) {
        planSigRef.current = cached.meals.map((m) => m.id).sort().join(",");
      }
    } else {
      setLoading(true);
    }
    try {
      const { meals, workouts } = await getPlanMeals(token, weekStart, weekEnd);
      setPlan(meals);
      setWorkouts(workouts);
      cachePlanWeek(weekStart, { meals, workouts });
      // Drop the grocery list ONLY when the plan actually changed — a plain focus
      // reload must not throw away a list that cost an AI request.
      const sig = meals.map((m) => m.id).sort().join(",");
      if (sig !== planSigRef.current) {
        planSigRef.current = sig;
        setGrocery(null);
        setGroceryChecked({});
      }
    } catch {
      // Offline/failed refresh: keep showing the cached week if we had one
      if (!cached) {
        setPlan([]);
        setWorkouts({});
      }
    } finally {
      setLoading(false);
    }
  }, [token, weekStart, weekEnd]);

  // Switching weeks moves the selected day too — keeping the old selection would
  // point at a date that isn't on the visible strip (nothing looks selected).
  const changeWeek = (delta: number) => {
    const next = weekOffset + delta;
    setWeekOffset(next);
    setSelectedDate(next === 0 ? todayKey : dateKey(mondayOf(new Date(), next)));
  };

  // The AI never plans the past: week scope starts at max(weekStart, today).
  // (YYYY-MM-DD strings compare correctly.)
  const genRange = (scope: "week" | "day"): [string, string] | null => {
    if (scope === "day") {
      return selectedDate >= todayKey ? [selectedDate, selectedDate] : null;
    }
    if (weekEnd < todayKey) return null; // entirely past week
    return [weekStart > todayKey ? weekStart : todayKey, weekEnd];
  };

  const openGenerate = (scope: "week" | "day") => {
    if (generating) return;
    const range = genRange(scope);
    if (!range) {
      Alert.alert(L.error, L.pastWeek);
      return;
    }
    const show = () => {
      setGenScope(scope);
      // Prefill with the profile's saved taste preferences (only when empty)
      setNote((n) => n.trim() ? n : (user?.tastePreferences || ""));
      setGenVisible(true);
    };
    // Regenerating over existing meals is destructive → explicit confirmation first
    const hasMeals = plan.some((p) => p.date >= range[0] && p.date <= range[1]);
    if (hasMeals) {
      Alert.alert(L.confirmTitle, scope === "day" ? L.confirmDayMsg : L.confirmWeekMsg, [
        { text: L.cancel, style: "cancel" },
        { text: L.continue, style: "destructive", onPress: show },
      ]);
    } else {
      show();
    }
  };

  const runGenerate = async () => {
    const range = genRange(genScope);
    if (!token || generating || !range) return;
    setGenVisible(false);
    setGenerating(true);
    // Remember taste in the profile (best-effort, fire-and-forget) so the
    // suggest button and the coach respect it too — user types it once.
    const taste = note.trim();
    if (rememberTaste && taste && taste !== (user?.tastePreferences || "")) {
      updateProfile({ tastePreferences: taste }).catch(() => {});
    }
    try {
      await generateWeekPlan(token, range[0], range[1], lang, taste || undefined);
      await load();
    } catch (e: any) {
      const quota = /quota/i.test(String(e?.message || ""));
      Alert.alert(L.error, quota ? L.quota : L.genErr);
    } finally {
      setGenerating(false);
    }
  };

  // AI grocery list for the planned meals (today → end of viewed week).
  // In-memory → AsyncStorage (survives leaving the screen) → only then Gemini.
  const openGrocery = async () => {
    if (groceryLoading || !token) return;
    if (grocery) { setGroceryVisible(true); return; } // reuse until the plan changes
    const cached = await getCachedGrocery(weekStart, lang);
    if (cached && cached.sig === planSigRef.current) {
      setGrocery(cached.groups);
      setGroceryChecked(cached.checked || {});
      setGroceryVisible(true);
      return;
    }
    const start = weekStart > todayKey ? weekStart : todayKey;
    setGroceryLoading(true);
    try {
      const groups = await getGroceryList(token, start, weekEnd, lang);
      setGrocery(groups);
      setGroceryChecked({});
      cacheGrocery(weekStart, lang, { groups, checked: {}, sig: planSigRef.current });
      setGroceryVisible(true);
    } catch (e: any) {
      const quota = /quota/i.test(String(e?.message || ""));
      Alert.alert(L.error, quota ? L.quota : L.groceryErr);
    } finally {
      setGroceryLoading(false);
    }
  };

  // Tick/untick a grocery item — persisted with the list so it survives reopening
  const toggleGroceryItem = (key: string) => {
    setGroceryChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      cacheGrocery(weekStart, lang, { groups: grocery || [], checked: next, sig: planSigRef.current });
      return next;
    });
  };

  // Reload on focus (e.g. returning from add screen) and whenever the week changes
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Planned meals for the selected day
  const dayPlan = useMemo(() => plan.filter((p) => p.date === selectedDate), [plan, selectedDate]);

  const dayTotals = useMemo(
    () =>
      dayPlan.reduce(
        (acc, p) => {
          acc.calories += p.calories;
          acc.protein += p.protein;
          acc.carbs += p.carbs;
          acc.fat += p.fat;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayPlan]
  );

  // Count of planned items per day, to show a dot on the week strip
  const plannedDays = useMemo(() => {
    const set = new Set(plan.map((p) => p.date));
    return set;
  }, [plan]);

  const onMarkEaten = async (item: PlanMeal) => {
    if (!token) return;
    // Optimistic flip
    setPlan((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: true } : p)));
    try {
      await markPlanEaten(token, item.id);
    } catch (e: any) {
      // revert on failure
      setPlan((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: false } : p)));
      Alert.alert("Couldn't log meal", e.message || "Please try again.");
    }
  };

  const onDelete = (item: PlanMeal) => {
    Alert.alert("Remove from plan?", `Delete "${item.name}" from this day's plan.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setPlan((prev) => prev.filter((p) => p.id !== item.id));
          try {
            await deletePlanMeal(token, item.id);
          } catch {
            load(); // resync if the delete failed
          }
        },
      },
    ]);
  };

  // Tap the 💬 on a dish → jump to the Coach tab with a ready-made cooking question
  const askCoach = (item: PlanMeal) =>
    router.push({
      pathname: "/tabs/coach" as any,
      params: {
        ask: lang === "vi"
          ? `Hướng dẫn mình cách làm "${item.name}" tốt cho sức khoẻ nhé`
          : `How do I cook "${item.name}" in a healthy way?`,
        askId: String(Date.now()), // unique per tap — consumed once on the Coach tab
      },
    });

  // Past days are read-only: adding/eating a plan for yesterday makes no sense
  // (Eat would even log the meal into TODAY's diary). Delete stays available.
  const isPast = selectedDate < todayKey;

  const selectedLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Screen padded={false}>
      {/* Fixed header — stays visible while the list scrolls */}
      <View style={styles.headerWrap}>
        <ScreenHeader title="Meal Plan" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Week navigator */}
        <View style={styles.weekNav}>
          <Pressable
            onPress={() => changeWeek(-1)}
            hitSlop={10}
            style={({ pressed }) => [styles.navBtn, pressed && styles.dim]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.subtle} />
          </Pressable>
          <AppText variant="body2" style={styles.weekLabel}>
            {weekOffset === 0
              ? "This week"
              : weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
                " – " +
                weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </AppText>
          <Pressable
            onPress={() => changeWeek(1)}
            hitSlop={10}
            style={({ pressed }) => [styles.navBtn, pressed && styles.dim]}
          >
            <Ionicons name="chevron-forward" size={22} color={theme.colors.subtle} />
          </Pressable>
        </View>

        {/* 7-day strip */}
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const key = dateKey(d);
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const hasPlan = plannedDays.has(key);
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => [
                  styles.dayChip,
                  hasPlan && styles.dayChipPlanned,
                  isSelected && styles.dayChipSelected,
                  pressed && styles.dayChipPressed,
                ]}
              >
                <AppText style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {dayLabels[i]}
                </AppText>
                <AppText style={[styles.dayNum, isToday && styles.dayNumToday, isSelected && styles.dayNumSelected]}>
                  {d.getDate()}
                </AppText>
                <View style={[styles.dayDot, hasPlan && styles.dayDotPlanned, isSelected && styles.dayDotSelected]} />
              </Pressable>
            );
          })}
        </View>

        {/* Day total card */}
        <Card style={styles.totalCard}>
          {/* flex-start: the redo button sits level with the date line, clear of the big number */}
          <View style={styles.totalHead}>
            <View style={styles.totalBlock}>
              <AppText variant="subtle" style={styles.smallLabel}>{selectedLabel}</AppText>
              <View style={styles.baselineRow}>
                <AppText variant="h0" style={styles.totalKcal}>{dayTotals.calories.toLocaleString()}</AppText>
                <AppText variant="muted" style={styles.totalGoal}>/ {goal.toLocaleString()} kcal planned</AppText>
              </View>
            </View>
            {/* Regenerate just this day (today or future only) */}
            {selectedDate >= todayKey && dayPlan.length > 0 && (
              <Pressable
                onPress={() => openGenerate("day")}
                disabled={generating}
                hitSlop={8}
                style={({ pressed }) => [styles.redoBtn, pressed && styles.redoBtnPressed]}
              >
                {/* Fixed 14px box so the spinner doesn't grow the button */}
                <View style={styles.redoIconBox}>
                  {generating && genScope === "day" ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.redoSpinner} />
                  ) : (
                    <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                  )}
                </View>
                <AppText style={styles.redoText}>{L.redoDay}</AppText>
              </Pressable>
            )}
          </View>
          <View style={styles.macroStrip}>
            <AppText variant="subtle" style={styles.smallLabel}>P {Math.round(dayTotals.protein)}g</AppText>
            <AppText variant="subtle" style={styles.smallLabel}>C {Math.round(dayTotals.carbs)}g</AppText>
            <AppText variant="subtle" style={styles.smallLabel}>F {Math.round(dayTotals.fat)}g</AppText>
          </View>
          {/* AI workout suggestion for the selected day */}
          {!!workouts[selectedDate] && (
            <View style={styles.workoutTip}>
              <AppText style={styles.tipEmoji}>🏃</AppText>
              <AppText variant="body2" style={styles.tipText}>{workouts[selectedDate]}</AppText>
            </View>
          )}
        </Card>

        {loading && dayPlan.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
          {/* Time-aware hints: empty future/today day → point at the AI button; past day → view only */}
          {dayPlan.length === 0 && (
            <View style={styles.hintBox}>
              <Ionicons name={isPast ? "time-outline" : "sparkles"} size={15} color={theme.colors.primary} style={styles.hintIcon} />
              <AppText variant="subtle" style={styles.hintText}>
                {isPast ? L.pastDay : L.emptyHint}
              </AppText>
            </View>
          )}
          {MEAL_TYPE_META.map((mt) => {
            const items = dayPlan.filter((p) => p.mealType === mt.key);
            return (
              <View key={mt.key} style={styles.mealSection}>
                <View style={styles.mealSectionHead}>
                  <Ionicons name={mt.icon as any} size={16} color={mt.color} />
                  <AppText variant="h2" style={styles.mealSectionTitle}>{mt.label}</AppText>
                </View>

                {items.length === 0 ? (
                  <AppText variant="subtle" style={styles.nothingText}>Nothing planned</AppText>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} style={[styles.dishCard, item.done && styles.dishCardDone]}>
                      <View style={styles.dishRow}>
                        <View style={styles.flex1}>
                          <AppText variant="body2" style={[styles.dishName, item.done && styles.dishNameDone]}>
                            {item.name}
                          </AppText>
                          <AppText variant="subtle" style={styles.dishMacros}>
                            {item.calories} kcal · P {item.protein} · C {item.carbs} · F {item.fat}
                          </AppText>
                        </View>

                        {item.done ? (
                          <View style={styles.eatenChip}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                            <AppText style={styles.eatenText}>Eaten</AppText>
                          </View>
                        ) : !isPast ? (
                          <Pressable
                            onPress={() => onMarkEaten(item)}
                            hitSlop={6}
                            style={({ pressed }) => [styles.eatBtn, pressed && styles.eatBtnPressed]}
                          >
                            <Ionicons name="checkmark" size={15} color={theme.colors.accent} />
                            <AppText style={styles.eatenText}>Eat</AppText>
                          </Pressable>
                        ) : null}

                        {/* Ask the Coach how to cook this dish */}
                        <Pressable onPress={() => askCoach(item)} hitSlop={10} style={({ pressed }) => pressed && styles.dim}>
                          <Ionicons name="chatbubble-ellipses-outline" size={17} color={theme.colors.primary} />
                        </Pressable>

                        <Pressable onPress={() => onDelete(item)} hitSlop={10} style={({ pressed }) => pressed && styles.dim}>
                          <Ionicons name="trash-outline" size={18} color={theme.colors.subtle} />
                        </Pressable>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            );
          })}
          </>
        )}

        {/* AI actions — kept at the bottom so the calendar stays front and center */}
        <View style={styles.aiActions}>
          <Pressable
            onPress={() => openGenerate("week")}
            disabled={generating}
            style={({ pressed }) => [
              styles.generateBtn,
              generating ? styles.generateBtnDisabled : pressed && styles.generateBtnPressed,
            ]}
          >
            {/* Loading here only when the WEEK is being generated (day regen has its own spinner) */}
            {generating && genScope === "week" && <ActivityIndicator color="#fff" size="small" />}
            <AppText style={styles.generateText}>
              {generating && genScope === "week" ? L.generating : L.generate}
            </AppText>
          </Pressable>

          {plan.length > 0 && (
            <Pressable
              onPress={openGrocery}
              disabled={groceryLoading}
              style={({ pressed }) => [styles.groceryBtn, pressed && styles.groceryBtnPressed]}
            >
              {groceryLoading && <ActivityIndicator color={theme.colors.primary} size="small" />}
              <AppText style={styles.groceryText}>
                {groceryLoading ? L.groceryLoading : L.grocery}
              </AppText>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Modals — components in src/features/plan */}
      <GenerateModal
        visible={genVisible}
        scope={genScope}
        note={note}
        onChangeNote={setNote}
        remember={rememberTaste}
        onToggleRemember={() => setRememberTaste((v) => !v)}
        onCancel={() => setGenVisible(false)}
        onStart={runGenerate}
        lang={lang}
      />
      <GroceryModal
        visible={groceryVisible}
        groups={grocery}
        checked={groceryChecked}
        onToggle={toggleGroceryItem}
        onClose={() => setGroceryVisible(false)}
        lang={lang}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.5 },
  smallLabel: { fontSize: 12 },
  baselineRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },

  headerWrap: { paddingHorizontal: theme.space.lg, paddingTop: 60 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: 40,
    gap: theme.space.lg,
  },

  // Week navigator + day strip
  weekNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navBtn: { padding: 4 },
  weekLabel: { fontWeight: "700" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 42, paddingVertical: 9, borderRadius: 16,
    alignItems: "center", gap: 5,
    backgroundColor: theme.colors.surface,
  },
  dayChipPlanned: { backgroundColor: "rgba(8,145,178,0.10)" },
  dayChipSelected: { backgroundColor: theme.colors.primary },
  dayChipPressed: { transform: [{ scale: 0.94 }] },
  dayLabel: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  dayLabelSelected: { color: "rgba(255,255,255,0.8)" },
  dayNum: { fontSize: 14, fontWeight: "800", color: theme.colors.muted },
  dayNumToday: { color: theme.colors.primary },
  dayNumSelected: { color: "#fff" },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  dayDotPlanned: { backgroundColor: theme.colors.accent },
  dayDotSelected: { backgroundColor: "rgba(255,255,255,0.9)" },

  // Day total card
  totalCard: { padding: theme.space.lg },
  totalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  totalBlock: { gap: 2 },
  totalKcal: { fontSize: 28, color: theme.colors.text },
  totalGoal: { fontSize: 13 },
  redoBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
    backgroundColor: "rgba(8,145,178,0.08)",
  },
  redoBtnPressed: { backgroundColor: theme.colors.tint },
  redoIconBox: { width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  redoSpinner: { transform: [{ scale: 0.7 }] },
  redoText: { fontSize: 11, fontWeight: "700", color: theme.colors.primary },
  macroStrip: { flexDirection: "row", gap: 14, marginTop: 10 },
  workoutTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 10,
    backgroundColor: "rgba(255,138,61,0.08)", borderRadius: 10, padding: 10,
  },
  tipEmoji: { fontSize: 14 },
  tipText: { flex: 1, fontSize: 13 },

  // Day content
  loadingWrap: { paddingVertical: theme.space.xl, alignItems: "center" },
  hintBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(8,145,178,0.05)", borderRadius: 12, padding: theme.space.md,
  },
  hintIcon: { marginTop: 1 },
  hintText: { flex: 1, fontSize: 12 },
  mealSection: { gap: 8 },
  mealSectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealSectionTitle: { fontSize: 15 },
  nothingText: { fontSize: 12, paddingLeft: 4 },
  dishCard: { padding: theme.space.md },
  dishCardDone: { opacity: 0.6 },
  dishRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dishName: { fontWeight: "700" },
  dishNameDone: { textDecorationLine: "line-through" },
  dishMacros: { fontSize: 11 },
  eatenChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  eatenText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  eatBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(5,150,105,0.10)",
  },
  eatBtnPressed: { backgroundColor: theme.colors.tint },

  // AI actions
  aiActions: { gap: 10, marginTop: 6 },
  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 14, paddingVertical: 13,
  },
  generateBtnPressed: { backgroundColor: theme.colors.primary2 },
  generateBtnDisabled: { backgroundColor: theme.colors.border },
  generateText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  groceryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    borderRadius: 14, paddingVertical: 11,
  },
  groceryBtnPressed: { backgroundColor: theme.colors.tint },
  groceryText: { color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
});
