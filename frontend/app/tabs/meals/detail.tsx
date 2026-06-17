import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useMeals } from "../../context/MealsContext";
import { theme, macroGoals } from "../../ui/theme";
import { AppText } from "../../ui/components/AppText";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { Screen } from "../../ui/components/Screen";
import Svg, { Circle } from "react-native-svg";

const MEAL_TYPE_ICON: Record<string, string> = {
  breakfast: "☀️", lunch: "🥗", dinner: "🍽️", snack: "🍎",
};

function CalorieRing({ eaten, goal }: { eaten: number; goal: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(eaten / goal, 1);
  const dash = progress * circ;
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(37,99,235,0.08)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={progress >= 1 ? theme.colors.danger : theme.colors.primary}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText style={{ fontSize: 11, fontWeight: "700", color: theme.colors.primary }}>
        {Math.round(progress * 100)}%
      </AppText>
    </View>
  );
}

function MacroRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
          <AppText variant="body2">{label}</AppText>
        </View>
        <AppText variant="subtle">{Math.round(value)}g / {total}g</AppText>
      </View>
      <View style={{ height: 6, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${ratio * 100}%`, borderRadius: 99, backgroundColor: color }} />
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

function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
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
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <AppText variant="muted">Meal not found.</AppText>
        <Button title="Go back" variant="secondary" onPress={() => router.replace("/tabs/meals/history")} />
      </Screen>
    );
  }

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
            router.replace("/tabs/meals/history");
          },
        },
      ]
    );
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: 40,
          paddingTop: theme.space.lg,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.replace("/tabs/meals/history")}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 4,
            opacity: pressed ? 0.6 : 1, alignSelf: "flex-start",
          })}
        >
          <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
          <AppText style={{ fontSize: 14, color: theme.colors.primary, fontWeight: "600" }}>
            Meal History
          </AppText>
        </Pressable>

        {/* Title */}
        <View style={{ gap: 4 }}>
          <AppText variant="h1">{meal.name}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {meal.mealType && (
              <AppText style={{ fontSize: 14 }}>{MEAL_TYPE_ICON[meal.mealType]}</AppText>
            )}
            <AppText variant="muted" style={{ textTransform: "capitalize" }}>
              {meal.mealType ?? "Meal"}
            </AppText>
            <AppText variant="subtle">·</AppText>
            <AppText variant="muted">{fullDate(meal.createdAt)}</AppText>
            <AppText variant="subtle">·</AppText>
            <AppText variant="muted">{hhmm(meal.createdAt)}</AppText>
          </View>
        </View>

        {/* Calories card with ring */}
        <Card style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <AppText variant="subtle" style={{ fontSize: 12 }}>Energy Total</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <AppText variant="h0" style={{ fontSize: 42, color: theme.colors.primary }}>
                  {meal.calories.toLocaleString()}
                </AppText>
                <AppText variant="muted" style={{ fontSize: 16 }}>kcal</AppText>
              </View>
            </View>
            <CalorieRing eaten={meal.calories} goal={goal} />
          </View>
        </Card>

        {/* Macros */}
        <Card style={{ padding: theme.space.lg, gap: theme.space.lg }}>
          <AppText variant="h2">Macros</AppText>
          {meal.protein || meal.carbs || meal.fat ? (
            <View style={{ gap: theme.space.md }}>
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

        {/* Actions */}
        <View style={{ gap: theme.space.md }}>
          <Button
            title="Edit meal"
            size="lg"
            onPress={() => router.push({ pathname: "/tabs/meals/edit", params: { id: meal.id } })}
          />
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({
              height: 56,
              borderRadius: theme.radius.button,
              backgroundColor: pressed ? "rgba(229,72,77,0.15)" : "rgba(229,72,77,0.08)",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <AppText style={{ fontSize: 15, fontWeight: "800", color: theme.colors.danger }}>
              Delete meal
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}