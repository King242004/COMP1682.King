// ═══ FILE NÀY LÀM GÌ ═══
// Thanh đầu màu xanh của tab Trang chủ, gồm lời chào và chuỗi ngày ghi món.
//
// Ai gọi tới: app/tabs/_layout, chỉ gắn cho riêng tab Trang chủ
// Nhận vào:   tên người dùng và danh sách món để đếm chuỗi ngày
// Trả ra:     thanh đầu đã vẽ xong
// Khi lỗi:    chưa có tên thì hiện lời chào chung, không để trống
import { useCallback, useState } from "react";
import { Image, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { getUnreadCount } from "@/features/community/communityApi";
import { dateKey } from "@/utils/dateUtils";
import { mealStreak, streakEligibleDates } from "@/utils/mealStreak";
import { useT, type Strings } from "@/i18n";
import { shadow, theme } from "@/ui/theme";
import { AppText } from "./AppText";

function greetingForHour(h: number, t: Strings) {
  if (h < 12) return t.nav.goodMorning;
  if (h < 18) return t.nav.goodAfternoon;
  return t.nav.goodEvening;
}

export function AppHeader() {
  const { user, token, fetchProfile } = useAuth();
  const router = useRouter();
  const t = useT();
  const { historyMeals } = useMeals();
  const streak = mealStreak(streakEligibleDates(historyMeals));
  const todayMeals = historyMeals.filter((meal) => meal.date === dateKey(new Date()));
  const todayCalories = Math.round(todayMeals.reduce((sum, meal) => sum + meal.calories, 0));
  const goal = user?.calorieGoal ?? null;

  const [unread, setUnread] = useState(0);
  const [streakVisible, setStreakVisible] = useState(false);
  // Tự đếm thông báo chưa đọc mỗi lần quay về Trang chủ,
  // đồng thời tải mục tiêu calo mới nhất cho thông báo streak.
  useFocusEffect(useCallback(() => {
    if (!token) return;
    getUnreadCount(token).then(setUnread).catch(() => {});
    fetchProfile().catch(() => {});
  }, [fetchProfile, token]));

  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <AppText style={styles.avatarText}>{(user?.name ?? "U")[0].toUpperCase()}</AppText>
            )}
          </View>
          <View>
            <AppText style={styles.greeting}>{greetingForHour(new Date().getHours(), t)}</AppText>
            <AppText style={styles.name}>{user?.name ?? t.nav.fallbackName}</AppText>
          </View>
        </View>

        <View style={styles.right}>
          {streak > 0 && (
            <Pressable
              onPress={() => setStreakVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={streak === 1 ? t.progress.streakStarted : t.progress.streakBang(streak)}
              style={({ pressed }) => [styles.streakPill, pressed && styles.streakPressed]}
            >
              <Ionicons name="flame" size={14} color="#fff" />
              <AppText style={styles.streakNum}>{streak}</AppText>
            </Pressable>
          )}
          {/* Community notifications bell with unread badge */}
          <Pressable
            onPress={() => { setUnread(0); router.push("/community/notifications"); }}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.notifications}
            hitSlop={8}
            style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            {unread > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{unread > 9 ? "9+" : unread}</AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={streakVisible} animationType="fade" onRequestClose={() => setStreakVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setStreakVisible(false)}>
          <Pressable style={styles.streakCard} onPress={() => {}}>
            <View style={styles.flameCircle}>
              <Ionicons name="flame" size={34} color={theme.colors.accent2} />
            </View>
            <AppText variant="h2" style={styles.modalTitle}>
              {streak === 1 ? t.progress.streakStarted : t.progress.streakBang(streak)}
            </AppText>
            <AppText variant="subtle" style={styles.modalMessage}>
              {todayMeals.length === 0 ? t.home.streakTodayEmpty : t.progress.streakSub}
            </AppText>

            <View style={styles.todayCard}>
              <AppText style={styles.todayLabel}>{t.meals.today}</AppText>
              <View style={styles.calorieValueRow}>
                <AppText style={styles.calorieValue}>{todayCalories.toLocaleString()}</AppText>
                <AppText style={styles.calorieUnit}>{t.home.recordedKcal}</AppText>
              </View>
              <AppText variant="subtle" style={styles.todayHint}>
                {todayMeals.length > 0 ? t.progress.mealsLogged(todayMeals.length) : t.progress.noMealsLogged}
              </AppText>
              {goal != null && todayMeals.length > 0 && (
                <AppText style={styles.goalStatus}>
                  {todayCalories > goal
                    ? t.home.streakGoalOver((todayCalories - goal).toLocaleString(), goal.toLocaleString())
                    : t.home.streakGoalLeft((goal - todayCalories).toLocaleString(), goal.toLocaleString())}
                </AppText>
              )}
            </View>

            {todayMeals.length === 0 && (
              <AppText variant="subtle" style={styles.streakPrompt}>{t.home.streakTodayPrompt}</AppText>
            )}

            <Pressable
              onPress={() => {
                setStreakVisible(false);
                if (todayMeals.length === 0) router.push("/meals/add");
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <AppText style={styles.closeButtonText}>
                {todayMeals.length === 0 ? t.home.logMeal : t.common.ok}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.space.lg,
    paddingTop: Platform.OS === "ios" ? 52 : 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.primary,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  greeting: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  name: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 11, borderRadius: 20,
  },
  streakPressed: { backgroundColor: "rgba(255,255,255,0.28)" },
  streakNum: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  bell: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  bellPressed: { backgroundColor: "rgba(255,255,255,0.28)" },
  badge: {
    position: "absolute", top: -3, right: -3,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: theme.colors.danger,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: theme.colors.primary,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  modalBackdrop: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: theme.space.xl, backgroundColor: "rgba(22,78,99,0.42)",
  },
  streakCard: {
    width: "100%", maxWidth: 360, alignItems: "center",
    padding: theme.space.xl, borderRadius: 24, backgroundColor: theme.colors.surface,
    ...shadow(3),
  },
  flameCircle: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: "center", justifyContent: "center",
    marginBottom: theme.space.md, backgroundColor: "rgba(255,138,61,0.12)",
  },
  modalTitle: { textAlign: "center", color: theme.colors.text },
  modalMessage: { marginTop: 6, textAlign: "center" },
  todayCard: {
    width: "100%", alignItems: "center", marginTop: theme.space.xl,
    padding: theme.space.lg, borderRadius: theme.radius.card,
    backgroundColor: "rgba(255,138,61,0.08)",
  },
  todayLabel: { fontSize: 12, fontWeight: "700", color: theme.colors.accent2 },
  calorieValueRow: { flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 3 },
  calorieValue: { fontSize: 32, fontWeight: "800", color: theme.colors.text },
  calorieUnit: { fontSize: 13, fontWeight: "700", color: theme.colors.muted },
  todayHint: { marginTop: 5, fontSize: 11, textAlign: "center" },
  goalStatus: { marginTop: 10, fontSize: 12, fontWeight: "700", color: theme.colors.primary2, textAlign: "center" },
  streakPrompt: { marginTop: theme.space.md, fontSize: 12, textAlign: "center" },
  closeButton: {
    width: "100%", alignItems: "center", marginTop: theme.space.lg,
    paddingVertical: 13, borderRadius: theme.radius.button, backgroundColor: theme.colors.primary,
  },
  closeButtonPressed: { backgroundColor: theme.colors.primary2 },
  closeButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
