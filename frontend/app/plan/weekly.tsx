// MEAL PLAN — weekly planner
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  getPlanMeals,
  deletePlanMeal,
  markPlanEaten,
  type PlanMeal,
  type MealType,
} from "@/utils/plan";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { dateKey } from "@/utils/date";

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "☀️" },
  { key: "lunch", label: "Lunch", icon: "🌤️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snacks", icon: "🍎" },
];

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
  const { token, user } = useAuth();

  const todayKey = dateKey(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [plan, setPlan] = useState<PlanMeal[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const data = await getPlanMeals(token, weekStart, weekEnd);
      setPlan(data);
    } catch {
      setPlan([]);
    } finally {
      setLoading(false);
    }
  }, [token, weekStart, weekEnd]);

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

  const addToDay = (mealType: MealType) =>
    router.push({ pathname: "/plan/add-meal" as any, params: { date: selectedDate, mealType } });

  const selectedLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: 60,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Meal Plan" />

        {/* Week navigator */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => setWeekOffset((w) => w - 1)}
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
            onPress={() => setWeekOffset((w) => w + 1)}
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
                    ? "rgba(37,99,235,0.10)"
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ gap: 2 }}>
              <AppText variant="subtle" style={{ fontSize: 12 }}>{selectedLabel}</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
                <AppText variant="h0" style={{ fontSize: 28, color: theme.colors.text }}>
                  {dayTotals.calories.toLocaleString()}
                </AppText>
                <AppText variant="muted" style={{ fontSize: 13 }}>/ {goal.toLocaleString()} kcal planned</AppText>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
            <AppText variant="subtle" style={{ fontSize: 12 }}>P {Math.round(dayTotals.protein)}g</AppText>
            <AppText variant="subtle" style={{ fontSize: 12 }}>C {Math.round(dayTotals.carbs)}g</AppText>
            <AppText variant="subtle" style={{ fontSize: 12 }}>F {Math.round(dayTotals.fat)}g</AppText>
          </View>
        </Card>

        {loading && dayPlan.length === 0 ? (
          <View style={{ paddingVertical: theme.space.xl, alignItems: "center" }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          MEAL_TYPES.map((mt) => {
            const items = dayPlan.filter((p) => p.mealType === mt.key);
            return (
              <View key={mt.key} style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <AppText style={{ fontSize: 16 }}>{mt.icon}</AppText>
                    <AppText variant="h2" style={{ fontSize: 15 }}>{mt.label}</AppText>
                  </View>
                  <Pressable
                    onPress={() => addToDay(mt.key)}
                    style={({ pressed }) => ({
                      flexDirection: "row", alignItems: "center", gap: 4,
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                      backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.08)",
                    })}
                  >
                    <Ionicons name="add" size={15} color={theme.colors.primary} />
                    <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>Add</AppText>
                  </Pressable>
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
                        ) : (
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
                        )}

                        <Pressable onPress={() => onDelete(item)} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                          <Ionicons name="trash-outline" size={18} color={theme.colors.subtle} />
                        </Pressable>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
