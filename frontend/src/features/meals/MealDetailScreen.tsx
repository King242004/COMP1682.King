// ═══ FILE NÀY LÀM GÌ ═══
// Màn Chi tiết món. File BẮT ĐẦU của luồng xóa món.
//
// Ai gọi tới: HomeScreen và MealHistoryScreen
// Nhận vào:   mã món cần xem
// Trả ra:     chi tiết món, kèm nút Sửa và nút Xóa
// Khi lỗi:    xóa thì hỏi xác nhận trước, tránh bấm nhầm mất dữ liệu
//
// Ba nút trong màn: Sửa mở màn Sửa món, Xóa xem khối XÓA MÓN bên dưới,
// và Ghi lại mở màn Thêm món đã điền sẵn, để ăn lại món quen cho nhanh.
//
// Nhớ: màn này KHÔNG tự gọi mạng để lấy món. Nó tìm trong dữ liệu MealsContext
//      đã có sẵn, nên mở thẳng bằng đường dẫn mà chưa qua Trang chủ là không thấy món.
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

// ══════════════════════════════════════════════════════════
// HAI MẢNH VẼ NHỎ
//
// Không phải luồng, chỉ là hai mảnh tách ra cho phần JSX ở dưới đỡ rối.
// Gọi cái nào trước cũng được, cả hai đều không gọi mạng.
// ══════════════════════════════════════════════════════════

// Một dòng macro: chấm màu, tên chất, số so với mục tiêu, và thanh chạy bên dưới.
// Gọi ba lần ở JSX, mỗi lần cho một chất. Mục tiêu bằng 0 thì thanh để trống,
// tránh chia cho 0. Vượt mục tiêu thì thanh dừng ở đầy chứ không tràn ra ngoài.
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

// Rút giờ phút khỏi createdAt do Meal model/Mongoose tạo.
// Chỉ dùng khi món được ghi ĐÚNG ngày ăn, xem loggedSameDay ở dưới.
// Món ghi bù ngày cũ thì giờ ghi chẳng nói lên điều gì nên giấu đi.
function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ══════════════════════════════════════════════════════════
// MỞ CHI TIẾT MÓN
//
// Đến từ Trang chủ và màn Lịch sử món, cả hai đều truyền mã món qua đường dẫn.
// Bốn bước, đọc từ trên xuống là đúng thứ tự. KHÔNG gọi mạng.
// Xong thì màn hiện chi tiết cùng ba nút Sửa, Ghi lại, Xóa.
// ══════════════════════════════════════════════════════════

// MỞ CHI TIẾT BƯỚC 1. Lấy mã món từ đường dẫn, lấy dữ liệu từ hai context.
export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  // Ngày tháng đi theo ngôn ngữ đã chọn trong app.
  const locale = localeTag(resolveLanguage(user?.language));
  const { meals, historyMeals, deleteMeal } = useMeals();
  const t = useT();
  // MỞ CHI TIẾT BƯỚC 2. Tìm món trong dữ liệu đã có, KHÔNG gọi mạng.
  // Tìm ở cả hai danh sách vì món có thể mở từ Trang chủ hoặc từ màn Lịch sử,
  // hai màn đó lấy món từ hai danh sách khác nhau.
  const meal = meals.find((m) => m.id === id) || historyMeals.find((m) => m.id === id);
  // Chưa có mục tiêu thì vòng tiến độ và thanh macro không có gì để so,
  // nên chỉ hiện con số của món chứ không dựng ra một mục tiêu giả.
  const goal = user?.calorieGoal ?? null;
  const macros = macroTargets(goal, user?.weight);

  // MỞ CHI TIẾT BƯỚC 3. Không tìm thấy thì dừng ngay tại đây, hiện màn rỗng có nút quay về.
  // Hay gặp khi món vừa bị xóa ở màn khác, hoặc mở thẳng đường dẫn lúc app mới bật.
  if (!meal) {
    return (
      <Screen style={styles.notFound}>
        <AppText variant="muted">{t.meals.mealNotFound}</AppText>
        <Button title={t.meals.goBack} variant="secondary" onPress={() => router.replace("/meals/history")} />
      </Screen>
    );
  }

  // MỞ CHI TIẾT BƯỚC 4. Dựng mấy nhãn cho phần JSX ở dưới.
  // Ghép "T00:00:00" vào chuỗi ngày để máy hiểu là giờ địa phương.
  // Thiếu đuôi đó thì máy hiểu là giờ UTC, và múi giờ âm sẽ hiện lùi một ngày.
  const eatenDateLabel = new Date(meal.date + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const loggedSameDay = dateKey(new Date(meal.createdAt)) === meal.date;
  // Chỉ cho ghi lại món của ngày cũ. Món hôm nay mà ghi lại sẽ tạo bản trùng.
  const eatenToday = meal.date === dateKey(new Date());
  const portionLabel = meal.portionText || [meal.portionAmount, meal.portionUnit].filter(Boolean).join(" ");

  // ══════════════════════════════════════════════════════════
  // XÓA MÓN
  //
  // Đến từ nút Xóa của màn này. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Màn này chỉ xác nhận; MealsContext.deleteMeal gọi mealsApi.deleteMealRequest,
  // rồi DELETE /meals/:id chạy mealController.deleteMeal.
  // Xong thì quay về màn trước, và món đã biến khỏi Trang chủ lẫn Lịch sử.
  // ══════════════════════════════════════════════════════════

  // XÓA MÓN BƯỚC 1. Hỏi lại cho chắc. Xóa là mất hẳn, không hoàn lại được.
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
            // XÓA MÓN BƯỚC 2. MealsContext.deleteMeal → mealsApi.deleteMealRequest
            // → DELETE /meals/:id → mealController.deleteMeal kiểm chủ sở hữu và xóa.
            // Request xong, MealsContext bỏ món khỏi state và trừ tổng của ngày.
            await deleteMeal(meal.id);
            // XÓA MÓN BƯỚC 3. Quay về màn trước, là Trang chủ hoặc Lịch sử.
            // Không phải tải lại gì cả, vì MealsContext vừa sửa xong ở bước trên,
            // hai màn đó dùng chung dữ liệu nên tự vẽ lại.
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
