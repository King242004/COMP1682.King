// ═══ FILE NÀY LÀM GÌ ═══
// Màn Thêm bữa ăn. File BẮT ĐẦU của luồng thêm món, một trong bốn luồng defend.
//
// Ai gọi tới: Trang chủ, màn Quét, thẻ gợi ý món, bài Community, và nút ghi
//             lại món cũ. Tổng cộng NĂM lối vào cùng dùng chung màn này.
// Nhận vào:   tên món và khẩu phần người dùng gõ, hoặc dữ liệu điền sẵn từ
//             lối vào tương ứng, truyền qua tham số route
// Trả ra:     không trả gì, lưu xong thì quay lại đúng màn trước đó
// Khi lỗi:    AI hết lượt thì báo và vẫn cho gõ tay số dinh dưỡng.
//             Chưa chọn buổi ăn hoặc chưa có đủ số thì nút Lưu bị khóa.
//
// Màn này chứa HAI luồng riêng, đánh số riêng, tìm trong file bằng chữ BƯỚC.
//
// LUỒNG ƯỚC TÍNH, chạy khi bấm nút Ước tính.
// Đường đi: FILE NÀY → scanApi → apiClient → POST /scan/estimate → scanController → Gemini
//
// LUỒNG LƯU MÓN, chạy khi bấm nút Lưu.
// Đường đi: FILE NÀY → MealsContext → mealsApi → apiClient → POST /meals/batch
//           → mealController.addMeals → mealInputValidator → model Meal → MongoDB
// Màn này còn được DÙNG LẠI cho bốn lối vào khác: quét ảnh, quét mã vạch,
// bài Community, và ghi lại món cũ. Các lối đó truyền sẵn dữ liệu qua tham số
// route, và nutritionSourceFromParam quyết định nhãn nguồn hiện lên là gì.
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
import {
  hasAnyNutrition,
  hasCompleteNutrition,
  isApproximateSource,
  nutritionNumberError,
  nutritionSourceLabel,
  recentUniqueMeals,
  similarRecentMealName,
} from "@/features/meals/mealHelpers";
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

// Dựng khóa cho một ô nhập, kiểu "1:name". Cần vì một màn có tối đa 8 món,
// nên phải phân biệt ô tên của món 1 với ô tên của món 2.
const fieldKey = (id: number, field: DraftField) => `${id}:${field}`;

// Đổi tham số route thành nhãn nguồn số liệu.
// Đây là chỗ quyết định thẻ "AI ước tính" hay "Quét ảnh" hiện lên trên màn.
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
  // Mã món tiếp theo khi bấm thêm dòng. Bắt đầu từ 2 vì món đầu luôn là 1.
  const nextItemId = useRef(2);
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

  // Đoán khẩu phần ban đầu. Lối vào nào có sẵn khẩu phần thì dùng luôn,
  // không có thì mặc định 1 phần, trừ bài Community vì bài đó thường không ghi.
  const initialPortion = () => {
    if (prefillPortion) return prefillPortion;
    // Đường lùi cho bản cũ, hồi đó khẩu phần tách làm hai tham số số và đơn vị.
    // Ghép lại thành một chuỗi, thiếu mảnh nào thì filter bỏ qua mảnh đó.
    const legacyPortion = [prefillAmount, prefillUnit].filter(Boolean).join(" ").trim();
    return legacyPortion || (prefillName && !isFromCommunity ? `1 ${t.meals.servingUnit}` : "");
  };
  // Dựng một dòng món trống, hoặc điền sẵn nếu vào từ quét ảnh, mã vạch,
  // bài Community, gợi ý, hay ghi lại món cũ.
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

  const [items, setItems] = useState<DraftMeal[]>(() => [initialItem()]);
  const [mealType, setMealType] = useState<MealTypeKey | null>(defaultType ?? null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [estimateError, setEstimateError] = useState<{ id: number; message: string } | null>(null);
  const [saveError, setSaveError] = useState("");
  const [estimatingItemId, setEstimatingItemId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Workflow tự chạy: dựng lại form mỗi khi tham số route đổi.
  // Cần thiết vì Expo Router dùng lại đúng một bản màn này cho cả năm lối vào,
  // nên quét ảnh xong rồi mở tiếp bài Community sẽ không kéo theo số của lần trước.
  useEffect(() => {
    nextItemId.current = 2;
    setItems([initialItem()]);
    setMealType(defaultType ?? null);
    setErrors({});
    setTouched({});
    setEstimateError(null);
    setSaveError("");
  // Danh sách phụ thuộc chỉ liệt kê tham số route, cố ý bỏ initialItem ra ngoài.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultType, prefillName, prefillCalories, prefillProtein, prefillCarbs, prefillFat,
    prefillAmount, prefillUnit, prefillPortion, prefillNote, source, t.meals.servingUnit,
  ]);

  // Workflow tự chạy: tải lịch sử món để dựng phần chọn nhanh và phần gợi ý tên.
  // Bỏ qua khi đã có dữ liệu điền sẵn, vì lúc đó người dùng không cần chọn lại.
  useEffect(() => {
    if (!isPrefilled) void fetchMealHistory().catch(() => {});
  }, [fetchMealHistory, isPrefilled]);

  // Vài món gần đây để bấm một cái là điền sẵn, khỏi gõ lại.
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
  // Danh sách tên món gần đây, dùng cho phần gợi ý khi đang gõ.
  const recentNameOptions = useMemo(() => recentUniqueMeals(historyMeals, 20), [historyMeals]);

  // Kiểm MỘT món. requireNutrition bật khi bấm Lưu, tắt khi chỉ bấm Ước tính,
  // vì lúc ước tính thì chưa có số dinh dưỡng là chuyện bình thường.
  const collectItemErrors = (item: DraftMeal, requireNutrition: boolean) => {
    const next: FieldErrors = {};
    // Chỉ còn kiểm phần TỐI THIỂU và phần bắt buộc. Trần độ dài do maxLength của
    // từng ô lo, nên ô nhập không bao giờ vượt được, không cần kiểm lại lần nữa.
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

  // Kiểm CẢ danh sách món, gom lỗi của từng món lại thành một.
  const collectErrors = (requireNutrition: boolean) => Object.assign(
    {},
    ...items.map((item) => collectItemErrors(item, requireNutrition)),
  );

  // Đánh dấu là người dùng đã đụng vào các ô này.
  // Chưa đụng thì không hiện lỗi, tránh vừa mở màn đã đỏ lòm.
  const touchFields = (fields: DraftField[]) => {
    const next: Record<string, boolean> = {};
    items.forEach((item) => fields.forEach((field) => { next[fieldKey(item.id, field)] = true; }));
    setTouched((current) => ({ ...current, ...next }));
  };

  // Vì sao phải xóa số cũ: số dinh dưỡng ước tính theo tên món và khẩu phần.
  // Đổi tên hoặc đổi khẩu phần mà giữ số cũ là lưu một con số của món khác.
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

  // Giữ đúng nhãn nguồn là để báo cáo và giao diện nói thật: số này AI đoán,
  // người dùng đã chỉnh, hay do người dùng tự gõ từ đầu.
  const updateNutrition = (id: number, field: "calories" | "protein" | "carbs" | "fat", value: string) => {
    setItems((current) => current.map((item) => item.id === id ? {
      ...item,
      [field]: value,
      nutritionSource: item.nutritionSource === "manual" ? "manual" : "ai_adjusted",
    } : item));
    setErrors((current) => ({ ...current, [fieldKey(id, field)]: undefined }));
    setSaveError("");
  };

  // Rời khỏi một ô thì mới kiểm ô đó, không kiểm lúc đang gõ dở.
  const handleBlur = (id: number, field: DraftField) => {
    setTouched((current) => ({ ...current, [fieldKey(id, field)]: true }));
    const item = items.find((draft) => draft.id === id);
    // Vừa rời một ô số thì kiểm luôn phần số. Rời ô chữ thì chỉ kiểm phần số
    // khi cả bốn ô của món đó đã đầy, kẻo món còn dở đã báo đỏ khắp nơi.
    const nutritionField = ["calories", "protein", "carbs", "fat"].includes(field);
    if (item) setErrors((current) => ({ ...current, ...collectItemErrors(item, nutritionField || hasCompleteNutrition(item)) }));
  };

  // Thêm một món trống vào cuối danh sách. Trần 8 món khớp đúng giới hạn
  // trong backend/src/validators/mealInputValidator.js và
  // backend/src/services/nutrition/nutritionEstimator.js.
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

  // Xóa một món khỏi danh sách, và dọn luôn mọi câu lỗi mang mã của món đó.
  // Không cho xóa món cuối cùng, vì màn phải luôn còn ít nhất một form.
  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${id}:`))));
    setEstimateError(null);
    setSaveError("");
  };

  // ══════════════════════════════════════════════════════════
  // ƯỚC TÍNH
  //
  // Người dùng gõ tên món với khẩu phần rồi bấm Ước tính. Bốn bước, đọc xuôi.
  // Xong thì số hiện lên ô dinh dưỡng, và người dùng vẫn sửa tay được.
  // ══════════════════════════════════════════════════════════

  // ƯỚC TÍNH BƯỚC 1. Người dùng bấm Ước tính trên MỘT món.
  // Mỗi lúc chỉ cho ước tính một món, vì mỗi lượt gọi tốn một lượt AI.
  const handleEstimate = async (id: number) => {
    const item = items.find((draft) => draft.id === id);
    if (!item || estimatingItemId !== null) return;
    setTouched((current) => ({
      ...current,
      [fieldKey(id, "name")]: true,
      [fieldKey(id, "portion")]: true,
    }));
    // ƯỚC TÍNH BƯỚC 2. Kiểm tên với khẩu phần ngay tại máy.
    // Thiếu là dừng luôn, đỡ tốn một lượt AI cho dữ liệu chắc chắn sai.
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
      // ƯỚC TÍNH BƯỚC 3. scanApi.estimateNutrition → POST /scan/estimate
      // → scanController.estimateNutrition; cache hit trả ngay, cache miss gọi aiClient.
      const estimate = await estimateNutrition({
        items: [{ ...requested, details: requested.details || undefined }],
      }, token, resolveLanguage(user?.language));
      // ƯỚC TÍNH BƯỚC 4. Điền số vào ô, và dán nhãn nguồn là ai_estimate.
      // Nhớ: so lại tên, khẩu phần, nguyên liệu với lúc gửi đi trước khi điền.
      // Người dùng gõ tiếp trong lúc chờ thì bỏ kết quả cũ, kẻo điền số của
      // một món đã không còn trên màn hình nữa.
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
  // LƯU MÓN
  //
  // Người dùng bấm Lưu. Ba bước, đọc xuôi.
  // Xong thì quay lại đúng màn trước đó, màn đó tự tải lại vì số đếm đã đổi.
  // ══════════════════════════════════════════════════════════

  // LƯU MÓN BƯỚC 1. Người dùng bấm Lưu. Kiểm hết tại máy trước, sai thì dừng luôn.
  // Một lần lưu ghi được tối đa 8 món, nên phải kiểm cả danh sách items.
  const handleSave = async () => {
    if (isSaving || !mealType) return;
    touchFields(["name", "portion", "calories", "protein", "carbs", "fat"]);
    const allErrors = collectErrors(true);
    setErrors(allErrors);
    if (Object.keys(allErrors).length) return;

    setIsSaving(true);
    setSaveError("");
    try {
      // LƯU MÓN BƯỚC 2. MealsContext.addMeals → mealsApi.addMealsRequest
      // → POST /meals/batch → mealController.addMeals ghi MongoDB và gọi readDay.
      // Dòng này chạy xong nghĩa là món đã nằm trong database rồi.
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
      // LƯU MÓN BƯỚC 3. Quay lại đúng màn người dùng đang đứng trước khi vào đây.
      // Màn quét dùng router.replace nên nó đã bị thay khỏi ngăn xếp,
      // back sẽ về thẳng màn trước đó chứ không rơi ngược lại vào camera.
      router.back();
    } catch (error) {
      setSaveError(getUserErrorMessage(error, t, t.meals.saveFailed));
      setIsSaving(false);
    }
  };

  // Bấm vào một món gần đây thì điền hết cả tên lẫn số dinh dưỡng,
  // và dán nhãn nguồn là repeat để người dùng biết đây là món ghi lại.
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

  // Cộng tổng calo với ba chất của tất cả món đang gõ, để hiện thẻ tổng.
  // Chỉ để XEM TRƯỚC trên màn. Tổng lưu chính thức do mealController.readDay cộng
  // trong mealController.js, và mọi màn khác đều lấy từ đó.
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
  // Đổi mã nguồn thành chữ hiện cho người dùng đọc.
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

        {isBackdated && (
          <View style={styles.backdateBanner}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.backdateText}>
              {t.meals.loggingFor} <AppText style={styles.backdateDate}>{backdatedLabel}</AppText>
            </AppText>
          </View>
        )}

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

        <MealTypeSelector value={mealType} onChange={setMealType} />

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

                  {item.showNutritionFields && (
                    <NutritionManualFields
                      values={{ calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }}
                      onChange={(field, value) => updateNutrition(item.id, field, value)}
                      onBlur={(field) => handleBlur(item.id, field)}
                      errorFor={(field) => touched[fieldKey(item.id, field)] ? errors[fieldKey(item.id, field)] : undefined}
                    />
                  )}

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

        {items.length < 8 && (
          <Pressable onPress={addItem} style={({ pressed }) => [styles.addItemButton, pressed && styles.pressed]}>
            <Ionicons name="add-circle-outline" size={19} color={theme.colors.primary} />
            <AppText style={styles.actionText}>{t.meals.addMealItem}</AppText>
          </Pressable>
        )}

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
