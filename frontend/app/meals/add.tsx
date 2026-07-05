import { useMemo, useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMeals } from "@/context/MealsContext";
import { theme } from "@/ui/theme";
import { MealTypeSelector } from "@/features/meals/MealTypeSelector";
import { type MealTypeKey } from "@/ui/mealTypes";
import { dateKey } from "@/utils/date";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";
import { Ionicons } from "@expo/vector-icons";

const QUICK_SUGGESTIONS = [
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, mealType: "breakfast" as MealTypeKey },
  { name: "Chicken Rice", calories: 450, protein: 35, carbs: 48, fat: 8, mealType: "lunch" as MealTypeKey },
  { name: "Greek Salad", calories: 320, protein: 8, carbs: 18, fat: 24, mealType: "lunch" as MealTypeKey },
  { name: "Grilled Salmon", calories: 380, protein: 42, carbs: 0, fat: 22, mealType: "dinner" as MealTypeKey },
  { name: "Banana", calories: 89, protein: 1, carbs: 23, fat: 0, mealType: "snack" as MealTypeKey },
  { name: "Pho Bo", calories: 420, protein: 28, carbs: 52, fat: 10, mealType: "lunch" as MealTypeKey },
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
    date: dateParam,
    prefillName,
    prefillCalories,
    prefillProtein,
    prefillCarbs,
    prefillFat,
    source, // "suggest" when coming from the AI meal suggestion (vs. scan)
  } = useLocalSearchParams<{
    mealType: MealTypeKey;
    date?: string;
    prefillName?: string;
    prefillCalories?: string;
    prefillProtein?: string;
    prefillCarbs?: string;
    prefillFat?: string;
    source?: string;
  }>();

  // Time rule: back-logging a PAST day is allowed (people forget to log),
  // the future never is. Anything invalid falls back to today.
  const todayStr = dateKey(new Date());
  const logDate =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam <= todayStr
      ? dateParam
      : todayStr;
  const isBackdated = logDate !== todayStr;

  const [mealName, setMealName] = useState(prefillName ?? "");
  const [calories, setCalories] = useState(prefillCalories ?? "");
  const [protein, setProtein] = useState(prefillProtein ?? "");
  const [carbs, setCarbs] = useState(prefillCarbs ?? "");
  const [fat, setFat] = useState(prefillFat ?? "");
  const [note, setNote] = useState("");
  const [mealType, setMealType] = useState<MealTypeKey>(defaultType ?? "breakfast");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false); // block double-tap → no duplicate meals
  const isPrefilled = !!prefillName;
  const isFromCommunity = source === "community"; // "Try this meal" from a community post
  const isFromScan = isPrefilled && source !== "suggest" && !isFromCommunity;

  useEffect(() => {
    setMealName(prefillName ?? "");
    setCalories(prefillCalories ?? "");
    setProtein(prefillProtein ?? "");
    setCarbs(prefillCarbs ?? "");
    setFat(prefillFat ?? "");
    setNote("");
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

  const handleSave = async () => {
    if (isSaving) return;
    const e = validate();
    setTouched({ mealName: true, calories: true, protein: true, carbs: true, fat: true });
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setIsSaving(true);
    try {
      await addMeal({
        name: mealName.trim(),
        calories: Number(calories),
        protein: protein.trim() ? Number(protein) : 0,
        carbs: carbs.trim() ? Number(carbs) : 0,
        fat: fat.trim() ? Number(fat) : 0,
        mealType,
        date: logDate,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      setErrors({ mealName: err.message || "Failed to save meal." });
      setIsSaving(false); // only re-enable on failure — success navigates away
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

  const backdatedLabel = new Date(logDate + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title={isFromScan ? "Confirm scan" : "Add meal"} />
          <AppText variant="muted" style={styles.subtitle}>
            {isFromScan
              ? "AI detected this meal. Review and adjust if needed."
              : isFromCommunity
              ? "From a community post. Review and adjust if needed."
              : isPrefilled
              ? "AI suggested this meal. Review and adjust if needed."
              : isBackdated
              ? "Logging a meal you forgot to add."
              : "Log your nutrition for today."}
          </AppText>
        </View>

        {/* Back-dated banner — make it unmissable WHICH day this meal goes to */}
        {isBackdated && (
          <View style={styles.backdateBanner}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.backdateText}>
              Logging for <AppText style={styles.backdateDate}>{backdatedLabel}</AppText>
            </AppText>
          </View>
        )}

        {/* Prefill badge (scan, AI suggestion, or community post) */}
        {isPrefilled && (
          <View style={styles.aiBadge}>
            <AppText style={styles.aiBadgeEmoji}>{isFromCommunity ? "🔖" : "🤖"}</AppText>
            <View style={styles.flex1}>
              <AppText style={styles.aiBadgeTitle}>
                {isFromScan ? "AI detected" : isFromCommunity ? "From community" : "AI suggested"}
              </AppText>
              <AppText variant="subtle" style={styles.aiBadgeSub}>
                You can edit any field before saving.
              </AppText>
            </View>
          </View>
        )}

        {/* Meal type selector — shared component (same UI as Edit) */}
        <MealTypeSelector value={mealType} onChange={setMealType} />

        {/* Form */}
        <Card style={styles.formCard}>
          <View style={styles.formFields}>
            <View style={styles.fieldWrap}>
              <TextField
                label="Meal name"
                placeholder="e.g. Chicken burrito bowl"
                value={mealName}
                onChangeText={(t) => { setMealName(t); setErrors((e) => ({ ...e, mealName: undefined })); }}
                textContentType="none"
                inputProps={{ onBlur: () => handleBlur("mealName") }}
              />
              {touched.mealName && errors.mealName && (
                <AppText style={styles.error}>{errors.mealName}</AppText>
              )}
            </View>

            <View style={styles.fieldWrap}>
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
                <AppText style={styles.error}>{errors.calories}</AppText>
              )}
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroField}>
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
                  <AppText style={styles.errorSmall}>{errors.protein}</AppText>
                )}
              </View>
              <View style={styles.macroField}>
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
                  <AppText style={styles.errorSmall}>{errors.carbs}</AppText>
                )}
              </View>
            </View>

            <View style={styles.fieldWrap}>
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
                <AppText style={styles.error}>{errors.fat}</AppText>
              )}
            </View>

            {/* Meal model always had `note` — the form finally exposes it */}
            <TextField
              label="Note (optional)"
              placeholder="e.g. ate out, less sugar than usual..."
              value={note}
              onChangeText={setNote}
              textContentType="none"
            />
          </View>
        </Card>

        <Button title={isSaving ? "Saving..." : "Save meal"} size="lg" disabled={!canSave || isSaving} onPress={handleSave} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed && styles.dim]}
        >
          <AppText style={styles.cancelText}>Cancel</AppText>
        </Pressable>

        {/* Quick Suggestions — chỉ hiện khi form trống (không prefill từ scan/AI) */}
        {!isPrefilled && (
          <View style={styles.suggestBlock}>
            <AppText variant="h2" style={styles.suggestTitle}>Quick Suggestions</AppText>
            <View style={styles.suggestWrap}>
              {QUICK_SUGGESTIONS.map((s) => (
                <Pressable
                  key={s.name}
                  onPress={() => fillSuggestion(s)}
                  style={({ pressed }) => [styles.suggestChip, pressed && styles.suggestChipPressed]}
                >
                  <AppText style={styles.suggestName}>{s.name}</AppText>
                  <AppText style={styles.suggestKcal}>{s.calories} kcal</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: 60,
    paddingBottom: 40,
    gap: theme.space.lg,
  },
  subtitle: { marginTop: -8 },
  backdateBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(8,145,178,0.08)",
    borderColor: "rgba(8,145,178,0.2)",
    borderWidth: 1, borderRadius: 12,
    padding: theme.space.md,
  },
  backdateText: { fontSize: 13, color: theme.colors.muted, flex: 1 },
  backdateDate: { fontSize: 13, fontWeight: "800", color: theme.colors.primary },
  aiBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(5,150,105,0.08)",
    borderColor: "rgba(5,150,105,0.2)",
    borderWidth: 1, borderRadius: 12,
    padding: theme.space.md,
  },
  aiBadgeEmoji: { fontSize: 18 },
  aiBadgeTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.accent },
  aiBadgeSub: { fontSize: 12 },
  formCard: { padding: theme.space.xl },
  formFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  macroRow: { flexDirection: "row", gap: theme.space.md },
  macroField: { flex: 1, gap: 4 },
  error: { fontSize: 12, color: theme.colors.danger },
  errorSmall: { fontSize: 11, color: theme.colors.danger },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 15, fontWeight: "600", color: theme.colors.primary },
  suggestBlock: { gap: theme.space.sm },
  suggestTitle: { fontSize: 15 },
  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    gap: 2,
  },
  suggestChipPressed: { backgroundColor: theme.colors.tint },
  suggestName: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  suggestKcal: { fontSize: 11, color: theme.colors.subtle },
});
