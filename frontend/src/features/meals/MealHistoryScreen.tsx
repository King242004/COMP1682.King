// ═══ FILE NÀY LÀM GÌ ═══
// Màn Lịch sử món, xem lại các món đã ghi theo ngày.
//
// Ai gọi tới: ProfileScreen
// Nhận vào:   không nhận gì, tự tải khi mở màn
// Trả ra:     danh sách món gom theo ngày
// Khi lỗi:    chưa ghi món nào thì hiện lời nhắc, không hiện màn trống
//
// Chạm một món sẽ mở màn Chi tiết món.
//
// mealController.getMealHistory trả một mảng không phân trang; dữ liệu lớn sẽ làm màn nặng dần.
import { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals, Meal } from "@/features/meals/MealsContext";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { useT, type Strings } from "@/i18n";
import { theme } from "@/ui/theme";
import { MEAL_TYPE_BY_KEY } from "@/features/meals/mealTypeDisplay";
import { dateKey } from "@/utils/dateUtils";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { Card } from "@/ui/components/Card";

// ══════════════════════════════════════════════════════════
// HAI HÀM ĐẶT NHÃN
//
// Không phải luồng, chỉ là hai hàm đổi mốc thời gian ra chữ cho dễ đọc.
// Cả hai đều được gọi ở khối XEM LỊCH SỬ bên dưới.
// ══════════════════════════════════════════════════════════

// Rút giờ phút ra khỏi mốc thời gian đầy đủ, để hiện cạnh tên món.
function hhmm(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Nhãn cho tiêu đề một nhóm ngày. Hai ngày gần nhất gọi thẳng là Hôm nay với Hôm qua,
// xa hơn mới ghi thứ và ngày tháng, vì đọc "Hôm nay" nhanh hơn đọc một cái ngày.
// Ghép "T00:00:00" để máy hiểu là giờ địa phương, thiếu đuôi đó thì máy hiểu là UTC
// và múi giờ âm sẽ hiện lùi mất một ngày.
function dateLabel(dateStr: string, t: Strings, locale?: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t.meals.today;
  if (d.toDateString() === yesterday.toDateString()) return t.meals.yesterday;
  return d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
}

// ══════════════════════════════════════════════════════════
// XEM LỊCH SỬ
//
// Đến từ màn Hồ sơ và từ liên kết "Xem tất cả" ở Trang chủ.
// Bốn bước, đọc từ trên xuống là đúng thứ tự. BƯỚC 2 là chặng chờ mạng.
// Xong thì màn hiện các nhóm ngày, chạm một món là mở màn Chi tiết món.
// ══════════════════════════════════════════════════════════

// XEM LỊCH SỬ BƯỚC 1. Lấy danh sách từ MealsContext, không tự giữ state riêng.
export default function MealHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();
  // Ngày tháng đi theo ngôn ngữ đã chọn trong app.
  const locale = localeTag(resolveLanguage(user?.language));

  // XEM LỊCH SỬ BƯỚC 2. Tự tải khi mở màn, không ai bấm cả.
  // Đường đi: MealsContext.fetchMealHistory → mealsApi.fetchMealHistoryRequest
  //           → apiClient → GET /meals/history → mealController.getMealHistory
  // Dùng useEffect chứ không useFocusEffect, nên chỉ tải MỘT lần lúc mở màn.
  // Đủ dùng vì rời màn này là màn tự dựng lại từ đầu.
  // Nuốt lỗi vì MealsContext còn giữ dữ liệu lần trước, hiện bản cũ hơn là hiện màn trắng.
  useEffect(() => {
    void fetchMealHistory().catch(() => {});
  }, [fetchMealHistory]);

  // XEM LỊCH SỬ BƯỚC 3. Gom món thành từng nhóm ngày.
  // Backend đã xếp sẵn mới nhất lên đầu, nên chỉ cần duyệt một lượt theo thứ tự đó,
  // gặp ngày mới thì mở nhóm mới. Set seen để một ngày không mở nhóm hai lần.
  const grouped: { date: string; label: string; meals: Meal[] }[] = [];
  const seen = new Set<string>();

  for (const meal of historyMeals) {
    const date = meal.date;
    if (!seen.has(date)) {
      seen.add(date);
      grouped.push({ date, label: dateLabel(date, t, locale), meals: [] });
    }
    grouped.find((g) => g.date === date)?.meals.push(meal);
  }

  // XEM LỊCH SỬ BƯỚC 4. Vẽ các nhóm ngày.
  // Dùng FlatList chứ không ScrollView, vì nó chỉ dựng phần đang nhìn thấy,
  // ghi vài trăm món vẫn cuộn mượt.
  return (
    <Screen padded={false}>
      <FlatList
        data={grouped}
        keyExtractor={(g) => g.date}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
        ListHeaderComponent={
          <View>
            <ScreenHeader title={t.meals.historyTitle} />
            <AppText variant="muted" style={styles.subtitle}>{t.meals.historySubtitle}</AppText>
          </View>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <View style={styles.emptyBody}>
              <AppText variant="h2">{t.meals.noMealsYet}</AppText>
              <AppText variant="muted">{t.meals.noMealsSub}</AppText>
              <View style={styles.emptyAction}>
                <Button
                  title={t.meals.addTitle}
                  variant="secondary"
                  onPress={() => router.push("/meals/add")}
                />
              </View>
            </View>
          </Card>
        }
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <AppText variant="subtle" style={styles.groupLabel}>{group.label}</AppText>
            {group.meals.map((item) => {
              // Chỉ hiện giờ lưu khi món được ghi đúng ngày đã ăn.
              // Món ghi bổ sung cho ngày cũ sẽ không hiện giờ này.
              const loggedSameDay = dateKey(new Date(item.createdAt)) === item.date;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/meals/detail", params: { id: item.id } })}
                  style={({ pressed }) => pressed && styles.pressedFaint}
                >
                  <Card style={styles.rowCard}>
                    <View style={[styles.avatar, { backgroundColor: MEAL_TYPE_BY_KEY[item.mealType]?.bg ?? "rgba(8,145,178,0.08)" }]}>
                      <Ionicons
                        name={(MEAL_TYPE_BY_KEY[item.mealType]?.icon ?? "restaurant") as any}
                        size={22}
                        color={MEAL_TYPE_BY_KEY[item.mealType]?.color ?? theme.colors.primary}
                      />
                    </View>

                    <View style={styles.rowBody}>
                      <AppText variant="h2">{item.name}</AppText>
                      <View style={styles.rowMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="flame" size={13} color={theme.colors.accent2} />
                          <AppText variant="subtle">{item.calories.toLocaleString()} {t.common.kcal}</AppText>
                        </View>
                        {loggedSameDay && (
                          <View style={styles.metaItem}>
                            <Ionicons name="time" size={13} color={theme.colors.subtle} />
                            <AppText variant="subtle">{hhmm(item.createdAt)}</AppText>
                          </View>
                        )}
                        {item.mealType && (
                          <AppText variant="subtle">· {t.labels.mealType[item.mealType]}</AppText>
                        )}
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: 60,
    paddingBottom: 40,
    gap: theme.space.lg,
  },
  subtitle: { marginTop: -8, marginBottom: 4 },
  emptyCard: { padding: theme.space.xl },
  emptyBody: { gap: 10 },
  emptyAction: { marginTop: 8 },
  group: { gap: theme.space.sm },
  groupLabel: {
    fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  pressedFaint: { opacity: 0.9 },
  rowCard: {
    padding: theme.space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 4 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
});
