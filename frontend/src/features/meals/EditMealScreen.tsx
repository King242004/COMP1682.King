import { useState, useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMeals } from "@/context/MealsContext";
import { useT, type Strings } from "@/i18n";
import { theme } from "@/ui/theme";
import { MealTypeSelector } from "@/features/meals/MealTypeSelector";
import { type MealTypeKey } from "@/ui/mealTypes";
import { parseDecimal } from "@/utils/number";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

type Errors = {
  mealName?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
};

function validateNumber(val: string, field: string, t: Strings): string | undefined {
  if (!val.trim()) return undefined;
  const n = parseDecimal(val);
  if (isNaN(n) || n < 0) return t.meals.numPositive(field);
  if (n > 9999) return t.meals.numTooHigh(field);
  return undefined;
}

export default function EditMealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meals, historyMeals, updateMeal, deleteMeal } = useMeals();
  const t = useT();
  // Look in both lists - meal may have been opened from today's view OR meal history
  const meal = meals.find((m) => m.id === id) || historyMeals.find((m) => m.id === id);

  const [mealName, setMealName] = useState(meal?.name ?? "");
  const [calories, setCalories] = useState(String(meal?.calories ?? ""));
  const [protein, setProtein] = useState(meal?.protein ? String(meal.protein) : "");
  const [carbs, setCarbs] = useState(meal?.carbs ? String(meal.carbs) : "");
  const [fat, setFat] = useState(meal?.fat ? String(meal.fat) : "");
  const [note, setNote] = useState(meal?.note ?? "");
  const [mealType, setMealType] = useState<MealTypeKey>((meal?.mealType as MealTypeKey) ?? "breakfast");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false); // block double-tap → no duplicate updates

  useEffect(() => {
    if (meal) {
      setMealName(meal.name);
      setCalories(String(meal.calories));
      setProtein(meal.protein ? String(meal.protein) : "");
      setCarbs(meal.carbs ? String(meal.carbs) : "");
      setFat(meal.fat ? String(meal.fat) : "");
      setNote(meal.note ?? "");
      setMealType((meal.mealType as MealTypeKey) ?? "breakfast");
    }
  }, [meal]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (mealName.trim().length < 2) e.mealName = t.meals.nameMin;
    if (mealName.trim().length > 100) e.mealName = t.meals.nameTooLong;
    const kcal = parseDecimal(calories);
    if (!calories.trim()) e.calories = t.meals.caloriesRequired;
    else if (isNaN(kcal) || kcal <= 0) e.calories = t.meals.caloriesInvalid;
    else if (kcal > 9999) e.calories = t.meals.caloriesTooHigh;
    const pe = validateNumber(protein, t.labels.protein, t);
    if (pe) e.protein = pe;
    const ce = validateNumber(carbs, t.labels.carbs, t);
    if (ce) e.carbs = ce;
    const fe = validateNumber(fat, t.labels.fat, t);
    if (fe) e.fat = fe;
    return e;
  };

  const canSave = Object.keys(validate()).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSave = async () => {
    if (isSaving) return;
    const e = validate();
    setTouched({ mealName: true, calories: true, protein: true, carbs: true, fat: true });
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!id) return;
    setIsSaving(true);
    try {
      await updateMeal(id, {
        name: mealName.trim(),
        calories: parseDecimal(calories),
        // Cleared field = 0, same rule as Add (undefined would silently KEEP the old value)
        protein: protein.trim() ? parseDecimal(protein) : 0,
        carbs: carbs.trim() ? parseDecimal(carbs) : 0,
        fat: fat.trim() ? parseDecimal(fat) : 0,
        mealType,
        note: note.trim(), // empty string clears a previous note
      });
      // Return to wherever the user came from (detail, Home or History) —
      // replacing to History used to hijack the back stack.
      router.back();
    } catch (err: any) {
      setErrors({ mealName: err.message || t.meals.saveChangesFailed });
      setIsSaving(false); // only re-enable on failure — success navigates away
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.meals.deleteMealTitle,
      t.meals.deleteMealMsg(mealName),
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            await deleteMeal(id);
            // One step back is the detail of the meal we just deleted → skip
            // over it and land where the user actually came from (Home/History).
            if (router.canDismiss()) router.dismiss(2);
            else router.replace("/meals/history");
          },
        },
      ]
    );
  };

  if (!meal) {
    return (
      <Screen>
        <AppText variant="muted">{t.meals.mealNotFound}</AppText>
      </Screen>
    );
  }

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Delete on the right */}
        <ScreenHeader
          title={t.meals.editTitle}
          right={
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            >
              <AppText style={styles.deleteEmoji}>🗑️</AppText>
              <AppText style={styles.deleteText}>{t.common.delete}</AppText>
            </Pressable>
          }
        />

        {/* Meal type — shared component (same UI as Add) */}
        <MealTypeSelector value={mealType} onChange={setMealType} />

        {/* Form */}
        <Card style={styles.formCard}>
          <View style={styles.formFields}>
            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.mealName}
                placeholder={t.meals.mealNamePlaceholder}
                value={mealName}
                onChangeText={(v) => { setMealName(v); setErrors((e) => ({ ...e, mealName: undefined })); }}
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("mealName") }}
              />
              {touched.mealName && errors.mealName && (
                <AppText style={styles.error}>{errors.mealName}</AppText>
              )}
            </View>

            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.calories}
                placeholder={t.meals.caloriesPlaceholder}
                value={calories}
                onChangeText={(v) => { setCalories(v); setErrors((e) => ({ ...e, calories: undefined })); }}
                keyboardType="number-pad"
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("calories") }}
              />
              {touched.calories && errors.calories && (
                <AppText style={styles.error}>{errors.calories}</AppText>
              )}
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <TextField
                  label={t.meals.proteinG}
                  placeholder={t.meals.optional}
                  value={protein}
                  onChangeText={(v) => { setProtein(v); setErrors((e) => ({ ...e, protein: undefined })); }}
                  keyboardType="decimal-pad"
                  textContentType="none"
                  inputProps={{ onBlur: () => handleBlur("protein") }}
                />
                {touched.protein && errors.protein && (
                  <AppText style={styles.errorSmall}>{errors.protein}</AppText>
                )}
              </View>
              <View style={styles.macroField}>
                <TextField
                  label={t.meals.carbsG}
                  placeholder={t.meals.optional}
                  value={carbs}
                  onChangeText={(v) => { setCarbs(v); setErrors((e) => ({ ...e, carbs: undefined })); }}
                  keyboardType="decimal-pad"
                  textContentType="none"
                  inputProps={{ onBlur: () => handleBlur("carbs") }}
                />
                {touched.carbs && errors.carbs && (
                  <AppText style={styles.errorSmall}>{errors.carbs}</AppText>
                )}
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.fatG}
                placeholder={t.meals.optional}
                value={fat}
                onChangeText={(v) => { setFat(v); setErrors((e) => ({ ...e, fat: undefined })); }}
                keyboardType="decimal-pad"
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("fat") }}
              />
              {touched.fat && errors.fat && (
                <AppText style={styles.error}>{errors.fat}</AppText>
              )}
            </View>

            <TextField
              label={t.meals.note}
              placeholder={t.meals.notePlaceholder}
              value={note}
              onChangeText={setNote}
              textContentType="none"
            />
          </View>
        </Card>

        <Button title={isSaving ? t.common.saving : t.meals.saveChanges} size="lg" disabled={!canSave || isSaving} onPress={handleSave} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed && styles.dim]}
        >
          <AppText style={styles.cancelText}>{t.common.cancel}</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.6 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: 60,
    paddingBottom: 40,
    gap: theme.space.lg,
  },
  deleteBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(229,72,77,0.1)",
  },
  deleteBtnPressed: { backgroundColor: "rgba(229,72,77,0.2)" },
  deleteEmoji: { fontSize: 13 },
  deleteText: { fontSize: 13, fontWeight: "700", color: theme.colors.danger },
  formCard: { padding: theme.space.xl },
  formFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  macroRow: { flexDirection: "row", gap: theme.space.md },
  macroField: { flex: 1, gap: 4 },
  error: { fontSize: 12, color: theme.colors.danger },
  errorSmall: { fontSize: 11, color: theme.colors.danger },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 15, fontWeight: "600", color: theme.colors.primary },
});
