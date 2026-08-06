// ═══ FILE NÀY LÀM GÌ ═══
// Màn Sửa món. File BẮT ĐẦU của luồng sửa một bản ghi món đã có.
//
// Ai gọi tới: MealDetailScreen
// Nhận vào:   món cần sửa, truyền qua tham số route
// Trả ra:     không trả gì, lưu xong thì quay lại màn trước
// Khi lỗi:    sửa tên hoặc khẩu phần thì số dinh dưỡng cũ bị xóa, buộc ước tính lại

// LUỒNG SỬA MÓN
// 1. Mở từ màn Chi tiết món, mã món đi theo tham số route
// 2. Tìm món đó trong MealsContext, KHÔNG gọi mạng để tải lại
// 3. Đổ dữ liệu món vào form
// 4. Sửa tên hay khẩu phần thì có thể bấm Ước tính lại, chạy handleEstimate
// 5. Bấm Lưu, chạy handleSave
// 6. MealsContext.updateMeal          (PUT /meals/:id)
// 7. router.back về màn Chi tiết món
// Khác Thêm món ở ba điểm: chỉ sửa MỘT món chứ không phải danh sách, dữ liệu
// lấy sẵn từ Context nên mở màn là thấy ngay, và có thêm nút Xóa món.
// Phần ước tính dinh dưỡng thì giống hệt, cùng gọi POST /scan/estimate.
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import type { NutritionSource } from "@/features/meals/mealTypes";
import { MealTypeSelector } from "@/features/meals/MealTypeSelector";
import { estimateNutrition } from "@/features/scan/scanApi";
import { useT } from "@/i18n";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";
import type { MealTypeKey } from "@/features/meals/mealTypeDisplay";
import { theme } from "@/ui/theme";
import { resolveLanguage } from "@/utils/languageUtils";
import { parseDecimal } from "@/utils/numberUtils";
import {
  hasAnyNutrition,
  hasCompleteNutrition,
  isApproximateSource,
  nutritionNumberError,
  nutritionSourceLabel,
} from "@/features/meals/mealHelpers";
import { NutritionManualFields, NutritionResultCard } from "@/features/meals/NutritionFields";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { INPUT_LIMITS } from "@/config/inputLimits";

type Errors = Partial<Record<"mealName" | "portion" | "details" | "calories" | "protein" | "carbs" | "fat", string>>;
type Field = keyof Errors;

export default function EditMealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const { meals, historyMeals, updateMeal, deleteMeal } = useMeals();
  const t = useT();
  const meal = meals.find((item) => item.id === id) || historyMeals.find((item) => item.id === id);
  const inputVersionRef = useRef(0);

  const [mealName, setMealName] = useState(meal?.name ?? "");
  const [portion, setPortion] = useState(meal?.portionText || [meal?.portionAmount, meal?.portionUnit].filter(Boolean).join(" "));
  const [details, setDetails] = useState(meal?.note ?? "");
  const [calories, setCalories] = useState(String(meal?.calories ?? ""));
  const [protein, setProtein] = useState(String(meal?.protein ?? ""));
  const [carbs, setCarbs] = useState(String(meal?.carbs ?? ""));
  const [fat, setFat] = useState(String(meal?.fat ?? ""));
  const [mealType, setMealType] = useState<MealTypeKey>((meal?.mealType as MealTypeKey) ?? "breakfast");
  const [nutritionSource, setNutritionSource] = useState<NutritionSource>(meal?.nutritionSource ?? "manual");
  const [estimateDescription, setEstimateDescription] = useState("");
  const [showNutritionFields, setShowNutritionFields] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [estimateError, setEstimateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Workflow tự chạy: đổ lại dữ liệu vào form mỗi khi bản ghi món đổi.
  // Chạy cả lúc mở màn lẫn lúc Context tải lại danh sách món từ backend.
  useEffect(() => {
    if (!meal) return;
    inputVersionRef.current += 1;
    setMealName(meal.name);
    setPortion(meal.portionText || [meal.portionAmount, meal.portionUnit].filter(Boolean).join(" "));
    setDetails(meal.note ?? "");
    setCalories(String(meal.calories));
    setProtein(String(meal.protein ?? 0));
    setCarbs(String(meal.carbs ?? 0));
    setFat(String(meal.fat ?? 0));
    setMealType((meal.mealType as MealTypeKey) ?? "breakfast");
    setNutritionSource(meal.nutritionSource ?? "manual");
    setEstimateDescription("");
    setShowNutritionFields(false);
    setErrors({});
    setTouched({});
    setEstimateError("");
    setSaveError("");
  }, [meal]);

  const nutritionValues = { calories, protein, carbs, fat };
  const completeNutrition = hasCompleteNutrition(nutritionValues);
  const approximate = isApproximateSource(nutritionSource);

  const validate = (requireNutrition: boolean): Errors => {
    const next: Errors = {};
    // Chỉ còn kiểm phần TỐI THIỂU và phần bắt buộc. Trần độ dài do maxLength của
    // từng ô lo, nên ô nhập không bao giờ vượt được, không cần kiểm lại lần nữa.
    if (mealName.trim().length < 2) next.mealName = t.meals.nameMin;
    if (!portion.trim()) next.portion = t.meals.portionConsumedRequired;
    if (requireNutrition) {
      next.calories = nutritionNumberError(calories, t.meals.calories, t, false);
      next.protein = nutritionNumberError(protein, t.labels.protein, t);
      next.carbs = nutritionNumberError(carbs, t.labels.carbs, t);
      next.fat = nutritionNumberError(fat, t.labels.fat, t);
    }
    return Object.fromEntries(Object.entries(next).filter(([, message]) => message));
  };

  // inputVersionRef là số đếm mỗi lần người dùng chạm vào form. handleEstimate
  // ghi lại số này lúc gửi đi và so lại lúc nhận về, nên kết quả của một lần
  // ước tính đã cũ sẽ bị bỏ thay vì đè lên thứ người dùng vừa gõ.
  const updateInput = (field: "mealName" | "portion" | "details", value: string) => {
    if (field === "mealName") setMealName(value);
    if (field === "portion") setPortion(value);
    if (field === "details") setDetails(value);
    inputVersionRef.current += 1;
    if (hasAnyNutrition(nutritionValues)) {
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setNutritionSource("manual");
      setEstimateDescription("");
    }
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    }));
    setEstimateError("");
    setSaveError("");
  };

  // Sửa tay một ô số. Nhãn nguồn chuyển sang ai_adjusted nếu số gốc do AI đưa ra,
  // để bản ghi nói thật rằng con số đã bị người dùng chỉnh lại.
  const updateNutrition = (field: "calories" | "protein" | "carbs" | "fat", value: string) => {
    if (field === "calories") setCalories(value);
    if (field === "protein") setProtein(value);
    if (field === "carbs") setCarbs(value);
    if (field === "fat") setFat(value);
    inputVersionRef.current += 1;
    setNutritionSource((current) => current === "manual" ? "manual" : "ai_adjusted");
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError("");
  };

  const handleBlur = (field: Field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    const nutritionField = ["calories", "protein", "carbs", "fat"].includes(field);
    setErrors(validate(nutritionField || completeNutrition));
  };

  // BƯỚC 4 CỦA LUỒNG. Người dùng bấm Ước tính lại.
  // So inputVersionRef trước khi điền: người dùng gõ tiếp trong lúc chờ thì
  // kết quả này đã thuộc về một món khác nên phải bỏ đi.
  const handleEstimate = async () => {
    if (isEstimating || !token) return;
    setTouched((current) => ({ ...current, mealName: true, portion: true }));
    const inputErrors = validate(false);
    setErrors(inputErrors);
    if (Object.keys(inputErrors).length) return;

    const requested = {
      name: mealName.trim(),
      portion: portion.trim(),
      details: details.trim(),
    };
    const requestVersion = inputVersionRef.current;
    setIsEstimating(true);
    setEstimateError("");
    setSaveError("");
    try {
      const estimate = await estimateNutrition({
        items: [{ ...requested, details: requested.details || undefined }],
      }, token, resolveLanguage(user?.language));
      if (inputVersionRef.current !== requestVersion) return;
      setCalories(String(estimate.items[0].calories));
      setProtein(String(estimate.items[0].protein));
      setCarbs(String(estimate.items[0].carbs));
      setFat(String(estimate.items[0].fat));
      setEstimateDescription(estimate.items[0].portionDescription);
      setNutritionSource("ai_estimate");
      setShowNutritionFields(false);
      setErrors({});
    } catch (error) {
      if (__DEV__) console.warn("Nutrition estimate failed", error);
      setEstimateError(t.meals.estimateFailed);
    } finally {
      setIsEstimating(false);
    }
  };

  // BƯỚC 5 CỦA LUỒNG. Người dùng bấm Lưu.
  const handleSave = async () => {
    if (isSaving || !id) return;
    setTouched({ mealName: true, portion: true, details: true, calories: true, protein: true, carbs: true, fat: true });
    const nextErrors = validate(true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    setSaveError("");
    try {
      await updateMeal(id, {
        name: mealName.trim(),
        calories: parseDecimal(calories),
        protein: parseDecimal(protein),
        carbs: parseDecimal(carbs),
        fat: parseDecimal(fat),
        mealType,
        portionText: portion.trim(),
        nutritionSource,
        note: details.trim(),
      });
      router.back();
    } catch (error) {
      setSaveError(getUserErrorMessage(error, t, t.meals.saveChangesFailed));
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t.meals.deleteMealTitle, t.meals.deleteMealMsg(mealName), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          await deleteMeal(id);
          if (router.canDismiss()) router.dismiss(2);
          else router.replace("/meals/history");
        },
      },
    ]);
  };

  const sourceLabel = nutritionSourceLabel(nutritionSource, t);

  if (!meal) {
    return <Screen><AppText variant="muted">{t.meals.mealNotFound}</AppText></Screen>;
  }

  return (
    <Screen padded={false} keyboard dismissKeyboardOnTap={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t.meals.editTitle}
          right={
            <Pressable onPress={handleDelete} style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}>
              <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
              <AppText style={styles.deleteText}>{t.common.delete}</AppText>
            </Pressable>
          }
        />

        <MealTypeSelector value={mealType} onChange={setMealType} />

        <Card style={styles.formCard}>
          <View style={styles.formFields}>
            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.mealName}
                placeholder={t.meals.mealNamePlaceholder}
                value={mealName}
                onChangeText={(value) => updateInput("mealName", value)}
                textContentType="none"
                maxLength={INPUT_LIMITS.MEAL_NAME}
                inputProps={{ onBlur: () => handleBlur("mealName") }}
              />
              {touched.mealName && errors.mealName && <AppText style={styles.error}>{errors.mealName}</AppText>}
            </View>

            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.portionConsumed}
                placeholder={t.meals.portionConsumedPlaceholder}
                value={portion}
                onChangeText={(value) => updateInput("portion", value)}
                textContentType="none"
                maxLength={INPUT_LIMITS.PORTION_TEXT}
                showCounter
                inputProps={{ onBlur: () => handleBlur("portion") }}
              />
              {touched.portion && errors.portion && <AppText style={styles.error}>{errors.portion}</AppText>}
            </View>

            <View style={styles.fieldWrap}>
              <TextField
                label={t.meals.ingredientsCooking}
                placeholder={t.meals.ingredientsCookingPlaceholder}
                value={details}
                onChangeText={(value) => updateInput("details", value)}
                textContentType="none"
                inputStyle={styles.detailsInput}
                maxLength={INPUT_LIMITS.MEAL_DETAILS}
                showCounter
                inputProps={{ multiline: true, onBlur: () => handleBlur("details") }}
              />
              <AppText variant="subtle" style={styles.fieldHint}>{t.meals.ingredientsCookingHint}</AppText>
            </View>

            {completeNutrition && (
              <NutritionResultCard
                sourceLabel={sourceLabel}
                approximate={approximate}
                calories={calories}
                protein={protein}
                carbs={carbs}
                fat={fat}
                description={estimateDescription}
                disclaimer={approximate ? t.meals.estimateDisclaimer : undefined}
              />
            )}

            {showNutritionFields && (
              <NutritionManualFields
                values={{ calories, protein, carbs, fat }}
                onChange={updateNutrition}
                onBlur={handleBlur}
                errorFor={(field) => touched[field] ? errors[field] : undefined}
              />
            )}

            <View style={styles.itemActions}>
              <Button
                title={isEstimating
                  ? t.meals.estimatingNutrition
                  : showNutritionFields && nutritionSource === "manual"
                    ? t.meals.estimateWithAi
                    : completeNutrition ? t.meals.estimateAgain : t.meals.estimateNutrition}
                left={<Ionicons name="sparkles-outline" size={18} color="#fff" />}
                disabled={isEstimating}
                onPress={handleEstimate}
              />
              <Pressable
                onPress={() => setShowNutritionFields((visible) => !visible)}
                style={({ pressed }) => [styles.manualButton, pressed && styles.pressed]}
              >
                <Ionicons
                  name={showNutritionFields ? "chevron-up-outline" : completeNutrition ? "options-outline" : "keypad-outline"}
                  size={18}
                  color={theme.colors.primary}
                />
                <AppText style={styles.actionText}>
                  {showNutritionFields ? t.meals.hideNutrition : completeNutrition ? t.meals.adjustNutrition : t.meals.enterNutritionManually}
                </AppText>
              </Pressable>
            </View>
            {estimateError ? <AppText style={styles.error}>{estimateError}</AppText> : null}
          </View>
        </Card>

        {saveError ? <AppText style={styles.error}>{saveError}</AppText> : null}

        <View style={styles.actions}>
          <Button
            title={isSaving ? t.common.saving : t.meals.saveChanges}
            size="lg"
            left={<Ionicons name="checkmark" size={19} color="#fff" />}
            disabled={!completeNutrition || Object.keys(validate(true)).length > 0 || isSaving || isEstimating}
            onPress={handleSave}
          />
          <Button
            title={t.common.cancel}
            variant="secondary"
            size="lg"
            left={<Ionicons name="close" size={19} color={theme.colors.primary} />}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  actions: { gap: 10 },
  pressed: { opacity: 0.65 },
  deleteBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(229,72,77,0.1)",
  },
  deleteBtnPressed: { backgroundColor: "rgba(229,72,77,0.2)" },
  deleteText: { fontSize: 13, fontWeight: "700", color: theme.colors.danger },
  formCard: { padding: theme.space.xl },
  formFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  detailsInput: { paddingTop: 6 },
  fieldHint: { fontSize: 12, lineHeight: 18 },
  manualButton: {
    minHeight: 46, borderRadius: theme.radius.button, backgroundColor: theme.colors.tint,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  itemActions: { gap: theme.space.sm },
  actionText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700" },
  error: { fontSize: 12, color: theme.colors.danger },
});
