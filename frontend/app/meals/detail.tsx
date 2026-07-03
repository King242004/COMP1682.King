import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { theme, macroGoals } from "@/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { MEAL_TYPE_BY_KEY } from "@/ui/mealTypes";
import { dateKey } from "@/utils/date";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

function MacroRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHead}>
        <View style={styles.macroLabelWrap}>
          {/* dot color is per-macro, known at runtime */}
          <View style={[styles.macroDot, { backgroundColor: color }]} />
          <AppText variant="body2">{label}</AppText>
        </View>
        <AppText variant="subtle">{Math.round(value)}g / {total}g</AppText>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { meals, historyMeals, deleteMeal } = useMeals();
  // Look in both lists — meal may be opened from today's view OR from history
  const meal = meals.find((m) => m.id === id) || historyMeals.find((m) => m.id === id);
  const goal = user?.calorieGoal ?? 2000;

  if (!meal) {
    return (
      <Screen style={styles.notFound}>
        <AppText variant="muted">Meal not found.</AppText>
        <Button title="Go back" variant="secondary" onPress={() => router.replace("/meals/history")} />
      </Screen>
    );
  }

  // Time rule: `meal.date` is the day the meal was EATEN (source of truth) —
  // createdAt is just when the record was saved. They differ for back-logged
  // meals, so the clock time only makes sense when both fall on the same day.
  const eatenDateLabel = new Date(meal.date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const loggedSameDay = dateKey(new Date(meal.createdAt)) === meal.date;

  const handleDelete = () => {
    Alert.alert(
      "Delete meal",
      `Delete "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMeal(meal.id);
            router.replace("/meals/history");
          },
        },
      ]
    );
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />
        {/* Title — pulled up closer to the Back header */}
        <View style={styles.titleBlock}>
          <AppText variant="h1">{meal.name}</AppText>
          <View style={styles.metaRow}>
            {meal.mealType && (
              <Ionicons
                name={(MEAL_TYPE_BY_KEY[meal.mealType]?.icon ?? "restaurant") as any}
                size={14}
                color={MEAL_TYPE_BY_KEY[meal.mealType]?.color ?? theme.colors.primary}
              />
            )}
            <AppText variant="muted" style={styles.capitalize}>{meal.mealType ?? "Meal"}</AppText>
            <AppText variant="subtle">·</AppText>
            <AppText variant="muted">{eatenDateLabel}</AppText>
            {loggedSameDay && (
              <>
                <AppText variant="subtle">·</AppText>
                <AppText variant="muted">{hhmm(meal.createdAt)}</AppText>
              </>
            )}
          </View>
        </View>

        {/* Calories card with ring */}
        <Card style={styles.kcalCard}>
          <View style={styles.kcalRow}>
            <View style={styles.kcalBlock}>
              <AppText variant="subtle" style={styles.kcalLabel}>Energy Total</AppText>
              <View style={styles.kcalNumRow}>
                <AppText variant="h0" style={styles.kcalNum}>{meal.calories.toLocaleString()}</AppText>
                <AppText variant="muted" style={styles.kcalUnit}>kcal</AppText>
              </View>
            </View>
            <ProgressRing eaten={meal.calories} goal={goal} size={64} stroke={6} />
          </View>
        </Card>

        {/* Macros */}
        <Card style={styles.macroCard}>
          <AppText variant="h2">Macros</AppText>
          {meal.protein || meal.carbs || meal.fat ? (
            <View style={styles.macroList}>
              {meal.protein ? (
                <MacroRow label="Protein" value={meal.protein} total={macroGoals(goal).protein} color={theme.colors.accent2} />
              ) : null}
              {meal.carbs ? (
                <MacroRow label="Carbs" value={meal.carbs} total={macroGoals(goal).carbs} color={theme.colors.accent} />
              ) : null}
              {meal.fat ? (
                <MacroRow label="Fat" value={meal.fat} total={macroGoals(goal).fat} color={theme.colors.indigo} />
              ) : null}
            </View>
          ) : (
            <AppText variant="subtle">No macro data logged for this meal.</AppText>
          )}
        </Card>

        {/* Note — shown only when the meal has one */}
        {!!meal.note?.trim() && (
          <Card style={styles.noteCard}>
            <AppText variant="h2" style={styles.noteTitle}>Note</AppText>
            <AppText variant="muted" style={styles.noteText}>{meal.note}</AppText>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit meal"
            size="lg"
            onPress={() => router.push({ pathname: "/meals/edit", params: { id: meal.id } })}
          />
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          >
            <AppText style={styles.deleteText}>Delete meal</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { justifyContent: "center", alignItems: "center" },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: 40,
    paddingTop: 60,
    gap: theme.space.lg,
  },
  titleBlock: { gap: 4, marginTop: -10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  capitalize: { textTransform: "capitalize" },
  kcalCard: { padding: theme.space.xl },
  kcalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kcalBlock: { gap: 4 },
  kcalLabel: { fontSize: 12 },
  kcalNumRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  kcalNum: { fontSize: 42, color: theme.colors.primary },
  kcalUnit: { fontSize: 16 },
  macroCard: { padding: theme.space.lg, gap: theme.space.lg },
  macroList: { gap: theme.space.md },
  macroRow: { gap: 6 },
  macroHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  macroLabelWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroTrack: { height: 6, borderRadius: 99, backgroundColor: "rgba(22,78,99,0.08)", overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: 99 },
  noteCard: { padding: theme.space.lg, gap: 6 },
  noteTitle: { fontSize: 15 },
  noteText: { fontSize: 13 },
  actions: { gap: theme.space.md },
  deleteBtn: {
    height: 56,
    borderRadius: theme.radius.button,
    backgroundColor: "rgba(229,72,77,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnPressed: { backgroundColor: "rgba(229,72,77,0.15)" },
  deleteText: { fontSize: 15, fontWeight: "800", color: theme.colors.danger },
});
