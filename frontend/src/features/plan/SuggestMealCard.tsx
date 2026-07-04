// "Ăn gì bây giờ?" card — one tap, AI picks 3 dishes for the next meal slot.
// When the slot already has a planned dish, picks act as swap alternatives.
// Self-contained: owns its state/cache; Home only passes today's plan and
// renders it on today's view.
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import {
  suggestNextMeal,
  getCachedSuggestions,
  cacheSuggestions,
  nextMealSlot,
  type MealSuggestions,
} from "@/features/plan/suggest";
import type { PlanMeal } from "@/features/plan/api";
import { todayKey } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Skeleton } from "@/ui/components/Skeleton";

export function SuggestMealCard({ planToday }: { planToday: PlanMeal[] }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { meals } = useMeals(); // today's logged meals (parent only renders on today)
  const lang = resolveLanguage(user?.language);
  const vi = lang === "vi";
  const dateKey = todayKey();

  // User-initiated only (each call = 1 Gemini request), cached per
  // (date + meal slot + lang) so re-taps within the same slot are free.
  const [suggest, setSuggest] = useState<MealSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slot: hour-based, skipping meals already logged. Logging a meal moves the
  // slot forward → cache key changes → stale picks vanish automatically.
  const currentSlot = nextMealSlot(new Date().getHours(), new Set(meals.map((m) => m.mealType)));
  useEffect(() => {
    getCachedSuggestions(dateKey, currentSlot, lang).then(setSuggest);
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
      setError(
        e?.message === "QUOTA"
          ? (vi ? "Hôm nay hết lượt AI rồi, thử lại sau nhé." : "Out of AI requests for today — try again later.")
          : (vi ? "Không lấy được gợi ý, thử lại nhé." : "Couldn't get suggestions. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Tap 💬 on a dish → Coach tab with a ready-made cooking question
  // (same deep-link pattern as the weekly plan's dish rows)
  const askCoachHow = (name: string) =>
    router.push({
      pathname: "/tabs/coach" as any,
      params: {
        ask: vi
          ? `Hướng dẫn mình cách làm "${name}" tốt cho sức khoẻ nhé`
          : `How do I cook "${name}" in a healthy way?`,
        askId: String(Date.now()),
      },
    });

  const slot = suggest?.mealType || currentSlot;
  const slotVi: Record<string, string> = { breakfast: "bữa sáng", lunch: "bữa trưa", dinner: "bữa tối", snack: "bữa phụ" };
  const slotName = vi ? (slotVi[slot] || slot) : slot;
  // Planned-but-uneaten dish for this slot → suggestions act as swap options
  const plannedForSlot = planToday.find((p) => p.mealType === slot && !p.done);

  return (
    <Card style={styles.card}>
      {/* Header — tap generates (cache hit = instant, no AI call) */}
      <Pressable
        onPress={() => loadSuggestions()}
        disabled={loading}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressedFaint]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="restaurant" size={17} color={theme.colors.accent} />
        </View>
        <View style={styles.headerBody}>
          <AppText variant="h2" style={styles.title}>
            {vi ? "Ăn gì bây giờ?" : "What should I eat now?"}
          </AppText>
          <AppText variant="subtle" numberOfLines={2} style={styles.subtitle}>
            {suggest
              ? plannedForSlot
                ? (vi
                    ? `Món thay thế cho ${plannedForSlot.name} · còn ${suggest.remaining.toLocaleString()} kcal`
                    : `Alternatives to ${plannedForSlot.name} · ${suggest.remaining.toLocaleString()} kcal left`)
                : (vi
                    ? `Gợi ý cho ${slotName} · còn ${suggest.remaining.toLocaleString()} kcal`
                    : `For your ${slotName} · ${suggest.remaining.toLocaleString()} kcal left`)
              : plannedForSlot
              ? (vi
                  ? `Kế hoạch ${slotName} có ${plannedForSlot.name} — muốn đổi món khác?`
                  : `${plannedForSlot.name} is planned for ${slotName} — want something else?`)
              : (vi
                  ? `AI chọn món cho ${slotName} theo calo còn lại`
                  : `AI picks dishes for your ${slotName} from what's left`)}
          </AppText>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : suggest ? (
          /* Regenerate — bypasses the cache (costs 1 AI request) */
          <Pressable onPress={() => loadSuggestions(true)} hitSlop={8} style={({ pressed }) => pressed && styles.dim}>
            <Ionicons name="refresh" size={17} color={theme.colors.subtle} />
          </Pressable>
        ) : (
          <View style={styles.suggestPill}>
            <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
            <AppText style={styles.suggestPillText}>{vi ? "Gợi ý" : "Suggest"}</AppText>
          </View>
        )}
      </Pressable>

      {!!error && <AppText style={styles.error}>{error}</AppText>}

      {/* First fetch in flight → pulse placeholder rows where dishes will appear */}
      {loading && !suggest && (
        <View style={styles.skeletons}>
          <Skeleton height={44} radius={12} />
          <Skeleton height={44} radius={12} />
          <Skeleton height={44} radius={12} />
        </View>
      )}

      {/* Suggested dishes — 💬 asks the Coach how to cook; "Thêm" prefills Add meal */}
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
              <AppText style={styles.addText}>{vi ? "Thêm" : "Add"}</AppText>
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
