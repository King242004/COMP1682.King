import { useMemo, useState, useEffect } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "☀️" },
  { key: "lunch", label: "Lunch", icon: "🌤️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snacks", icon: "🍎" },
];

type Errors = {
  mealName?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
};

function validateNumber(val: string, field: string): string | undefined {
  if (!val.trim()) return undefined;
  const n = Number(val);
  if (isNaN(n) || n < 0) return `${field} must be a positive number`;
  if (n > 9999) return `${field} seems too high`;
  return undefined;
}

export default function EditMealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meals, historyMeals, updateMeal, deleteMeal } = useMeals();
  // Look in both lists - meal may have been opened from today's view OR meal history
  const meal = meals.find((m) => m.id === id) || historyMeals.find((m) => m.id === id);

  const [mealName, setMealName] = useState(meal?.name ?? "");
  const [calories, setCalories] = useState(String(meal?.calories ?? ""));
  const [protein, setProtein] = useState(meal?.protein ? String(meal.protein) : "");
  const [carbs, setCarbs] = useState(meal?.carbs ? String(meal.carbs) : "");
  const [fat, setFat] = useState(meal?.fat ? String(meal.fat) : "");
  const [mealType, setMealType] = useState<MealType>((meal?.mealType as MealType) ?? "breakfast");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (meal) {
      setMealName(meal.name);
      setCalories(String(meal.calories));
      setProtein(meal.protein ? String(meal.protein) : "");
      setCarbs(meal.carbs ? String(meal.carbs) : "");
      setFat(meal.fat ? String(meal.fat) : "");
      setMealType((meal.mealType as MealType) ?? "breakfast");
    }
  }, [id]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (mealName.trim().length < 2) e.mealName = "Name must be at least 2 characters";
    if (mealName.trim().length > 100) e.mealName = "Name is too long";
    const kcal = Number(calories);
    if (!calories.trim()) e.calories = "Calories is required";
    else if (isNaN(kcal) || kcal <= 0) e.calories = "Enter a valid calorie amount";
    else if (kcal > 9999) e.calories = "Calories seems too high";
    const pe = validateNumber(protein, "Protein");
    if (pe) e.protein = pe;
    const ce = validateNumber(carbs, "Carbs");
    if (ce) e.carbs = ce;
    const fe = validateNumber(fat, "Fat");
    if (fe) e.fat = fe;
    return e;
  };

  const canSave = useMemo(() => Object.keys(validate()).length === 0, [mealName, calories, protein, carbs, fat]);

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleSave = async () => {
    const e = validate();
    setTouched({ mealName: true, calories: true, protein: true, carbs: true, fat: true });
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!id) return;
    await updateMeal(id, {
      name: mealName.trim(),
      calories: Number(calories),
      protein: protein.trim() ? Number(protein) : undefined,
      carbs: carbs.trim() ? Number(carbs) : undefined,
      fat: fat.trim() ? Number(fat) : undefined,
      mealType,
    });
    router.replace("/tabs/meal-history");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete meal",
      `Delete "${mealName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            await deleteMeal(id);
            router.replace("/tabs/meal-history");
          },
        },
      ]
    );
  };

  if (!meal) {
    return (
      <Screen>
        <AppText variant="muted">Meal not found.</AppText>
      </Screen>
    );
  }

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: theme.space.lg,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ gap: 2 }}>
            <AppText variant="h1">Edit meal</AppText>
            <AppText variant="muted">Update or delete this entry.</AppText>
          </View>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 7,
              borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: pressed ? "rgba(229,72,77,0.2)" : "rgba(229,72,77,0.1)",
            })}
          >
            <Text style={{ fontSize: 13 }}>🗑️</Text>
            <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.danger }}>
              Delete
            </AppText>
          </Pressable>
        </View>

        {/* Meal type 2x2 */}
        <View style={{ gap: 8 }}>
          {[MEAL_TYPES.slice(0, 2), MEAL_TYPES.slice(2, 4)].map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", gap: 8 }}>
              {row.map((mt) => {
                const active = mealType === mt.key;
                return (
                  <Pressable
                    key={mt.key}
                    onPress={() => setMealType(mt.key)}
                    style={({ pressed }) => ({
                      flex: 1, flexDirection: "row",
                      alignItems: "center", justifyContent: "center",
                      paddingVertical: 10, paddingHorizontal: 8,
                      borderRadius: 12, gap: 6,
                      borderWidth: 1.5,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 16 }}>{mt.icon}</Text>
                    <Text style={{
                      fontSize: 12, fontWeight: "700",
                      color: active ? "#FFFFFF" : theme.colors.subtle,
                    }}>{mt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Form */}
        <Card style={{ padding: theme.space.xl }}>
          <View style={{ gap: theme.space.md }}>
            <View style={{ gap: 4 }}>
              <TextField
                label="Meal name"
                placeholder="e.g. Chicken burrito bowl"
                value={mealName}
                onChangeText={(t) => { setMealName(t); setErrors((e) => ({ ...e, mealName: undefined })); }}
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("mealName") }}
              />
              {touched.mealName && errors.mealName && (
                <AppText style={{ fontSize: 12, color: theme.colors.danger }}>{errors.mealName}</AppText>
              )}
            </View>

            <View style={{ gap: 4 }}>
              <TextField
                label="Calories (kcal)"
                placeholder="e.g. 650"
                value={calories}
                onChangeText={(t) => { setCalories(t); setErrors((e) => ({ ...e, calories: undefined })); }}
                keyboardType="number-pad"
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("calories") }}
              />
              {touched.calories && errors.calories && (
                <AppText style={{ fontSize: 12, color: theme.colors.danger }}>{errors.calories}</AppText>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: theme.space.md }}>
              <View style={{ flex: 1, gap: 4 }}>
                <TextField
                  label="Protein (g)"
                  placeholder="Optional"
                  value={protein}
                  onChangeText={(t) => { setProtein(t); setErrors((e) => ({ ...e, protein: undefined })); }}
                  keyboardType="number-pad"
                  textContentType="none"
                  inputProps={{ onBlur: () => handleBlur("protein") }}
                />
                {touched.protein && errors.protein && (
                  <AppText style={{ fontSize: 11, color: theme.colors.danger }}>{errors.protein}</AppText>
                )}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <TextField
                  label="Carbs (g)"
                  placeholder="Optional"
                  value={carbs}
                  onChangeText={(t) => { setCarbs(t); setErrors((e) => ({ ...e, carbs: undefined })); }}
                  keyboardType="number-pad"
                  textContentType="none"
                  inputProps={{ onBlur: () => handleBlur("carbs") }}
                />
                {touched.carbs && errors.carbs && (
                  <AppText style={{ fontSize: 11, color: theme.colors.danger }}>{errors.carbs}</AppText>
                )}
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <TextField
                label="Fat (g)"
                placeholder="Optional"
                value={fat}
                onChangeText={(t) => { setFat(t); setErrors((e) => ({ ...e, fat: undefined })); }}
                keyboardType="number-pad"
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("fat") }}
              />
              {touched.fat && errors.fat && (
                <AppText style={{ fontSize: 12, color: theme.colors.danger }}>{errors.fat}</AppText>
              )}
            </View>
          </View>
        </Card>

        <Button title="Save changes" size="lg" disabled={!canSave} onPress={handleSave} />

        <Pressable
          onPress={() => router.replace("/tabs/meal-history")}
          style={({ pressed }) => ({
            alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1,
          })}
        >
          <AppText style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary }}>
            Cancel
          </AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}