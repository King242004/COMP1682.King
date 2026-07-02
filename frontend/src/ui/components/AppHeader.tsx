// Blue app header shown on all 4 tabs: avatar + greeting + streak pill.
import { Platform, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { mealStreak } from "@/utils/streak";
import { theme } from "@/ui/theme";

function greetingForHour(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function AppHeader() {
  const { user } = useAuth();
  // historyMeals = all logged days (`meals` only holds one day). Streak logic is
  // shared in utils/streak so every screen shows the same number.
  const { historyMeals } = useMeals();
  const streak = mealStreak(historyMeals.map((m) => m.date));

  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.space.lg,
      paddingTop: Platform.OS === "ios" ? 52 : 16,
      paddingBottom: 16,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.15)",
          borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
            {(user?.name ?? "U")[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            {greetingForHour(new Date().getHours())}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
            {user?.name ?? "there"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* Frosted pill — same visual language as the avatar circle on this header */}
        {streak > 0 && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
            paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99,
          }}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>{streak}</Text>
          </View>
        )}
        {/* Bell button removed: it had no onPress (dead button). Bring it back when a
            notifications screen exists (e.g. proactive coach nudges in the backlog). */}
      </View>
    </View>
  );
}
