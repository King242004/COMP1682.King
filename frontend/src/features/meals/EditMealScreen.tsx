// ═══ FILE NÀY LÀM GÌ ═══
// Màn Sửa món. File BẮT ĐẦU của luồng sửa một bản ghi món đã có.
//
// Ai gọi tới: MealDetailScreen
// Nhận vào:   món cần sửa, truyền qua tham số route
// Trả ra:     không trả gì, lưu xong thì quay lại màn trước
// Khi lỗi:    sửa tên hoặc khẩu phần thì số dinh dưỡng cũ bị xóa, buộc ước tính lại
//
// Khác màn Thêm món ở ba điểm: chỉ sửa MỘT món chứ không phải cả danh sách,
// dữ liệu lấy sẵn từ MealsContext nên mở màn là thấy ngay, và có thêm nút Xóa món.
// Phần ước tính dinh dưỡng thì giống hệt, cùng gọi POST /scan/estimate.
//
// Nhớ: đổi tên hay đổi khẩu phần là XÓA SẠCH bốn số dinh dưỡng cũ.
//      Cố ý làm vậy, vì số cũ thuộc về món cũ, giữ lại là nói dối người dùng.
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

// ══════════════════════════════════════════════════════════
// SỬA MÓN
//
// Đến từ màn Chi tiết món, mã món đi theo tham số đường dẫn.
// Năm bước, đọc từ trên xuống là đúng thứ tự. Có hai chặng chờ mạng,
// một ở BƯỚC 4 gọi AI ước tính, một ở BƯỚC 5 lưu món.
// Xong thì quay về màn Chi tiết món, và món đã đổi ở cả Trang chủ lẫn Lịch sử.
// ══════════════════════════════════════════════════════════

// SỬA MÓN BƯỚC 1. Lấy mã món từ đường dẫn rồi tìm trong MealsContext.
// KHÔNG gọi mạng tải lại, nên mở màn là thấy dữ liệu ngay.
export default function EditMealScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const { meals, historyMeals, updateMeal, deleteMeal } = useMeals();
  const t = useT();
  // Tìm ở cả hai danh sách, vì màn Chi tiết món mở được từ Trang chủ lẫn từ Lịch sử.
  const meal = meals.find((item) => item.id === id) || historyMeals.find((item) => item.id === id);
  // Số đếm mỗi lần người dùng chạm vào form. BƯỚC 4 ghi lại số này lúc gửi đi
  // rồi so lại lúc nhận về, để bỏ kết quả ước tính đã cũ thay vì đè lên thứ vừa gõ.
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

  // SỬA MÓN BƯỚC 2. Đổ dữ liệu món vào form. Không ai bấm, tự chạy.
  // Chạy cả lúc mở màn lẫn lúc MealsContext.fetchMealsByDate cập nhật danh sách.
  // Xóa luôn lỗi cũ và ô nào đã chạm, coi như form vừa mở lần đầu.
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

  // Ba giá trị tính lại mỗi lần vẽ. completeNutrition quyết định có cho lưu thẳng
  // hay bắt ước tính, approximate quyết định có hiện dấu ngã trước số calo hay không.
  const nutritionValues = { calories, protein, carbs, fat };
  const completeNutrition = hasCompleteNutrition(nutritionValues);
  const approximate = isApproximateSource(nutritionSource);

  // Hàm kiểm dùng chung, gọi ở BƯỚC 4, BƯỚC 5 và mỗi lần rời một ô.
  // requireNutrition tắt lúc ước tính, vì lúc đó bốn ô số còn trống là chuyện thường.
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

  // SỬA MÓN BƯỚC 3. Người dùng gõ vào ô tên, khẩu phần hoặc mô tả.
  // Đây là chỗ XÓA SẠCH bốn số dinh dưỡng cũ, và hạ nhãn nguồn về manual.
  // Đổi từ "phở bò" sang "phở gà" mà giữ nguyên số của phở bò là con số nói dối.
  // Tăng inputVersionRef để lượt ước tính đang chờ ngoài kia biết là mình đã cũ.
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

  // Chạy khi RỜI một ô, không phải lúc đang gõ, kẻo mới gõ chữ đầu đã bị mắng.
  const handleBlur = (field: Field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    // Vừa rời một ô số thì kiểm luôn phần số. Rời ô chữ thì chỉ kiểm phần số
    // khi cả bốn ô đã đầy, kẻo form còn dở đã báo đỏ khắp nơi.
    const nutritionField = ["calories", "protein", "carbs", "fat"].includes(field);
    setErrors(validate(nutritionField || completeNutrition));
  };

  // SỬA MÓN BƯỚC 4. Người dùng bấm Ước tính lại.
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
    // Chụp lại số đếm form NGAY TRƯỚC khi gửi, để lát nữa còn so.
    const requestVersion = inputVersionRef.current;
    setIsEstimating(true);
    setEstimateError("");
    setSaveError("");
    try {
      // scanApi.estimateNutrition → POST /scan/estimate
      // → scanController.estimateNutrition; cache miss mới gọi aiClient.
      const estimate = await estimateNutrition({
        items: [{ ...requested, details: requested.details || undefined }],
      }, token, resolveLanguage(user?.language));
      // Số đếm đã đổi nghĩa là người dùng gõ tiếp trong lúc chờ.
      // Kết quả này thuộc về món cũ rồi, bỏ đi chứ đừng đè lên thứ họ vừa gõ.
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

  // SỬA MÓN BƯỚC 5. Người dùng bấm Lưu.
  // Đánh dấu chạm hết mọi ô rồi mới kiểm, để lỗi hiện đủ chứ không nhỏ giọt từng ô.
  const handleSave = async () => {
    if (isSaving || !id) return;
    setTouched({ mealName: true, portion: true, details: true, calories: true, protein: true, carbs: true, fat: true });
    const nextErrors = validate(true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    setSaveError("");
    try {
      // MealsContext.updateMeal → mealsApi.updateMealRequest → PUT /meals/:id
      // → mealController.updateMeal.
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
      // Lưu xong thì quay về màn Chi tiết món. Cố ý KHÔNG tắt isSaving ở đây,
      // vì màn đang đóng, tắt nữa là nút nhấp nháy một cái rồi mới biến mất.
      router.back();
    } catch (error) {
      setSaveError(getUserErrorMessage(error, t, t.meals.saveChangesFailed));
      setIsSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // XÓA MÓN
  //
  // Đến từ nút Xóa ở cuối màn này. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Khác nút Xóa ở màn Chi tiết món ở chỗ quay về: bên này phải nhảy lùi HAI màn.
  // ══════════════════════════════════════════════════════════

  // XÓA MÓN BƯỚC 1. Hỏi lại cho chắc. Xóa là mất hẳn, không hoàn lại được.
  const handleDelete = () => {
    Alert.alert(t.meals.deleteMealTitle, t.meals.deleteMealMsg(mealName), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          // XÓA MÓN BƯỚC 2. MealsContext.deleteMeal → mealsApi.deleteMealRequest
          // → DELETE /meals/:id → mealController.deleteMeal.
          await deleteMeal(id);
          // XÓA MÓN BƯỚC 3. Nhảy lùi HAI màn, vì màn Chi tiết món ngay phía sau
          // cũng đang xem đúng món vừa xóa, lùi một màn là rơi vào màn báo không tìm thấy.
          // Chồng màn không đủ sâu để lùi hai thì đi thẳng về màn Lịch sử.
          if (router.canDismiss()) router.dismiss(2);
          else router.replace("/meals/history");
        },
      },
    ]);
  };

  // Nhãn chữ cho nguồn số dinh dưỡng, hiện ở thẻ kết quả.
  const sourceLabel = nutritionSourceLabel(nutritionSource, t);

  // Không tìm thấy món thì dừng ở đây. Hay gặp khi món vừa bị xóa ở màn khác.
  // Nhớ: cửa chặn này phải nằm SAU mọi hook ở trên. Đặt lên đầu hàm là
  //      lần vẽ có món và lần vẽ không có món chạy số hook khác nhau, React vỡ ngay.
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
