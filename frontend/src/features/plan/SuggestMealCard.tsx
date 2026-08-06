// Thẻ gợi ý món ở màn Trang chủ. Đây là file BẮT ĐẦU của luồng gợi ý món.
// LUỒNG GỢI Ý MÓN
// 1. Bấm nút xin gợi ý tại đây
// 2. suggestNextMeal              (POST /coach/suggest-meal)
// 3. backend coachController.suggestMeal xem giờ và các bữa đã ăn
//    để đoán bữa kế tiếp, tính calo còn lại
// 4. Gemini đề xuất 3 món
// 5. conditionFilter lọc lại theo bệnh nền ở server
// 6. thẻ hiện 3 món kèm lý do chọn
// 7. Bấm một món, sang /meals/add điền sẵn tên và dinh dưỡng
// Kết quả được lưu tạm theo ngày, bữa và ngôn ngữ, để mở lại
// không tốn thêm một lượt gọi AI.
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { suggestNextMeal, getCachedSuggestions, cacheSuggestions, nextMealSlot, type MealSuggestions } from "@/features/plan/mealSuggestions";
import type { PlanMeal } from "@/features/plan/planApi";
import { todayKey } from "@/utils/dateUtils";
import { aiResetWhen } from "@/utils/aiQuota";
import { resolveLanguage } from "@/utils/languageUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Skeleton } from "@/ui/components/Skeleton";

export function SuggestMealCard({ planToday }: { planToday: PlanMeal[] }) {
  const router = useRouter();
  const { user, token } = useAuth();
  // Component cha chỉ hiện thẻ này ở ngày hôm nay nên đây là các món của hôm nay.
  const { meals } = useMeals();
  const lang = resolveLanguage(user?.language);
  const t = useT();
  const dateKey = todayKey();

  const [suggest, setSuggest] = useState<MealSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSlot = nextMealSlot(new Date().getHours(), new Set(meals.map((m) => m.mealType)));
  // Tự đọc gợi ý đã lưu trong máy khi mở thẻ, để không phải chờ.
  // Chưa có bản lưu thì để trống, chờ người dùng bấm xin gợi ý.
  useEffect(() => {
    void getCachedSuggestions(dateKey, currentSlot, lang).then(setSuggest).catch(() => {});
  }, [dateKey, currentSlot, lang]);

  const loadSuggestions = async (force = false) => {
    if (!token || loading) return;
    setError(null);
    if (!force) {
      const cached = await getCachedSuggestions(dateKey, currentSlot, lang);
      if (cached) { setSuggest(cached); return; }
    }
    setLoading(true);
    try {
      const fresh = await suggestNextMeal(token, lang);
      setSuggest(fresh);
      cacheSuggestions(dateKey, currentSlot, lang, fresh);
    } catch (e: any) {
      setError(e?.message === "QUOTA" ? t.plan.suggestQuota(aiResetWhen(t)) : t.plan.suggestErr);
    } finally {
      setLoading(false);
    }
  };

  const askCoachHow = (name: string) =>
    router.push({
      pathname: "/tabs/coach",
      params: {
        ask: t.community.cookQuestion(name),
        askId: String(Date.now()),
      },
    });

  const slot = suggest?.mealType || currentSlot;
  const slotName = t.plan.slotShort[slot] || slot;
  // Planned-but-uneaten dish for this slot → suggestions act as swap options
  const plannedForSlot = planToday.find((p) => p.mealType === slot && !p.done);

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={() => loadSuggestions()}
        disabled={loading}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressedFaint]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="restaurant" size={17} color={theme.colors.accent} />
        </View>
        <View style={styles.headerBody}>
          <AppText variant="h2" style={styles.title}>{t.plan.whatToEat}</AppText>
          <AppText variant="subtle" numberOfLines={2} style={styles.subtitle}>
            {suggest
              ? plannedForSlot
                ? t.plan.altFor(plannedForSlot.name, suggest.remaining.toLocaleString())
                : t.plan.forSlot(slotName, suggest.remaining.toLocaleString())
              : plannedForSlot
              ? t.plan.plannedSwap(slotName, plannedForSlot.name)
              : t.plan.aiPicks(slotName)}
          </AppText>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : suggest ? (
          <Pressable onPress={() => loadSuggestions(true)} hitSlop={8} style={({ pressed }) => pressed && styles.dim}>
            <Ionicons name="refresh" size={17} color={theme.colors.subtle} />
          </Pressable>
        ) : (
          <View style={styles.suggestPill}>
            <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
            <AppText style={styles.suggestPillText}>{t.plan.suggestPill}</AppText>
          </View>
        )}
      </Pressable>

      {!!error && <AppText style={styles.error}>{error}</AppText>}

      {loading && !suggest && (
        <View style={styles.skeletons}>
          <Skeleton height={44} radius={12} />
          <Skeleton height={44} radius={12} />
          <Skeleton height={44} radius={12} />
        </View>
      )}

      {suggest?.suggestions.map((s, i) => (
        <View key={`${i}-${s.name}`} style={styles.dishRow}>
          <View style={styles.dishHead}>
            <AppText variant="body2" numberOfLines={1} style={styles.dishName}>{s.name}</AppText>
            <AppText variant="subtle" style={styles.dishKcal}>{s.calories} kcal</AppText>
            <Pressable onPress={() => askCoachHow(s.name)} hitSlop={10} style={({ pressed }) => pressed && styles.dim}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => router.push({
                pathname: "/meals/add",
                params: {
                  mealType: suggest.mealType,
                  prefillName: s.name,
                  prefillCalories: String(s.calories),
                  prefillProtein: String(s.protein),
                  prefillCarbs: String(s.carbs),
                  prefillFat: String(s.fat),
                  source: "suggest",
                },
              })}
              hitSlop={6}
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            >
              <Ionicons name="add" size={14} color={theme.colors.accent} />
              <AppText style={styles.addText}>{t.plan.add}</AppText>
            </Pressable>
          </View>
          {!!s.reason && <AppText variant="subtle" style={styles.reason}>{s.reason}</AppText>}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.5 },
  pressedFaint: { opacity: 0.8 },
  card: { padding: theme.space.lg, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "rgba(5,150,105,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  headerBody: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  subtitle: { fontSize: 12 },
  suggestPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(5,150,105,0.10)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
  },
  suggestPillText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  error: { fontSize: 12, color: theme.colors.danger },
  skeletons: { gap: 8 },
  dishRow: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 4,
    backgroundColor: theme.colors.bg,
  },
  dishHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  dishName: { flex: 1, fontSize: 13, fontWeight: "600" },
  dishKcal: { fontSize: 12 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(5,150,105,0.10)",
  },
  addBtnPressed: { backgroundColor: theme.colors.tint },
  addText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  reason: { fontSize: 11 },
});
