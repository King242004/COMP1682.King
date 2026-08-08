// ═══ FILE NÀY LÀM GÌ ═══
// Hai khối ô nhập dinh dưỡng, dùng chung cho màn Thêm món và Sửa món.
//
// Ai gọi tới: AddMealScreen, EditMealScreen
// Nhận vào:   calo và ba chất đang có
// Trả ra:     các ô nhập kèm nhãn nguồn số liệu
// Khi lỗi:    gõ chữ vào ô số thì hiện lỗi ngay tại ô đó

// Tiêu đề KHÔNG nằm ở đây vì ba chỗ dùng có tiêu đề khác nhau
import { StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { TextField } from "@/ui/components/TextField";
import { DIGIT_LIMITS } from "@/config/inputLimits";

export type NutritionField = "calories" | "protein" | "carbs" | "fat";

// Ra màn: số calo lớn, ba ô đạm tinh bột chất béo, mô tả và cảnh báo nếu có
// approximate bật thì thêm dấu ngã trước calo để báo đây là số AI đoán
export function NutritionSummary({ approximate, calories, protein, carbs, fat, description, disclaimer }: {
  approximate: boolean;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  description?: string;
  disclaimer?: string;
}) {
  const t = useT();
  const macros: { value: string | number; style: object; label: string }[] = [
    { value: protein, style: styles.proteinValue, label: t.labels.protein },
    { value: carbs, style: styles.carbsValue, label: t.labels.carbs },
    { value: fat, style: styles.fatValue, label: t.labels.fat },
  ];

  return (
    <>
      <AppText style={styles.calorieValue}>
        {approximate ? "~" : ""}{calories} <AppText style={styles.calorieUnit}>{t.common.kcal}</AppText>
      </AppText>
      <View style={styles.macroSummaryRow}>
        {macros.map((macro) => (
          <View key={macro.label} style={styles.macroSummaryItem}>
            <AppText style={macro.style}>{macro.value}g</AppText>
            <AppText variant="subtle" style={styles.macroSummaryLabel}>{macro.label}</AppText>
          </View>
        ))}
      </View>
      {description ? <AppText variant="muted" style={styles.description}>{description}</AppText> : null}
      {disclaimer ? <AppText variant="subtle" style={styles.disclaimer}>{disclaimer}</AppText> : null}
    </>
  );
}

// Ra màn: thẻ kết quả của MỘT món, có vạch ngăn, tiêu đề kèm nhãn nguồn, rồi số
// Thẻ TỔNG cả bữa không dùng hàm này mà gọi thẳng NutritionSummary
export function NutritionResultCard({ sourceLabel, approximate, calories, protein, carbs, fat, description, disclaimer }: {
  sourceLabel: string;
  approximate: boolean;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  description?: string;
  disclaimer?: string;
}) {
  const t = useT();
  return (
    <View style={styles.nutritionResult}>
      <View style={styles.nutritionHeader}>
        <AppText variant="h2" style={styles.nutritionTitle}>{t.meals.estimatedNutrition}</AppText>
        <View style={styles.sourceBadge}><AppText style={styles.sourceText}>{sourceLabel}</AppText></View>
      </View>
      <NutritionSummary
        approximate={approximate}
        calories={calories}
        protein={protein}
        carbs={carbs}
        fat={fat}
        description={description}
        disclaimer={disclaimer}
      />
    </View>
  );
}

// Ra màn: bốn ô calo, đạm, tinh bột, chất béo cho gõ tay
// errorFor là HÀM vì màn Thêm món gắn mã món vào khóa lỗi còn màn Sửa món thì không
export function NutritionManualFields({ values, onChange, onBlur, errorFor }: {
  values: Record<NutritionField, string>;
  onChange: (field: NutritionField, value: string) => void;
  onBlur: (field: NutritionField) => void;
  errorFor: (field: NutritionField) => string | undefined;
}) {
  const t = useT();

  // Khuôn chung của một ô số, viết một lần rồi gọi bốn lần ở JSX dưới
  // Ô calo cho nhiều chữ số hơn ba ô kia, và kiểm số chạy lúc RỜI ô
  const field = (name: NutritionField, label: string, placeholder: string) => (
    <TextField
      label={label}
      placeholder={placeholder}
      value={values[name]}
      onChangeText={(value) => onChange(name, value)}
      keyboardType="decimal-pad"
      textContentType="none"
      maxLength={name === "calories" ? DIGIT_LIMITS.CALORIE : DIGIT_LIMITS.MACRO}
      inputProps={{ onBlur: () => onBlur(name) }}
    />
  );

  return (
    <View style={styles.manualFields}>
      <AppText variant="subtle" style={styles.fieldHint}>{t.meals.manualNutritionHint}</AppText>
      <View style={styles.fieldWrap}>
        {field("calories", t.meals.calories, t.meals.caloriesPlaceholder)}
        {errorFor("calories") && <AppText style={styles.error}>{errorFor("calories")}</AppText>}
      </View>
      <View style={styles.macroRow}>
        {(["protein", "carbs"] as const).map((name) => (
          <View key={name} style={styles.macroField}>
            {field(name, name === "protein" ? t.meals.proteinG : t.meals.carbsG, t.meals.required)}
            {errorFor(name) && <AppText style={styles.errorSmall}>{errorFor(name)}</AppText>}
          </View>
        ))}
      </View>
      <View style={styles.fieldWrap}>
        {field("fat", t.meals.fatG, t.meals.required)}
        {errorFor("fat") && <AppText style={styles.error}>{errorFor("fat")}</AppText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nutritionResult: { paddingTop: theme.space.md, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: theme.space.md },
  nutritionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  nutritionTitle: { fontSize: 17 },
  sourceBadge: { backgroundColor: "rgba(5,150,105,0.10)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  sourceText: { color: theme.colors.accent, fontSize: 11, fontWeight: "700" },
  calorieValue: { fontSize: 32, lineHeight: 38, fontWeight: "800", color: theme.colors.primary },
  calorieUnit: { fontSize: 14, fontWeight: "700", color: theme.colors.muted },
  macroSummaryRow: { flexDirection: "row", gap: 10 },
  macroSummaryItem: { flex: 1, backgroundColor: theme.colors.bg, borderRadius: 12, paddingVertical: 10, alignItems: "center", gap: 2 },
  macroSummaryLabel: { fontSize: 11 },
  proteinValue: { fontSize: 15, fontWeight: "800", color: theme.colors.accent2 },
  carbsValue: { fontSize: 15, fontWeight: "800", color: theme.colors.accent },
  fatValue: { fontSize: 15, fontWeight: "800", color: theme.colors.indigo },
  description: { fontSize: 12, lineHeight: 18 },
  disclaimer: { fontSize: 12, lineHeight: 18 },
  manualFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  fieldHint: { fontSize: 12, lineHeight: 18 },
  macroRow: { flexDirection: "row", gap: theme.space.md },
  macroField: { flex: 1, gap: 4 },
  error: { fontSize: 12, color: theme.colors.danger },
  errorSmall: { fontSize: 11, color: theme.colors.danger },
});
