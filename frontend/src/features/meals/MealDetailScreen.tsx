// Màn Chi tiết món. Đây là file BẮT ĐẦU của luồng xóa món.
// LUỒNG XÓA MÓN
// 1. Bấm Xóa, hộp thoại hỏi xác nhận
// 2. MealsContext.deleteMeal
// 3. mealsApi.deleteMealRequest        (DELETE /meals/:id)
// 4. backend kiểm đúng chủ món rồi xóa
// 5. MealsContext bỏ món khỏi danh sách và trừ lại tổng calo
// 6. router.back quay về, món biến mất khỏi Trang chủ
// Ba nút trong màn này: Sửa mở màn Sửa món, Xóa như trên,
// và Ghi lại mở màn Thêm món điền sẵn để ăn lại món quen.
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { macroTargets } from "@/config/nutritionCalculations";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MEAL_TYPE_BY_KEY } from "@/features/meals/mealTypeDisplay";
import { dateKey } from "@/utils/dateUtils";
import { mealSlotByHour } from "@/features/meals/mealHelpers";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

function MacroRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHead}>
        <View style={styles.macroLabelWrap}>
      {/* Màu chấm phụ thuộc từng chất dinh dưỡng và chỉ biết khi chạy. */}
          <View style={[styles.macroDot, { backgroundColor: color }]} />
          <AppText variant="body2">{label}</AppText>
        </View>
        <AppText variant="subtle">{Math.round(value)}g / {total}g</AppText>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  // Ngày tháng đi theo ngôn ngữ đã chọn trong app.
  const locale = localeTag(resolveLanguage(user?.language));
  const { meals, historyMeals, deleteMeal } = useMeals();
  const t = useT();
  // Tìm trong cả danh sách hôm nay và lịch sử vì món có thể được mở từ hai nơi.
  const meal = meals.find((m) => m.id === id) || historyMeals.find((m) => m.id === id);
  // Chưa có mục tiêu thì vòng tiến độ và thanh macro không có gì để so,
  // nên chỉ hiện con số của món chứ không dựng ra một mục tiêu giả.
  const goal = user?.calorieGoal ?? null;
  const macros = macroTargets(goal, user?.weight);

  if (!meal) {
    return (
      <Screen style={styles.notFound}>
        <AppText variant="muted">{t.meals.mealNotFound}</AppText>
        <Button title={t.meals.goBack} variant="secondary" onPress={() => router.replace("/meals/history")} />
      </Screen>
    );
  }

  const eatenDateLabel = new Date(meal.date + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const loggedSameDay = dateKey(new Date(meal.createdAt)) === meal.date;
  // Chỉ cho ghi lại món của ngày cũ. Món hôm nay mà ghi lại sẽ tạo bản trùng.
  const eatenToday = meal.date === dateKey(new Date());
  const portionLabel = meal.portionText || [meal.portionAmount, meal.portionUnit].filter(Boolean).join(" ");

  // Nút Xóa, điểm bắt đầu của luồng xóa món.
  const handleDelete = () => {
    Alert.alert(
      t.meals.deleteMealTitle,
      t.meals.deleteMealMsg(meal.name),
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            await deleteMeal(meal.id);
            // Quay về Home hoặc Lịch sử. Cả hai nơi đều tự cập nhật dữ liệu mới.
            router.back();
          },
        },
      ]
    );
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />
        {/* Đưa tiêu đề gần nút quay lại hơn. */}
        <View style={styles.titleBlock}>
          <AppText variant="h1">{meal.name}</AppText>
          <View style={styles.metaRow}>
            {meal.mealType && (
              <Ionicons
                name={(MEAL_TYPE_BY_KEY[meal.mealType]?.icon ?? "restaurant") as any}
                size={14}
                color={MEAL_TYPE_BY_KEY[meal.mealType]?.color ?? theme.colors.primary}
              />
            )}
            <AppText variant="muted">{meal.mealType ? t.labels.mealType[meal.mealType] : t.meals.mealFallback}</AppText>
            <AppText variant="subtle">·</AppText>
            <AppText variant="muted">{eatenDateLabel}</AppText>
            {loggedSameDay && (
              <>
                <AppText variant="subtle">·</AppText>
                <AppText variant="muted">{hhmm(meal.createdAt)}</AppText>
              </>
            )}
          </View>
          {!!portionLabel && (
            <AppText variant="muted" style={styles.portionText}>
              {t.meals.portionConsumed}: {portionLabel}
            </AppText>
          )}
        </View>

          {/* Thẻ calo có vòng tiến độ. */}
        <Card style={styles.kcalCard}>
          <View style={styles.kcalRow}>
            <View style={styles.kcalBlock}>
              <AppText variant="subtle" style={styles.kcalLabel}>{t.meals.energyTotal}</AppText>
              <View style={styles.kcalNumRow}>
                <AppText variant="h0" style={styles.kcalNum}>{meal.calories.toLocaleString()}</AppText>
                <AppText variant="muted" style={styles.kcalUnit}>{t.common.kcal}</AppText>
              </View>
            </View>
            {goal != null && <ProgressRing eaten={meal.calories} goal={goal} size={64} stroke={6} />}
          </View>
        </Card>

          {/* Các chất dinh dưỡng chính. */}
        <Card style={styles.macroCard}>
          <AppText variant="h2">{t.meals.macros}</AppText>
          {macros && (meal.protein || meal.carbs || meal.fat) ? (
            <View style={styles.macroList}>
              {meal.protein ? (
                <MacroRow label={t.labels.protein} value={meal.protein} total={macros.protein} color={theme.colors.accent2} />
              ) : null}
              {meal.carbs ? (
                <MacroRow label={t.labels.carbs} value={meal.carbs} total={macros.carbs} color={theme.colors.accent} />
              ) : null}
              {meal.fat ? (
                <MacroRow label={t.labels.fat} value={meal.fat} total={macros.fat} color={theme.colors.indigo} />
              ) : null}
            </View>
          ) : (
            <AppText variant="subtle">{t.meals.noMacroData}</AppText>
          )}
        </Card>

          {/* Chỉ hiện ghi chú khi món có nội dung. */}
        {!!meal.note?.trim() && (
          <Card style={styles.noteCard}>
            <AppText variant="h2" style={styles.noteTitle}>{t.meals.ingredientsCooking}</AppText>
            <AppText variant="muted" style={styles.noteText}>{meal.note}</AppText>
          </Card>
        )}

        <View style={styles.actions}>
          {!eatenToday && (
            <Button
              title={t.meals.logAgain}
              variant="primary"
              size="lg"
              left={<Ionicons name="add-circle-outline" size={19} color="#fff" />}
              onPress={() =>
                router.push({
                  pathname: "/meals/add",
                  params: {
                    prefillName: meal.name,
                    prefillCalories: String(meal.calories),
                    prefillProtein: String(meal.protein ?? 0),
                    prefillCarbs: String(meal.carbs ?? 0),
                    prefillFat: String(meal.fat ?? 0),
                    prefillPortion: meal.portionText || [meal.portionAmount, meal.portionUnit].filter(Boolean).join(" "),
                    prefillNote: meal.note ?? "",
                    mealType: mealSlotByHour(new Date().getHours()),
                    source: "repeat",
                  },
                })
              }
            />
          )}
          <Button
            title={t.meals.editMeal}
            variant="secondary"
            size="lg"
            left={<Ionicons name="create-outline" size={19} color={theme.colors.primary} />}
            onPress={() => router.push({ pathname: "/meals/edit", params: { id: meal.id } })}
          />
          <Button
            title={t.meals.deleteMeal}
            variant="danger"
            size="lg"
            left={<Ionicons name="trash-outline" size={19} color={theme.colors.danger} />}
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notFound: { justifyContent: "center", alignItems: "center" },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: 40,
    paddingTop: 60,
    gap: theme.space.lg,
  },
  titleBlock: { gap: 4, marginTop: -10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  portionText: { fontSize: 13, marginTop: 2 },
  kcalCard: { padding: theme.space.xl },
  kcalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kcalBlock: { gap: 4 },
  kcalLabel: { fontSize: 12 },
  kcalNumRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  kcalNum: { fontSize: 42, color: theme.colors.primary },
  kcalUnit: { fontSize: 16 },
  macroCard: { padding: theme.space.lg, gap: theme.space.lg },
  macroList: { gap: theme.space.md },
  macroRow: { gap: 6 },
  macroHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  macroLabelWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroTrack: { height: 6, borderRadius: 99, backgroundColor: "rgba(22,78,99,0.08)", overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: 99 },
  noteCard: { padding: theme.space.lg, gap: 6 },
  noteTitle: { fontSize: 15 },
  noteText: { fontSize: 13 },
  actions: { gap: 10 },
});
