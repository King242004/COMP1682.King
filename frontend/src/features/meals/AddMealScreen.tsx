// ═══ FILE NÀY LÀM GÌ ═══
// Màn Thêm bữa ăn.
//
// Ai gọi tới: TabBar, Trang chủ, màn Quét, thẻ gợi ý món, bài Community,
//             và nút ghi lại món cũ
// Nhận vào:   tên món và khẩu phần người dùng gõ, hoặc dữ liệu điền sẵn
//             truyền qua tham số route
// Trả ra:     không trả gì, lưu xong thì quay lại đúng màn trước đó
// Khi lỗi:    AI hết lượt thì báo và vẫn cho gõ tay số dinh dưỡng.
//             Chưa chọn buổi ăn hoặc chưa đủ số thì nút Lưu bị khóa.
//
// Vào màn này bằng hai cách. Cờ isPrefilled ở dưới cho biết đang là cách nào.
//   Gõ tay    TabBar hoặc Trang chủ mở /meals/add mà không kèm gì, form trống
//   Có sẵn    ScanScreen, PostDetailScreen, MealDetailScreen hoặc
//             SuggestMealCard gửi kèm tên món và bốn số, form điền sẵn
//
// Gõ tay xong bấm Ước tính thì đi:
//   src/features/scan/scanApi.ts → src/utils/apiClient.ts
//   → backend/src/routes/scanRoutes.js → backend/src/controllers/scanController.js
//   → tra đệm 30 ngày, không có mới gọi Gemini
//   Vào bằng cách Có sẵn thì bỏ qua đoạn này, vì số đã có rồi.
//
// Bấm Lưu thì đi, vào bằng cách nào cũng chung đường này:
//   src/features/meals/MealsContext.tsx → src/features/meals/mealsApi.ts
//   → src/utils/apiClient.ts → backend/src/routes/mealRoutes.js
//   → backend/src/controllers/mealController.js → backend/src/models/Meal.js
//
// Một lần lưu ghi được tối đa 8 món, nên mọi thứ đều theo danh sách items
// chứ không phải một món đơn lẻ.
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import type { NutritionSource } from "@/features/meals/mealTypes";
import { estimateNutrition } from "@/features/scan/scanApi";
import { MealTypeSelector } from "@/features/meals/MealTypeSelector";
import { useT } from "@/i18n";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";
import { type MealTypeKey } from "@/features/meals/mealTypeDisplay";
import { theme } from "@/ui/theme";
import { dateKey } from "@/utils/dateUtils";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { hasAnyNutrition, hasCompleteNutrition, isApproximateSource, nutritionNumberError, nutritionSourceLabel, recentUniqueMeals, similarRecentMealName } from "@/features/meals/mealHelpers";
import { NutritionManualFields, NutritionResultCard, NutritionSummary } from "@/features/meals/NutritionFields";
import { parseDecimal } from "@/utils/numberUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { INPUT_LIMITS } from "@/config/inputLimits";

type DraftMeal = {
  id: number;
  name: string;
  portion: string;
  details: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  estimateDescription: string;
  nutritionSource: NutritionSource;
  showNutritionFields: boolean;
};

type DraftField = "name" | "portion" | "details" | "calories" | "protein" | "carbs" | "fat";
type FieldErrors = Record<string, string | undefined>;

// Khóa của một ô nhập, kiểu "1:name", để phân biệt ô tên món 1 với ô tên món 2
const fieldKey = (id: number, field: DraftField) => `${id}:${field}`;

// Quyết định thẻ "AI ước tính" hay "Quét ảnh" hiện lên trên màn
function nutritionSourceFromParam(source: string | undefined, isPrefilled: boolean): NutritionSource {
  if (source === "photo") return "photo_scan";
  if (source === "barcode") return "barcode";
  if (source === "community") return "community";
  if (source === "repeat") return "repeat";
  if (source === "suggest" || source === "coach") return "ai_suggestion";
  return isPrefilled ? "photo_scan" : "manual";
}

export default function AddMealScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { addMeals, historyMeals, fetchMealHistory } = useMeals();
  const t = useT();
  const locale = localeTag(resolveLanguage(user?.language));
  // Mã món tiếp theo khi bấm thêm dòng, bắt đầu từ 2 vì món đầu luôn là 1
  const nextItemId = useRef(2);
  // Hứng dữ liệu màn khác gửi sang
  const {
    mealType: defaultType,
    date: dateParam,
    prefillName,
    prefillCalories,
    prefillProtein,
    prefillCarbs,
    prefillFat,
    prefillAmount,
    prefillUnit,
    prefillPortion,
    prefillNote,
    source,
  } = useLocalSearchParams<{
    mealType?: MealTypeKey;
    date?: string;
    prefillName?: string;
    prefillCalories?: string;
    prefillProtein?: string;
    prefillCarbs?: string;
    prefillFat?: string;
    prefillAmount?: string;
    prefillUnit?: string;
    prefillPortion?: string;
    prefillNote?: string;
    source?: string;
  }>();

  const todayStr = dateKey(new Date());
  const logDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam <= todayStr
    ? dateParam
    : todayStr;
  const isBackdated = logDate !== todayStr;
  const isPrefilled = !!prefillName;
  const isFromCommunity = source === "community";
  const isFromRepeat = source === "repeat";
  const isFromPhoto = source === "photo";
  const isFromBarcode = source === "barcode";
  const isFromSuggestion = source === "suggest" || source === "coach";
  const isFromScan = isFromPhoto || isFromBarcode || (isPrefilled && !isFromSuggestion && !isFromCommunity && !isFromRepeat);

  // Khẩu phần ban đầu, ưu tiên chuỗi có sẵn rồi mới tới mặc định 1 phần
  const initialPortion = () => {
    if (prefillPortion) return prefillPortion;
    // Đường lùi cho bản cũ, hồi đó khẩu phần tách làm hai tham số số và đơn vị
    const legacyPortion = [prefillAmount, prefillUnit].filter(Boolean).join(" ").trim();
    return legacyPortion || (prefillName && !isFromCommunity ? `1 ${t.meals.servingUnit}` : "");
  };
  // Form TRỐNG cho người dùng gõ, hoặc form ĐIỀN SẴN nếu vào từ màn khác
  const initialItem = (): DraftMeal => ({
    id: 1,
    name: prefillName ?? "",
    portion: initialPortion(),
    details: prefillNote ?? "",
    calories: prefillCalories ?? "",
    protein: prefillProtein ?? "",
    carbs: prefillCarbs ?? "",
    fat: prefillFat ?? "",
    estimateDescription: "",
    nutritionSource: nutritionSourceFromParam(source, isPrefilled),
    showNutritionFields: false,
  });

  // Danh sách món đang gõ và buổi ăn
  const [items, setItems] = useState<DraftMeal[]>(() => [initialItem()]);
  const [mealType, setMealType] = useState<MealTypeKey | null>(defaultType ?? null);

  // Câu lỗi đỏ dưới ô nhập
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [estimateError, setEstimateError] = useState<{ id: number; message: string } | null>(null);
  const [saveError, setSaveError] = useState("");

  // Trạng thái đang chờ, dùng để khóa nút
  const [estimatingItemId, setEstimatingItemId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Màn khác gửi món sang thì dựng lại form từ đầu
  // Không có khối này thì món từ Community bị dính calo của lần quét trước
  useEffect(() => {
    nextItemId.current = 2;
    setItems([initialItem()]);
    setMealType(defaultType ?? null);
    setErrors({});
    setTouched({});
    setEstimateError(null);
    setSaveError("");
  // Danh sách phụ thuộc chỉ liệt kê tham số route, cố ý bỏ initialItem ra ngoài
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultType, prefillName, prefillCalories, prefillProtein, prefillCarbs, prefillFat,
    prefillAmount, prefillUnit, prefillPortion, prefillNote, source, t.meals.servingUnit,
  ]);

  // Tải lịch sử món cho phần chọn nhanh, màn khác gửi sang thì không cần
  useEffect(() => {
    if (!isPrefilled) void fetchMealHistory().catch(() => {});
  }, [fetchMealHistory, isPrefilled]);

  // Vài món gần đây để bấm một cái là điền sẵn, khỏi gõ lại
  const recentDishes = useMemo(
    () => recentUniqueMeals(historyMeals, 4).map((meal) => ({
      name: meal.name,
      portion: meal.portionText || [meal.portionAmount, meal.portionUnit].filter(Boolean).join(" ") || `1 ${t.meals.servingUnit}`,
      details: meal.note ?? "",
      calories: meal.calories,
      protein: meal.protein ?? 0,
      carbs: meal.carbs ?? 0,
      fat: meal.fat ?? 0,
    })),
    [historyMeals, t.meals.servingUnit],
  );
  // Danh sách tên món gần đây, dùng cho phần gợi ý khi đang gõ
  const recentNameOptions = useMemo(() => recentUniqueMeals(historyMeals, 20), [historyMeals]);

  // Kiểm MỘT món, requireNutrition bật khi bấm Lưu và tắt khi bấm Ước tính
  const collectItemErrors = (item: DraftMeal, requireNutrition: boolean) => {
    const next: FieldErrors = {};
    // Trần độ dài do maxLength của từng ô lo rồi nên ở đây không kiểm lại
    if (item.name.trim().length < 2) next[fieldKey(item.id, "name")] = t.meals.nameMin;
    if (!item.portion.trim()) next[fieldKey(item.id, "portion")] = t.meals.portionConsumedRequired;
    if (requireNutrition) {
      next[fieldKey(item.id, "calories")] = nutritionNumberError(item.calories, t.meals.calories, t, false);
      next[fieldKey(item.id, "protein")] = nutritionNumberError(item.protein, t.labels.protein, t);
      next[fieldKey(item.id, "carbs")] = nutritionNumberError(item.carbs, t.labels.carbs, t);
      next[fieldKey(item.id, "fat")] = nutritionNumberError(item.fat, t.labels.fat, t);
    }
    return Object.fromEntries(Object.entries(next).filter(([, message]) => message));
  };

  // Kiểm CẢ danh sách món, gom lỗi của từng món lại thành một
  const collectErrors = (requireNutrition: boolean) => Object.assign(
    {},
    ...items.map((item) => collectItemErrors(item, requireNutrition)),
  );

  // Đánh dấu ô đã đụng vào, chưa đụng thì không hiện lỗi đỏ
  const touchFields = (fields: DraftField[]) => {
    const next: Record<string, boolean> = {};
    items.forEach((item) => fields.forEach((field) => { next[fieldKey(item.id, field)] = true; }));
    setTouched((current) => ({ ...current, ...next }));
  };

  // Gõ đổi tên hoặc khẩu phần thì xóa số cũ, vì số đó thuộc về món khác rồi
  const updateInput = (id: number, field: "name" | "portion" | "details", value: string) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const clearEstimate = hasAnyNutrition(item);
      return {
        ...item,
        [field]: value,
        ...(clearEstimate ? {
          calories: "", protein: "", carbs: "", fat: "", estimateDescription: "",
          nutritionSource: "manual" as NutritionSource,
        } : {}),
      };
    }));
    setErrors((current) => ({ ...current, [fieldKey(id, field)]: undefined }));
    setEstimateError(null);
    setSaveError("");
  };

  // Người dùng sửa tay số của AI thì nhãn nguồn đổi thành ai_adjusted
  const updateNutrition = (id: number, field: "calories" | "protein" | "carbs" | "fat", value: string) => {
    setItems((current) => current.map((item) => item.id === id ? {
      ...item,
      [field]: value,
      nutritionSource: item.nutritionSource === "manual" ? "manual" : "ai_adjusted",
    } : item));
    setErrors((current) => ({ ...current, [fieldKey(id, field)]: undefined }));
    setSaveError("");
  };

  // Rời khỏi một ô thì mới kiểm ô đó, không kiểm lúc đang gõ dở
  const handleBlur = (id: number, field: DraftField) => {
    setTouched((current) => ({ ...current, [fieldKey(id, field)]: true }));
    const item = items.find((draft) => draft.id === id);
    // Rời ô chữ thì chỉ kiểm phần số khi bốn ô đã đầy, kẻo món dở đã báo đỏ
    const nutritionField = ["calories", "protein", "carbs", "fat"].includes(field);
    if (item) setErrors((current) => ({ ...current, ...collectItemErrors(item, nutritionField || hasCompleteNutrition(item)) }));
  };

  // Thêm một món trống vào cuối, trần 8 món khớp mealInputValidator bên backend
  const addItem = () => {
    if (items.length >= 8) return;
    setItems((current) => [...current, {
      id: nextItemId.current++,
      name: "", portion: "", details: "", calories: "", protein: "", carbs: "", fat: "",
      estimateDescription: "", nutritionSource: "manual", showNutritionFields: false,
    }]);
    setEstimateError(null);
    setSaveError("");
  };

  // Xóa một món và dọn câu lỗi của nó, không cho xóa món cuối cùng
  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${id}:`))));
    setEstimateError(null);
    setSaveError("");
  };

  // ══════════════════════════════════════════════════════════
  // Bấm Ước tính, gửi tên món lên AI lấy số
  // Chỉ dùng khi gõ tay, vì màn khác gửi sang thì đã có sẵn số
  // ══════════════════════════════════════════════════════════

  // Mỗi lúc chỉ cho ước tính một món, vì mỗi lượt gọi tốn một lượt AI
  const handleEstimate = async (id: number) => {
    const item = items.find((draft) => draft.id === id);
    if (!item || estimatingItemId !== null) return;
    setTouched((current) => ({
      ...current,
      [fieldKey(id, "name")]: true,
      [fieldKey(id, "portion")]: true,
    }));
    // Kiểm tại máy trước, thiếu là dừng luôn, đỡ tốn một lượt AI
    const inputErrors = collectItemErrors(item, false);
    setErrors((current) => ({ ...current, ...inputErrors }));
    if (Object.keys(inputErrors).length || !token) return;

    setEstimatingItemId(id);
    setEstimateError(null);
    setSaveError("");
    try {
      const requested = {
        name: item.name.trim(),
        portion: item.portion.trim(),
        details: item.details.trim(),
      };
      // Đi tiếp: src/features/scan/scanApi.ts
      const estimate = await estimateNutrition({
        items: [{ ...requested, details: requested.details || undefined }],
      }, token, resolveLanguage(user?.language));
      // Số về thì điền vào bốn ô và dán nhãn ai_estimate
      // So lại tên với khẩu phần trước khi điền, gõ đổi trong lúc chờ thì bỏ
      setItems((current) => current.map((draft) => {
        if (draft.id !== id || draft.name.trim() !== requested.name || draft.portion.trim() !== requested.portion || draft.details.trim() !== requested.details)
          return draft;
        return {
          ...draft,
          calories: String(estimate.items[0].calories),
          protein: String(estimate.items[0].protein),
          carbs: String(estimate.items[0].carbs),
          fat: String(estimate.items[0].fat),
          estimateDescription: estimate.items[0].portionDescription,
          nutritionSource: "ai_estimate",
          showNutritionFields: false,
        };
      }));
      setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${id}:`))));
    } catch (error) {
      if (__DEV__) console.warn("Nutrition estimate failed", error);
      setEstimateError({ id, message: t.meals.estimateFailed });
    } finally {
      setEstimatingItemId(null);
    }
  };

  // ══════════════════════════════════════════════════════════
  // Bấm Lưu, ghi món xuống database
  // Gõ tay hay màn khác gửi sang thì cũng đều xuống đây
  // ══════════════════════════════════════════════════════════

  // Kiểm cả danh sách items tại máy trước, sai một món là dừng luôn
  const handleSave = async () => {
    if (isSaving || !mealType) return;
    touchFields(["name", "portion", "calories", "protein", "carbs", "fat"]);
    const allErrors = collectErrors(true);
    setErrors(allErrors);
    if (Object.keys(allErrors).length) return;

    setIsSaving(true);
    setSaveError("");
    try {
      // Đi tiếp: src/features/meals/MealsContext.tsx
      // Dòng này chạy xong nghĩa là món đã nằm trong database rồi
      await addMeals(items.map((item) => ({
        name: item.name.trim(),
        calories: parseDecimal(item.calories),
        protein: parseDecimal(item.protein),
        carbs: parseDecimal(item.carbs),
        fat: parseDecimal(item.fat),
        portionText: item.portion.trim(),
        nutritionSource: item.nutritionSource,
        mealType,
        date: logDate,
        note: item.details.trim() || undefined,
      })));
      // Quay lại màn trước, màn Quét đã bị replace khỏi ngăn xếp nên không rơi lại camera
      router.back();
    } catch (error) {
      setSaveError(getUserErrorMessage(error, t, t.meals.saveFailed));
      setIsSaving(false);
    }
  };

  // Bấm một món gần đây thì điền hết tên và số, dán nhãn nguồn repeat
  const fillSuggestion = (suggestion: typeof recentDishes[number]) => {
    setItems([{
      id: 1,
      name: suggestion.name,
      portion: suggestion.portion,
      details: suggestion.details,
      calories: String(suggestion.calories),
      protein: String(suggestion.protein),
      carbs: String(suggestion.carbs),
      fat: String(suggestion.fat),
      estimateDescription: "",
      nutritionSource: "repeat",
      showNutritionFields: false,
    }]);
    nextItemId.current = 2;
    setErrors({});
    setTouched({});
    setEstimateError(null);
  };

  // Tổng của các món đang gõ, chỉ để XEM TRƯỚC, tổng thật do backend cộng
  const totals = useMemo(() => items.reduce((sum, item) => ({
    calories: sum.calories + (parseDecimal(item.calories) || 0),
    protein: Math.round((sum.protein + (parseDecimal(item.protein) || 0)) * 10) / 10,
    carbs: Math.round((sum.carbs + (parseDecimal(item.carbs) || 0)) * 10) / 10,
    fat: Math.round((sum.fat + (parseDecimal(item.fat) || 0)) * 10) / 10,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [items]);
  const allItemsHaveNutrition = items.every(hasCompleteNutrition);
  const totalIsApproximate = items.some((item) => isApproximateSource(item.nutritionSource));
  const totalSource = items.every((item) => item.nutritionSource === items[0].nutritionSource)
    ? items[0].nutritionSource
    : null;
  const backdatedLabel = new Date(`${logDate}T00:00:00`).toLocaleDateString(locale, {
    weekday: "long", month: "short", day: "numeric",
  });
  // Đổi mã nguồn thành chữ hiện cho người dùng đọc
  const sourceLabel = (sourceValue: NutritionSource) => nutritionSourceLabel(sourceValue, t);

  return (
    <Screen padded={false} keyboard dismissKeyboardOnTap={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title={isFromScan ? t.meals.confirmScan : t.meals.addTitle} />
          <AppText variant="muted" style={styles.subtitle}>
            {isFromScan ? t.meals.subtitleScan
              : isFromCommunity ? t.meals.subtitleCommunity
              : isFromRepeat ? t.meals.subtitleRepeat
              : isPrefilled ? t.meals.subtitleSuggest
              : isBackdated ? t.meals.subtitleBackdate
              : t.meals.subtitleToday}
          </AppText>
        </View>

        {/* Dải xanh nhắc đang ghi cho ngày cũ, chỉ hiện khi chọn ngày quá khứ */}
        {isBackdated && (
          <View style={styles.backdateBanner}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.backdateText}>
              {t.meals.loggingFor} <AppText style={styles.backdateDate}>{backdatedLabel}</AppText>
            </AppText>
          </View>
        )}

        {/* Dải xanh báo món đến từ đâu, gõ tay thì KHÔNG có dải này */}
        {isPrefilled && (
          <View style={styles.sourceBanner}>
            <Ionicons name={isFromCommunity ? "people-outline" : isFromRepeat ? "repeat-outline" : "sparkles-outline"} size={18} color={theme.colors.accent} />
            <View style={styles.flex1}>
              <AppText style={styles.sourceBannerTitle}>
                {isFromBarcode ? t.meals.sourceBarcode
                  : isFromScan ? t.meals.badgeScan
                  : isFromCommunity ? t.meals.badgeCommunity
                  : isFromRepeat ? t.meals.badgeRepeat
                  : t.meals.badgeSuggest}
              </AppText>
              <AppText variant="subtle" style={styles.sourceBannerSub}>{t.meals.badgeSub}</AppText>
            </View>
          </View>
        )}

        {/* Bốn nút chọn buổi ăn, chưa chọn thì nút Lưu bị khóa */}
        <MealTypeSelector value={mealType} onChange={setMealType} />

        {/* Bốn thẻ món gần đây, bấm một cái là điền sẵn, chỉ hiện khi gõ tay */}
        {!isPrefilled && items.length === 1 && !items[0].name.trim() && recentDishes.length > 0 && (
          <View style={styles.suggestBlock}>
            <AppText variant="h2" style={styles.suggestTitle}>{t.meals.recent}</AppText>
            <View style={styles.suggestWrap}>
              {recentDishes.map((suggestion) => (
                <Pressable key={suggestion.name} onPress={() => fillSuggestion(suggestion)} style={({ pressed }) => [styles.suggestChip, pressed && styles.pressed]}>
                  <AppText style={styles.suggestName} numberOfLines={1}>{suggestion.name}</AppText>
                  <AppText variant="subtle" style={styles.suggestPortion} numberOfLines={1}>{suggestion.portion}</AppText>
                  <AppText style={styles.suggestKcal}>{suggestion.calories} {t.common.kcal}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Thẻ form của từng món, tối đa 8 thẻ, trống hay điền sẵn tùy cách vào */}
        {items.map((item, index) => {
          const completeNutrition = hasCompleteNutrition(item);
          const approximate = isApproximateSource(item.nutritionSource);
          const nameSuggestion = completeNutrition ? undefined : similarRecentMealName(item.name, recentNameOptions);
          return (
            <View key={item.id} style={styles.itemBlock}>
              {items.length > 1 && (
                <View style={styles.itemHeader}>
                  <AppText variant="h2" style={styles.itemTitle}>{t.meals.mealItem(index + 1)}</AppText>
                  <Pressable
                    onPress={() => removeItem(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t.meals.removeMealItem}
                    hitSlop={8}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  </Pressable>
                </View>
              )}

              <Card style={styles.formCard}>
                <View style={styles.formFields}>
                  <View style={styles.fieldWrap}>
                    <TextField
                      label={t.meals.mealName}
                      placeholder={t.meals.mealNamePlaceholder}
                      value={item.name}
                      onChangeText={(value) => updateInput(item.id, "name", value)}
                      textContentType="none"
                      maxLength={INPUT_LIMITS.MEAL_NAME}
                      inputProps={{ onBlur: () => handleBlur(item.id, "name") }}
                    />
                    {touched[fieldKey(item.id, "name")] && errors[fieldKey(item.id, "name")] && (
                      <AppText style={styles.error}>{errors[fieldKey(item.id, "name")]}</AppText>
                    )}
                    {nameSuggestion && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => updateInput(item.id, "name", nameSuggestion.name)}
                        style={({ pressed }) => [styles.nameSuggestion, pressed && styles.pressed]}
                      >
                        <Ionicons name="return-down-forward-outline" size={16} color={theme.colors.primary} />
                        <AppText style={styles.nameSuggestionText}>{t.meals.didYouMean(nameSuggestion.name)}</AppText>
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <TextField
                      label={t.meals.portionConsumed}
                      placeholder={t.meals.portionConsumedPlaceholder}
                      value={item.portion}
                      onChangeText={(value) => updateInput(item.id, "portion", value)}
                      textContentType="none"
                      maxLength={INPUT_LIMITS.PORTION_TEXT}
                      showCounter
                      inputProps={{ onBlur: () => handleBlur(item.id, "portion") }}
                    />
                    {touched[fieldKey(item.id, "portion")] && errors[fieldKey(item.id, "portion")] && (
                      <AppText style={styles.error}>{errors[fieldKey(item.id, "portion")]}</AppText>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <TextField
                      label={t.meals.ingredientsCooking}
                      placeholder={t.meals.ingredientsCookingPlaceholder}
                      value={item.details}
                      onChangeText={(value) => updateInput(item.id, "details", value)}
                      textContentType="none"
                      inputStyle={styles.detailsInput}
                      maxLength={INPUT_LIMITS.MEAL_DETAILS}
                      showCounter
                      inputProps={{ multiline: true, onBlur: () => handleBlur(item.id, "details") }}
                    />
                    <AppText variant="subtle" style={styles.fieldHint}>{t.meals.ingredientsCookingHint}</AppText>
                  </View>

                  {/* Thẻ kết quả bốn số, chỉ hiện khi món đã đủ dinh dưỡng */}
                  {completeNutrition && (
                    <NutritionResultCard
                      sourceLabel={sourceLabel(item.nutritionSource)}
                      approximate={approximate}
                      calories={item.calories}
                      protein={item.protein}
                      carbs={item.carbs}
                      fat={item.fat}
                      description={item.estimateDescription}
                    />
                  )}

                  {/* Bốn ô calo, đạm, tinh bột, chất béo cho gõ tay */}
                  {item.showNutritionFields && (
                    <NutritionManualFields
                      values={{ calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }}
                      onChange={(field, value) => updateNutrition(item.id, field, value)}
                      onBlur={(field) => handleBlur(item.id, field)}
                      errorFor={(field) => touched[fieldKey(item.id, field)] ? errors[fieldKey(item.id, field)] : undefined}
                    />
                  )}

                  {/* Nút Ước tính và nút mở ô gõ tay, nằm cuối mỗi thẻ món */}
                  <View style={styles.itemActions}>
                    <Button
                      title={estimatingItemId === item.id
                        ? t.meals.estimatingNutrition
                        : item.showNutritionFields && item.nutritionSource === "manual"
                          ? t.meals.estimateWithAi
                          : completeNutrition ? t.meals.estimateAgain : t.meals.estimateNutrition}
                      left={<Ionicons name="sparkles-outline" size={18} color="#fff" />}
                      disabled={estimatingItemId !== null}
                      onPress={() => handleEstimate(item.id)}
                    />
                    <Pressable
                      onPress={() => setItems((current) => current.map((draft) => draft.id === item.id
                        ? { ...draft, showNutritionFields: !draft.showNutritionFields }
                        : draft))}
                      style={({ pressed }) => [styles.manualButton, pressed && styles.pressed]}
                    >
                      <Ionicons
                        name={item.showNutritionFields ? "chevron-up-outline" : completeNutrition ? "options-outline" : "keypad-outline"}
                        size={18}
                        color={theme.colors.primary}
                      />
                      <AppText style={styles.actionText}>
                        {item.showNutritionFields
                          ? t.meals.hideNutrition
                          : completeNutrition ? t.meals.adjustNutrition : t.meals.enterNutritionManually}
                      </AppText>
                    </Pressable>
                  </View>
                  {estimateError?.id === item.id ? <AppText style={styles.error}>{estimateError.message}</AppText> : null}
                </View>
              </Card>
            </View>
          );
        })}

        {/* Nút thêm dòng món, biến mất khi đã đủ 8 món */}
        {items.length < 8 && (
          <Pressable onPress={addItem} style={({ pressed }) => [styles.addItemButton, pressed && styles.pressed]}>
            <Ionicons name="add-circle-outline" size={19} color={theme.colors.primary} />
            <AppText style={styles.actionText}>{t.meals.addMealItem}</AppText>
          </Pressable>
        )}

        {/* Thẻ Tổng, chỉ hiện khi mọi món đã đủ bốn số */}
        {allItemsHaveNutrition && (
          <Card style={styles.totalCard}>
            <View style={styles.totalHeader}>
              <AppText variant="h2">{t.meals.mealNutritionTotal}</AppText>
              {totalSource && (
                <View style={styles.sourceBadge}><AppText style={styles.sourceText}>{sourceLabel(totalSource)}</AppText></View>
              )}
            </View>
            <NutritionSummary
              approximate={totalIsApproximate}
              calories={Math.round(totals.calories)}
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
              disclaimer={totalIsApproximate ? t.meals.estimateDisclaimer : undefined}
            />
          </Card>
        )}

        {saveError ? <AppText style={styles.error}>{saveError}</AppText> : null}

        {/* Nút Lưu và nút Hủy, Lưu bị khóa khi chưa chọn buổi ăn hoặc thiếu số */}
        <View style={styles.actions}>
          <Button
            title={isSaving ? t.common.saving : t.meals.saveMeal}
            size="lg"
            left={<Ionicons name="checkmark" size={19} color="#fff" />}
            disabled={!mealType || !allItemsHaveNutrition || isSaving}
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
  flex1: { flex: 1 },
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  subtitle: { marginTop: -8 },
  actions: { gap: 10 },
  pressed: { opacity: 0.65 },
  backdateBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(8,145,178,0.08)",
    borderColor: "rgba(8,145,178,0.2)", borderWidth: 1, borderRadius: 12, padding: theme.space.md,
  },
  backdateText: { fontSize: 13, color: theme.colors.muted, flex: 1 },
  backdateDate: { fontSize: 13, fontWeight: "800", color: theme.colors.primary },
  sourceBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(5,150,105,0.08)",
    borderColor: "rgba(5,150,105,0.2)", borderWidth: 1, borderRadius: 12, padding: theme.space.md,
  },
  sourceBannerTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.accent },
  sourceBannerSub: { fontSize: 12 },
  itemBlock: { gap: theme.space.sm },
  itemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemTitle: { fontSize: 16 },
  removeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  formCard: { padding: theme.space.xl },
  formFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  detailsInput: { paddingTop: 6 },
  fieldHint: { fontSize: 12, lineHeight: 18 },
  nameSuggestion: {
    minHeight: 40, borderRadius: 10, backgroundColor: theme.colors.tint, paddingHorizontal: 12,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  nameSuggestionText: { flex: 1, color: theme.colors.primary, fontSize: 12, fontWeight: "700" },
  addItemButton: {
    minHeight: 50, borderRadius: theme.radius.button, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  manualButton: {
    minHeight: 46, borderRadius: theme.radius.button, backgroundColor: theme.colors.tint,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  itemActions: { gap: theme.space.sm },
  actionText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700" },
  sourceBadge: { backgroundColor: "rgba(5,150,105,0.10)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  sourceText: { color: theme.colors.accent, fontSize: 11, fontWeight: "700" },
  totalCard: { padding: theme.space.xl, gap: theme.space.md, borderColor: "rgba(8,145,178,0.22)", borderWidth: 1 },
  totalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  error: { fontSize: 12, color: theme.colors.danger },
  suggestBlock: { gap: theme.space.sm },
  suggestTitle: { fontSize: 15 },
  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: {
    flexBasis: "47%", flexGrow: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 3,
  },
  suggestName: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  suggestPortion: { fontSize: 11 },
  suggestKcal: { fontSize: 11, color: theme.colors.subtle },
});
