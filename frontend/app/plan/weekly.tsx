// MEAL PLAN — weekly planner
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, TextInput, View } from "react-native";
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
} from "@/utils/plan";
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
        modalWeekTitle: "Tạo kế hoạch bằng AI", modalDayTitle: "Làm lại thực đơn ngày này",
        modalWeekMsg: "AI sẽ lên thực đơn từ hôm nay tới hết tuần theo mục tiêu và tình trạng của bạn. Món đã có trong khoảng này sẽ bị thay.",
        modalDayMsg: "AI sẽ thay toàn bộ món của ngày này bằng thực đơn mới.",
        notePlaceholder: "Khẩu vị (không bắt buộc): vd không ăn hải sản, thích gà...",
        start: "Tạo ngay", cancel: "Huỷ",
        pastWeek: "Tuần này đã qua rồi, chuyển sang tuần hiện tại hoặc tuần sau nhé.",
        redoDay: "Làm lại ngày này",
        confirmTitle: "Bạn có chắc không?",
        confirmWeekMsg: "Các món đang có từ hôm nay tới cuối tuần sẽ bị THAY bằng kế hoạch mới.",
        confirmDayMsg: "Toàn bộ món của ngày này sẽ bị THAY bằng thực đơn mới.",
        continue: "Tiếp tục",
        grocery: "🛒 Danh sách đi chợ", groceryTitle: "Danh sách đi chợ", groceryLoading: "AI đang tổng hợp nguyên liệu...",
        close: "Đóng",
        quota: "Hôm nay hết lượt AI miễn phí, thử lại sau nhé.", genErr: "Chưa tạo được kế hoạch, thử lại nhé.",
        groceryErr: "Chưa tạo được danh sách, thử lại nhé.", error: "Lỗi",
        pastDay: "Ngày này đã qua — chỉ xem lại thôi nhé.",
        emptyHint: "Chưa có món nào cho ngày này — bấm nút ✨ bên dưới để AI lên thực đơn nhé.",
        rememberTaste: "Ghi nhớ khẩu vị này — gợi ý món và Coach cũng sẽ theo",
      }
    : {
        generate: "✨ Generate my week with AI", generating: "AI is planning your week...",
        modalWeekTitle: "Generate with AI", modalDayTitle: "Regenerate this day",
        modalWeekMsg: "The AI will plan from today to the end of the week based on your goal and conditions. Existing meals in that range will be replaced.",
        modalDayMsg: "The AI will replace all meals on this day with a new menu.",
        notePlaceholder: "Preferences (optional): e.g. no seafood, love chicken...",
        start: "Generate", cancel: "Cancel",
        pastWeek: "This week is already over — switch to the current or next week.",
        redoDay: "Regenerate this day",
        confirmTitle: "Are you sure?",
        confirmWeekMsg: "Meals from today to the end of the week will be REPLACED by the new plan.",
        confirmDayMsg: "All meals on this day will be REPLACED by a new menu.",
        continue: "Continue",
        grocery: "🛒 Grocery list", groceryTitle: "Grocery list", groceryLoading: "AI is building your list...",
        close: "Close",
        quota: "Out of free AI quota today — try again later.", genErr: "Couldn't generate the plan. Please try again.",
        groceryErr: "Couldn't build the list. Please try again.", error: "Error",
        pastDay: "This day is over — view only.",
        emptyHint: "Nothing planned for this day — tap the ✨ button below to let the AI build a menu.",
        rememberTaste: "Remember these preferences — meal suggestions and Coach will follow them too",
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
  // AI grocery list + per-item ticks (persisted per week, see utils/plan cache)
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
      <View style={{ paddingHorizontal: theme.space.lg, paddingTop: 60 }}>
        <ScreenHeader title="Meal Plan" />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* Week navigator */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => changeWeek(-1)}
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.subtle} />
          </Pressable>
          <AppText variant="body2" style={{ fontWeight: "700" }}>
            {weekOffset === 0
              ? "This week"
              : weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
                " – " +
                weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </AppText>
          <Pressable
            onPress={() => changeWeek(1)}
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
          >
            <Ionicons name="chevron-forward" size={22} color={theme.colors.subtle} />
          </Pressable>
        </View>

        {/* 7-day strip */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {weekDays.map((d, i) => {
            const key = dateKey(d);
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const hasPlan = plannedDays.has(key);
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => ({
                  width: 42, paddingVertical: 9, borderRadius: 16, alignItems: "center", gap: 5,
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : hasPlan
                    ? "rgba(8,145,178,0.10)"
                    : theme.colors.surface,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                <AppText style={{
                  fontSize: 10, fontWeight: "700",
                  color: isSelected ? "rgba(255,255,255,0.8)" : theme.colors.subtle,
                }}>
                  {dayLabels[i]}
                </AppText>
                <AppText style={{
                  fontSize: 14, fontWeight: "800",
                  color: isSelected ? "#fff" : isToday ? theme.colors.primary : theme.colors.muted,
                }}>
                  {d.getDate()}
                </AppText>
                <View style={{
                  width: 5, height: 5, borderRadius: 3,
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.9)"
                    : hasPlan ? theme.colors.accent : "transparent",
                }} />
              </Pressable>
            );
          })}
        </View>

        {/* Day total card */}
        <Card style={{ padding: theme.space.lg }}>
          {/* flex-start: the redo button sits level with the date line, clear of the big number */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ gap: 2 }}>
              <AppText variant="subtle" style={{ fontSize: 12 }}>{selectedLabel}</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
                <AppText variant="h0" style={{ fontSize: 28, color: theme.colors.text }}>
                  {dayTotals.calories.toLocaleString()}
                </AppText>
                <AppText variant="muted" style={{ fontSize: 13 }}>/ {goal.toLocaleString()} kcal planned</AppText>
              </View>
            </View>
            {/* Regenerate just this day (today or future only) */}
            {selectedDate >= todayKey && dayPlan.length > 0 && (
              <Pressable
                onPress={() => openGenerate("day")}
                disabled={generating}
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", gap: 5,
                  paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
                  backgroundColor: pressed ? theme.colors.tint : "rgba(8,145,178,0.08)",
                })}
              >
                {/* Fixed 14px box so the spinner doesn't grow the button */}
                <View style={{ width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>
                  {generating && genScope === "day" ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ transform: [{ scale: 0.7 }] }} />
                  ) : (
                    <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                  )}
                </View>
                <AppText style={{ fontSize: 11, fontWeight: "700", color: theme.colors.primary }}>{L.redoDay}</AppText>
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
            <AppText variant="subtle" style={{ fontSize: 12 }}>P {Math.round(dayTotals.protein)}g</AppText>
            <AppText variant="subtle" style={{ fontSize: 12 }}>C {Math.round(dayTotals.carbs)}g</AppText>
            <AppText variant="subtle" style={{ fontSize: 12 }}>F {Math.round(dayTotals.fat)}g</AppText>
          </View>
          {/* AI workout suggestion for the selected day */}
          {!!workouts[selectedDate] && (
            <View style={{
              flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 10,
              backgroundColor: "rgba(255,138,61,0.08)", borderRadius: 10, padding: 10,
            }}>
              <AppText style={{ fontSize: 14 }}>🏃</AppText>
              <AppText variant="body2" style={{ flex: 1, fontSize: 13 }}>{workouts[selectedDate]}</AppText>
            </View>
          )}
        </Card>

        {loading && dayPlan.length === 0 ? (
          <View style={{ paddingVertical: theme.space.xl, alignItems: "center" }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
          {/* Time-aware hints: empty future/today day → point at the AI button; past day → view only */}
          {dayPlan.length === 0 && (
            <View style={{
              flexDirection: "row", alignItems: "flex-start", gap: 8,
              backgroundColor: "rgba(8,145,178,0.05)", borderRadius: 12, padding: theme.space.md,
            }}>
              <Ionicons name={isPast ? "time-outline" : "sparkles"} size={15} color={theme.colors.primary} style={{ marginTop: 1 }} />
              <AppText variant="subtle" style={{ flex: 1, fontSize: 12 }}>
                {isPast ? L.pastDay : L.emptyHint}
              </AppText>
            </View>
          )}
          {MEAL_TYPE_META.map((mt) => {
            const items = dayPlan.filter((p) => p.mealType === mt.key);
            return (
              <View key={mt.key} style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name={mt.icon as any} size={16} color={mt.color} />
                    <AppText variant="h2" style={{ fontSize: 15 }}>{mt.label}</AppText>
                  </View>
                </View>

                {items.length === 0 ? (
                  <AppText variant="subtle" style={{ fontSize: 12, paddingLeft: 4 }}>Nothing planned</AppText>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} style={{ padding: theme.space.md, opacity: item.done ? 0.6 : 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <AppText variant="body2" style={{
                            fontWeight: "700",
                            textDecorationLine: item.done ? "line-through" : "none",
                          }}>
                            {item.name}
                          </AppText>
                          <AppText variant="subtle" style={{ fontSize: 11 }}>
                            {item.calories} kcal · P {item.protein} · C {item.carbs} · F {item.fat}
                          </AppText>
                        </View>

                        {item.done ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                            <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>Eaten</AppText>
                          </View>
                        ) : !isPast ? (
                          <Pressable
                            onPress={() => onMarkEaten(item)}
                            hitSlop={6}
                            style={({ pressed }) => ({
                              flexDirection: "row", alignItems: "center", gap: 4,
                              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                              backgroundColor: pressed ? theme.colors.tint : "rgba(47,191,113,0.10)",
                            })}
                          >
                            <Ionicons name="checkmark" size={15} color={theme.colors.accent} />
                            <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.accent }}>Eat</AppText>
                          </Pressable>
                        ) : null}

                        {/* Ask the Coach how to cook this dish */}
                        <Pressable onPress={() => askCoach(item)} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                          <Ionicons name="chatbubble-ellipses-outline" size={17} color={theme.colors.primary} />
                        </Pressable>

                        <Pressable onPress={() => onDelete(item)} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
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
        <View style={{ gap: 10, marginTop: 6 }}>
          <Pressable
            onPress={() => openGenerate("week")}
            disabled={generating}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              backgroundColor: generating ? theme.colors.border : pressed ? theme.colors.primary2 : theme.colors.primary,
              borderRadius: 14, paddingVertical: 13,
            })}
          >
            {/* Loading here only when the WEEK is being generated (day regen has its own spinner) */}
            {generating && genScope === "week" && <ActivityIndicator color="#fff" size="small" />}
            <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
              {generating && genScope === "week" ? L.generating : L.generate}
            </AppText>
          </Pressable>

          {plan.length > 0 && (
            <Pressable
              onPress={openGrocery}
              disabled={groceryLoading}
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                borderWidth: 1.5, borderColor: theme.colors.primary,
                backgroundColor: pressed ? theme.colors.tint : theme.colors.surface,
                borderRadius: 14, paddingVertical: 11,
              })}
            >
              {groceryLoading && <ActivityIndicator color={theme.colors.primary} size="small" />}
              <AppText style={{ color: theme.colors.primary, fontWeight: "700", fontSize: 13 }}>
                {groceryLoading ? L.groceryLoading : L.grocery}
              </AppText>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Generate modal: scope info + optional taste note */}
      <Modal transparent visible={genVisible} animationType="fade" onRequestClose={() => setGenVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: theme.space.lg }}
          onPress={() => setGenVisible(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: theme.colors.surface, borderRadius: 20, padding: theme.space.xl, gap: 12,
          }}>
            <AppText variant="h2">{genScope === "day" ? L.modalDayTitle : L.modalWeekTitle}</AppText>
            <AppText variant="muted" style={{ fontSize: 13 }}>
              {genScope === "day" ? L.modalDayMsg : L.modalWeekMsg}
            </AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={L.notePlaceholder}
              placeholderTextColor={theme.colors.subtle}
              multiline
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 10, minHeight: 60,
                fontSize: 13, color: theme.colors.text, textAlignVertical: "top",
              }}
            />
            {/* Save the note to the profile so every AI feature shares one taste memory */}
            <Pressable
              onPress={() => setRememberTaste((v) => !v)}
              hitSlop={6}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name={rememberTaste ? "checkbox" : "square-outline"}
                size={19}
                color={rememberTaste ? theme.colors.accent : theme.colors.subtle}
              />
              <AppText variant="subtle" style={{ fontSize: 12, flex: 1 }}>{L.rememberTaste}</AppText>
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setGenVisible(false)}
                style={({ pressed }) => ({
                  flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12,
                  borderWidth: 1.5, borderColor: theme.colors.border,
                  backgroundColor: pressed ? theme.colors.tint : theme.colors.surface,
                })}
              >
                <AppText style={{ fontWeight: "700", color: theme.colors.subtle }}>{L.cancel}</AppText>
              </Pressable>
              <Pressable
                onPress={runGenerate}
                style={({ pressed }) => ({
                  flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12,
                  backgroundColor: pressed ? theme.colors.primary2 : theme.colors.primary,
                })}
              >
                <AppText style={{ fontWeight: "700", color: "#fff" }}>{L.start}</AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Grocery list modal */}
      <Modal transparent visible={groceryVisible} animationType="slide" onRequestClose={() => setGroceryVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: theme.space.xl, maxHeight: "80%", gap: 12,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <AppText variant="h2">{L.groceryTitle}</AppText>
              <Pressable onPress={() => setGroceryVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={theme.colors.subtle} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
              {(grocery || []).map((g) => (
                <View key={g.name} style={{ gap: 6 }}>
                  <AppText style={{ fontSize: 13, fontWeight: "800", color: theme.colors.primary }}>{g.name}</AppText>
                  {g.items.map((it, idx) => {
                    // Tick state keyed by group+item text (stable across reopenings)
                    const key = `${g.name}|${it}`;
                    const checked = !!groceryChecked[key];
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => toggleGroceryItem(key)}
                        style={({ pressed }) => ({
                          flexDirection: "row", alignItems: "center", gap: 10,
                          paddingVertical: 4, opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        <Ionicons
                          name={checked ? "checkbox" : "square-outline"}
                          size={19}
                          color={checked ? theme.colors.accent : theme.colors.subtle}
                        />
                        <AppText
                          variant="body2"
                          style={{
                            flex: 1, fontSize: 13,
                            textDecorationLine: checked ? "line-through" : "none",
                            color: checked ? theme.colors.subtle : theme.colors.text,
                          }}
                        >
                          {it}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
