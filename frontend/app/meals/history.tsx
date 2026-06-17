import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useMeals, Meal } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Screen } from "../ui/components/Screen";
import { ScreenHeader } from "../ui/components/ScreenHeader";
import { Card } from "../ui/components/Card";

// Meal-type emoji shown as the row avatar — friendlier than name initials
const MEAL_TYPE_ICON: Record<string, string> = {
  breakfast: "☕", lunch: "🥗", dinner: "🍽️", snack: "🍎",
};

function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function MealHistoryScreen() {
  const router = useRouter();
  const { historyMeals, fetchMealHistory } = useMeals();

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const grouped: { date: string; label: string; meals: Meal[] }[] = [];
  const seen = new Set<string>();

  for (const meal of historyMeals) {
    const date = meal.date;
    if (!seen.has(date)) {
      seen.add(date);
      grouped.push({ date, label: dateLabel(date), meals: [] });
    }
    grouped.find((g) => g.date === date)?.meals.push(meal);
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={grouped}
        keyExtractor={(g) => g.date}
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: 60,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Meal History" />
            <AppText variant="muted" style={{ marginTop: -8, marginBottom: 4 }}>Tap a meal to view details or edit.</AppText>
          </View>
        }
        ListEmptyComponent={
          <Card style={{ padding: theme.space.xl }}>
            <View style={{ gap: 10 }}>
              <AppText variant="h2">No meals yet</AppText>
              <AppText variant="muted">
                Add a meal manually or scan one to start tracking calories.
              </AppText>
              <View style={{ marginTop: 8 }}>
                <Button
                  title="Add meal"
                  variant="secondary"
                  onPress={() => router.push("/meals/add")}
                />
              </View>
            </View>
          </Card>
        }
        renderItem={({ item: group }) => (
          <View style={{ gap: theme.space.sm }}>
            <AppText variant="subtle" style={{
              fontSize: 12, fontWeight: "700",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              {group.label}
            </AppText>
            {group.meals.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push({ pathname: "/meals/detail", params: { id: item.id } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <Card style={{
                  padding: theme.space.lg,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.space.md,
                }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 18,
                    backgroundColor: "rgba(37,99,235,0.08)",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <AppText style={{ fontSize: 24 }}>
                      {MEAL_TYPE_ICON[item.mealType] ?? "🍴"}
                    </AppText>
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="h2">{item.name}</AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="flame" size={13} color={theme.colors.accent2} />
                        <AppText variant="subtle">{item.calories.toLocaleString()} kcal</AppText>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="time" size={13} color={theme.colors.subtle} />
                        <AppText variant="subtle">{hhmm(item.createdAt)}</AppText>
                      </View>
                      {item.mealType && (
                        <AppText variant="subtle" style={{ textTransform: "capitalize" }}>
                          · {item.mealType}
                        </AppText>
                      )}
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                </Card>
              </Pressable>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}