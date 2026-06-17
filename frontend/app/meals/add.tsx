import { useMemo, useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { ScreenHeader } from "../ui/components/ScreenHeader";
import { TextField } from "../ui/components/TextField";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "☀️" },
  { key: "lunch", label: "Lunch", icon: "🌤️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snacks", icon: "🍎" },
];

const QUICK_SUGGESTIONS = [
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, mealType: "breakfast" as MealType },
  { name: "Chicken Rice", calories: 450, protein: 35, carbs: 48, fat: 8, mealType: "lunch" as MealType },
  { name: "Greek Salad", calories: 320, protein: 8, carbs: 18, fat: 24, mealType: "lunch" as MealType },
  { name: "Grilled Salmon", calories: 380, protein: 42, carbs: 0, fat: 22, mealType: "dinner" as MealType },
  { name: "Banana", calories: 89, protein: 1, carbs: 23, fat: 0, mealType: "snack" as MealType },
  { name: "Pho Bo", calories: 420, protein: 28, carbs: 52, fat: 10, mealType: "lunch" as MealType },
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

export default function AddMealScreen() {
  const router = useRouter();
  const { addMeal } = useMeals();
  const {
    mealType: defaultType,
    prefillName,
    prefillCalories,
    prefillProtein,
    prefillCarbs,
    prefillFat,
  } = useLocalSearchParams<{
    mealType: MealType;
    prefillName?: string;
    prefillCalories?: string;
    prefillProtein?: string;
    prefillCarbs?: string;
    prefillFat?: string;
  }>();

  const [mealName, setMealName] = useState(prefillName ?? "");
  const [calories, setCalories] = useState(prefillCalories ?? "");
  const [protein, setProtein] = useState(prefillProtein ?? "");
  const [carbs, setCarbs] = useState(prefillCarbs ?? "");
  const [fat, setFat] = useState(prefillFat ?? "");
  const [mealType, setMealType] = useState<MealType>(defaultType ?? "breakfast");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isFromScan = !!prefillName;

  useEffect(() => {
    setMealName(prefillName ?? "");
    setCalories(prefillCalories ?? "");
    setProtein(prefillProtein ?? "");
    setCarbs(prefillCarbs ?? "");
    setFat(prefillFat ?? "");
    setErrors({});
    setTouched({});
    setMealType(defaultType ?? "breakfast");
  }, [defaultType, prefillName]);

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

  const getTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleSave = async () => {
    const e = validate();
    setTouched({ mealName: true, calories: true, protein: true, carbs: true, fat: true });
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      await addMeal({
        name: mealName.trim(),
        calories: Number(calories),
        protein: protein.trim() ? Number(protein) : 0,
        carbs: carbs.trim() ? Number(carbs) : 0,
        fat: fat.trim() ? Number(fat) : 0,
        mealType,
        date: getTodayDate(),
      });
      router.back();
    } catch (err: any) {
      setErrors({ mealName: err.message || "Failed to save meal." });
    }
  };

  const fillSuggestion = (s: typeof QUICK_SUGGESTIONS[0]) => {
    setMealName(s.name);
    setCalories(String(s.calories));
    setProtein(String(s.protein));
    setCarbs(String(s.carbs));
    setFat(String(s.fat));
    setMealType(s.mealType);
    setErrors({});
    setTouched({});
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: 60,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title={isFromScan ? "Confirm scan" : "Add meal"} />
          <AppText variant="muted" style={{ marginTop: -8 }}>
            {isFromScan
              ? "AI detected this meal. Review and adjust if needed."
              : "Log your nutrition for today."}
          </AppText>
        </View>

        {/* Scan badge */}
        {isFromScan && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "rgba(47,191,113,0.08)",
            borderColor: "rgba(47,191,113,0.2)",
            borderWidth: 1, borderRadius: 12,
            padding: theme.space.md,
          }}>
            <AppText style={{ fontSize: 18 }}>🤖</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.accent }}>
                AI detected
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>
                You can edit any field before saving.
              </AppText>
            </View>
          </View>
        )}

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
                  paddingVertical: 10, borderRadius: 12, gap: 4,
                  borderWidth: 1.5,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.tint : theme.colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 18 }}>{mt.icon}</Text>
                <Text style={{
                  fontSize: 10, fontWeight: "700",
                  color: active ? theme.colors.primary : theme.colors.subtle,
                }}>{mt.label}</Text>
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

        <Button title="Save meal" size="lg" disabled={!canSave} onPress={handleSave} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1,
          })}
        >
          <AppText style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary }}>
            Cancel
          </AppText>
        </Pressable>

        {/* Quick Suggestions — chỉ hiện khi không phải từ scan */}
        {!isFromScan && (
          <View style={{ gap: theme.space.sm }}>
            <AppText variant="h2" style={{ fontSize: 15 }}>Quick Suggestions</AppText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {QUICK_SUGGESTIONS.map((s) => (
                <Pressable
                  key={s.name}
                  onPress={() => fillSuggestion(s)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: pressed ? theme.colors.tint : theme.colors.surface,
                    borderWidth: 1, borderColor: theme.colors.border,
                    gap: 2,
                  })}
                >
                  <AppText style={{ fontSize: 13, fontWeight: "600", color: theme.colors.text }}>
                    {s.name}
                  </AppText>
                  <AppText style={{ fontSize: 11, color: theme.colors.subtle }}>
                    {s.calories} kcal
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}