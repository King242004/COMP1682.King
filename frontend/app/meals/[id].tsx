import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { meals, updateMeal, deleteMeal } = useMeals();

  const meal = meals.find((m) => m.id === id);

  const [name, setName] = useState(meal?.name ?? "");
  const [calories, setCalories] = useState(
    meal?.calories != null ? String(meal.calories) : "",
  );
  const [protein, setProtein] = useState(
    meal?.protein != null ? String(meal.protein) : "",
  );
  const [carbs, setCarbs] = useState(
    meal?.carbs != null ? String(meal.carbs) : "",
  );
  const [fat, setFat] = useState(meal?.fat != null ? String(meal.fat) : "");

  const canSave = useMemo(() => {
    const okName = name.trim().length >= 2;
    const kcal = Number(calories);
    const okCalories = Number.isFinite(kcal) && kcal > 0;
    return okName && okCalories;
  }, [name, calories]);

  if (!meal) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.space.lg,
            gap: 10,
          }}
        >
          <AppText variant="h2">Meal not found</AppText>
          <AppText variant="muted">
            This meal may have been deleted. Use the back button to return to your list.
          </AppText>
        </View>
      </Screen>
    );
  }

  const createdAt = new Date(meal.createdAt);
  const dateLabel = createdAt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Screen padded={false} keyboard style={{ paddingTop: theme.space.lg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: theme.space.xxl,
          gap: theme.space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 4 }}>
          <AppText variant="h1">Meal details</AppText>
          <AppText variant="muted">{dateLabel}</AppText>
        </View>

        <Card style={{ padding: theme.space.xl, gap: theme.space.md }}>
          <TextField
            label="Meal name"
            value={name}
            onChangeText={setName}
            placeholder="Meal name"
            textContentType="none"
          />

          <TextField
            label="Calories"
            value={calories}
            onChangeText={setCalories}
            placeholder="e.g. 650"
            keyboardType="number-pad"
            textContentType="none"
          />

          <View style={{ flexDirection: "row", gap: theme.space.md }}>
            <TextField
              label="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              placeholder="Optional"
              keyboardType="number-pad"
              textContentType="none"
              style={{ flex: 1 }}
            />
            <TextField
              label="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              placeholder="Optional"
              keyboardType="number-pad"
              textContentType="none"
              style={{ flex: 1 }}
            />
          </View>

          <TextField
            label="Fat (g)"
            value={fat}
            onChangeText={setFat}
            placeholder="Optional"
            keyboardType="number-pad"
            textContentType="none"
          />
        </Card>

        <Button
          title="Save changes"
          size="lg"
          disabled={!canSave}
          onPress={() => {
            updateMeal(meal.id, {
              name: name.trim(),
              calories: Number(calories),
              protein: protein.trim() ? Number(protein) : undefined,
              carbs: carbs.trim() ? Number(carbs) : undefined,
              fat: fat.trim() ? Number(fat) : undefined,
            });
            Alert.alert("Saved", "Meal changes have been updated.");
            router.back();
          }}
        />

        <Button
          title="Delete meal"
          variant="danger"
          onPress={() => {
            Alert.alert("Delete meal", "Are you sure you want to delete this meal?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  deleteMeal(meal.id);
                  router.replace("/tabs/meals");
                },
              },
            ]);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

