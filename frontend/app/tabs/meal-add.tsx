import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

export default function AddMealScreen() {
  const router = useRouter();
  const { addMeal } = useMeals();

  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const canSave = useMemo(() => {
    const okName = mealName.trim().length >= 2;
    const kcal = Number(calories);
    const okCalories = Number.isFinite(kcal) && kcal > 0;
    return okName && okCalories;
  }, [mealName, calories]);

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
        <View style={{ gap: 6 }}>
          <AppText variant="h1">Add meal</AppText>
          <AppText variant="muted">Log calories and optional macros.</AppText>
        </View>

        <Card style={{ padding: theme.space.xl }}>
          <View style={{ gap: theme.space.md }}>
            <TextField
              label="Meal name"
              placeholder="e.g. Chicken burrito bowl"
              value={mealName}
              onChangeText={setMealName}
              textContentType="none"
              inputProps={{ autoFocus: true }}
            />

            <TextField
              label="Calories"
              placeholder="e.g. 650"
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              textContentType="none"
            />

            <View style={{ flexDirection: "row", gap: theme.space.md }}>
              <TextField
                label="Protein (g)"
                placeholder="Optional"
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
                textContentType="none"
                style={{ flex: 1 }}
              />
              <TextField
                label="Carbs (g)"
                placeholder="Optional"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="number-pad"
                textContentType="none"
                style={{ flex: 1 }}
              />
            </View>

            <TextField
              label="Fat (g)"
              placeholder="Optional"
              value={fat}
              onChangeText={setFat}
              keyboardType="number-pad"
              textContentType="none"
            />
          </View>
        </Card>

        <Button
          title="Save meal"
          size="lg"
          disabled={!canSave}
          onPress={() => {
            addMeal({
              name: mealName.trim(),
              calories: Number(calories),
              protein: protein.trim() ? Number(protein) : undefined,
              carbs: carbs.trim() ? Number(carbs) : undefined,
              fat: fat.trim() ? Number(fat) : undefined,
            });
            Alert.alert("Meal saved", "Added to your meals.");
            router.push("/tabs/meals");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
