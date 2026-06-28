import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { addPlanMeal, type MealType } from "@/utils/plan";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "☀️" },
  { key: "lunch", label: "Lunch", icon: "🌤️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snacks", icon: "🍎" },
];

type Errors = { mealName?: string; calories?: string; protein?: string; carbs?: string; fat?: string };

function validateNumber(val: string, field: string): string | undefined {
  if (!val.trim()) return undefined;
  const n = Number(val);
  if (isNaN(n) || n < 0) return `${field} must be a positive number`;
  if (n > 9999) return `${field} seems too high`;
  return undefined;
}

export default function AddPlanMealScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { date, mealType: defaultType } = useLocalSearchParams<{ date: string; mealType: MealType }>();

  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultType ?? "breakfast");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (mealName.trim().length < 2) e.mealName = "Name must be at least 2 characters";
    if (mealName.trim().length > 100) e.mealName = "Name is too long";
    const kcal = Number(calories);
    if (!calories.trim()) e.calories = "Calories is required";
    else if (isNaN(kcal) || kcal <= 0) e.calories = "Enter a valid calorie amount";
    else if (kcal > 9999) e.calories = "Calories seems too high";
    const pe = validateNumber(protein, "Protein"); if (pe) e.protein = pe;
    const ce = validateNumber(carbs, "Carbs"); if (ce) e.carbs = ce;
    const fe = validateNumber(fat, "Fat"); if (fe) e.fat = fe;
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
    if (Object.keys(e).length > 0 || !token || !date) return;
    setSaving(true);
    try {
      await addPlanMeal(token, {
        name: mealName.trim(),
        calories: Number(calories),
        protein: protein.trim() ? Number(protein) : 0,
        carbs: carbs.trim() ? Number(carbs) : 0,
        fat: fat.trim() ? Number(fat) : 0,
        mealType,
        date,
      });
      router.back();
    } catch (err: any) {
      setErrors({ mealName: err.message || "Failed to save planned meal." });
      setSaving(false);
    }
  };

  const dayLabel = date
    ? new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
    : "";

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title="Plan a meal" />
          <AppText variant="muted" style={{ marginTop: -8 }}>
            Add to your plan for {dayLabel}.
          </AppText>
        </View>

        {/* Meal type selector */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {MEAL_TYPES.map((mt) => {
            const active = mealType === mt.key;
            return (
              <Pressable
                key={mt.key}
                onPress={() => setMealType(mt.key)}
                style={({ pressed }) => ({
                  flex: 1, alignItems: "center", justifyContent: "center",
                  paddingVertical: 10, borderRadius: 12, gap: 4, borderWidth: 1.5,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.tint : theme.colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 18 }}>{mt.icon}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: active ? theme.colors.primary : theme.colors.subtle }}>
                  {mt.label}
                </Text>
              </Pressable>
            );
          })}
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

        <Button title={saving ? "Saving..." : "Add to plan"} size="lg" disabled={!canSave || saving} onPress={handleSave} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
        >
          <AppText style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary }}>Cancel</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
