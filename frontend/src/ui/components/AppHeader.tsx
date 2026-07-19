// Blue app header for the Home tab: avatar + greeting + streak pill + bell.
import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { getUnreadCount } from "@/features/community/api";
import { mealStreak } from "@/utils/streak";
import { useT, type Strings } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "./AppText";

function greetingForHour(h: number, t: Strings) {
  if (h < 12) return t.nav.goodMorning;
  if (h < 18) return t.nav.goodAfternoon;
  return t.nav.goodEvening;
}

export function AppHeader() {
  const { user, token } = useAuth();
  const router = useRouter();
  const t = useT();
  // historyMeals = all logged days (`meals` only holds one day). Streak logic is
  // shared in utils/streak so every screen shows the same number.
  const { historyMeals } = useMeals();
  const streak = mealStreak(historyMeals.map((m) => m.date));

  // Notification bell badge — refetched whenever Home regains focus (e.g. back
  // from the notifications screen, which marks everything read)
  const [unread, setUnread] = useState(0);
  useFocusEffect(useCallback(() => {
    if (token) getUnreadCount(token).then(setUnread).catch(() => {});
  }, [token]));

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{(user?.name ?? "U")[0].toUpperCase()}</AppText>
        </View>
        <View>
          <AppText style={styles.greeting}>{greetingForHour(new Date().getHours(), t)}</AppText>
          <AppText style={styles.name}>{user?.name ?? t.nav.fallbackName}</AppText>
        </View>
      </View>

      <View style={styles.right}>
        {/* Frosted pill — same visual language as the avatar circle on this header */}
        {streak > 0 && (
          <View style={styles.streakPill}>
            <AppText style={styles.streakEmoji}>🔥</AppText>
            <AppText style={styles.streakNum}>{streak}</AppText>
          </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  greeting: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  name: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99,
  },
  streakEmoji: { fontSize: 14 },
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
});
