import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { ProgressBar } from "../ui/components/ProgressBar";
import { Screen } from "../ui/components/Screen";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { meals } = useMeals();

  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const displayName = user?.name ?? "there";

  // For now: show "No meals yet" until user logs meals.
  // Later: filter meals by day + user preferences + API totals.
  const goal = 2000;
  const eaten = meals.reduce((sum, m) => sum + (Number.isFinite(m.calories) ? m.calories : 0), 0);
  const remaining = Math.max(0, goal - eaten);
  const progress = goal > 0 ? eaten / goal : 0;
  const hasMeals = meals.length > 0;

  return (
    <Screen padded={false} style={{ paddingTop: theme.space.lg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: theme.space.xxl,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 6 }}>
          <AppText variant="h1">
            {greeting}, {displayName}
          </AppText>
          <AppText variant="muted">Your daily intake, at a glance.</AppText>
        </View>

        <Card style={{ padding: theme.space.xl }}>
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText variant="h2">Daily calories</AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted }}>
                Goal {goal.toLocaleString()} kcal
              </AppText>
            </View>

            {!hasMeals ? (
              <View style={{ gap: 8 }}>
                <AppText variant="muted">No meals logged yet today.</AppText>
                <AppText variant="subtle">
                  Add a meal or scan one to see your calories here.
                </AppText>
                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Add your first meal"
                    variant="secondary"
                    onPress={() => router.push("/tabs/meal-add")}
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                  <AppText variant="h0" style={{ fontSize: 30 }}>
                    {eaten.toLocaleString()}
                  </AppText>
                  <AppText variant="muted">kcal eaten</AppText>
                </View>

                <ProgressBar value={progress} />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <AppText variant="subtle">
                    {remaining.toLocaleString()} kcal left
                  </AppText>
                  <AppText variant="subtle">{Math.round(progress * 100)}%</AppText>
                </View>
              </>
            )}
          </View>
        </Card>

        <Button
          title="Scan Meal"
          size="lg"
          onPress={() => router.push("/tabs/scan")}
        />

        <View style={{ flexDirection: "row", gap: theme.space.md }}>
          <Card style={{ flex: 1, padding: theme.space.lg }}>
            <View style={{ gap: 6 }}>
              <AppText variant="h2">Add meal</AppText>
              <AppText variant="muted">Log a meal manually.</AppText>
              <View style={{ marginTop: 6 }}>
                <Button
                  title="Add"
                  variant="secondary"
                  onPress={() => router.push("/tabs/meal-add")}
                />
              </View>
            </View>
          </Card>

          <Card style={{ flex: 1, padding: theme.space.lg }}>
            <View style={{ gap: 6 }}>
              <AppText variant="h2">History</AppText>
              <AppText variant="muted">See recent meals.</AppText>
              <View style={{ marginTop: 6 }}>
                <Button
                  title="View"
                  variant="secondary"
                  onPress={() => router.push("/tabs/meals")}
                />
              </View>
            </View>
          </Card>
        </View>

        <Card
          style={{
            padding: theme.space.xl,
            borderColor: "rgba(47, 191, 113, 0.20)",
            backgroundColor: "rgba(47, 191, 113, 0.06)",
          }}
        >
          <View style={{ gap: 8 }}>
            <AppText variant="h2">What should I eat next?</AppText>
            <AppText variant="muted">
              Try a balanced plate: lean protein, colorful veggies, and a slow-carb
              side to stay full.
            </AppText>
            <View style={{ marginTop: 8 }}>
              <Button
                title="Get suggestions"
                variant="ghost"
                onPress={() => router.push("/tabs/meals")}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
