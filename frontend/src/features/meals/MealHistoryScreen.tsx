import { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useMeals, Meal } from "@/context/MealsContext";
import { useT, type Strings } from "@/i18n";
import { theme } from "@/ui/theme";
import { MEAL_TYPE_BY_KEY } from "@/ui/mealTypes";
import { dateKey } from "@/utils/date";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { Card } from "@/ui/components/Card";

function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dateLabel(dateStr: string, t: Strings) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t.meals.today;
  if (d.toDateString() === yesterday.toDateString()) return t.meals.yesterday;
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function MealHistoryScreen() {
  const router = useRouter();
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();

  useEffect(() => {
    fetchMealHistory();
  }, [fetchMealHistory]);

  const grouped: { date: string; label: string; meals: Meal[] }[] = [];
  const seen = new Set<string>();

  for (const meal of historyMeals) {
    const date = meal.date;
    if (!seen.has(date)) {
      seen.add(date);
      grouped.push({ date, label: dateLabel(date, t), meals: [] });
    }
    grouped.find((g) => g.date === date)?.meals.push(meal);
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={grouped}
        keyExtractor={(g) => g.date}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <ScreenHeader title={t.meals.historyTitle} />
            <AppText variant="muted" style={styles.subtitle}>{t.meals.historySubtitle}</AppText>
          </View>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <View style={styles.emptyBody}>
              <AppText variant="h2">{t.meals.noMealsYet}</AppText>
              <AppText variant="muted">{t.meals.noMealsSub}</AppText>
              <View style={styles.emptyAction}>
                <Button
                  title={t.meals.addTitle}
                  variant="secondary"
                  onPress={() => router.push("/meals/add")}
                />
              </View>
            </View>
          </Card>
        }
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <AppText variant="subtle" style={styles.groupLabel}>{group.label}</AppText>
            {group.meals.map((item) => {
              // Clock time = when the record was saved; only meaningful when the
              // meal was logged the same day it was eaten (back-logged meals skip it)
              const loggedSameDay = dateKey(new Date(item.createdAt)) === item.date;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/meals/detail", params: { id: item.id } })}
                  style={({ pressed }) => pressed && styles.pressedFaint}
                >
                  <Card style={styles.rowCard}>
                    <View style={[styles.avatar, { backgroundColor: MEAL_TYPE_BY_KEY[item.mealType]?.bg ?? "rgba(8,145,178,0.08)" }]}>
                      <Ionicons
                        name={(MEAL_TYPE_BY_KEY[item.mealType]?.icon ?? "restaurant") as any}
                        size={22}
                        color={MEAL_TYPE_BY_KEY[item.mealType]?.color ?? theme.colors.primary}
                      />
                    </View>

                    <View style={styles.rowBody}>
                      <AppText variant="h2">{item.name}</AppText>
                      <View style={styles.rowMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="flame" size={13} color={theme.colors.accent2} />
                          <AppText variant="subtle">{item.calories.toLocaleString()} {t.common.kcal}</AppText>
                        </View>
                        {loggedSameDay && (
                          <View style={styles.metaItem}>
                            <Ionicons name="time" size={13} color={theme.colors.subtle} />
                            <AppText variant="subtle">{hhmm(item.createdAt)}</AppText>
                          </View>
                        )}
                        {item.mealType && (
                          <AppText variant="subtle">· {t.labels.mealType[item.mealType]}</AppText>
                        )}
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: 60,
    paddingBottom: 40,
    gap: theme.space.lg,
  },
  subtitle: { marginTop: -8, marginBottom: 4 },
  emptyCard: { padding: theme.space.xl },
  emptyBody: { gap: 10 },
  emptyAction: { marginTop: 8 },
  group: { gap: theme.space.sm },
  groupLabel: {
    fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  pressedFaint: { opacity: 0.9 },
  rowCard: {
    padding: theme.space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 4 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
});
