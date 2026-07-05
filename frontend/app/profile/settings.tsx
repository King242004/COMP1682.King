import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { scheduleDailyReminder, cancelNotification } from "@/utils/notifications";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { SectionLabel } from "@/ui/components/SectionLabel";
import { TextField } from "@/ui/components/TextField";
import { resolveLanguage, type Lang } from "@/utils/language";

// Reusable icon square for settings rows
function IconBox({ icon, bg }: { icon: string; bg?: string }) {
  return (
    <View style={[styles.iconBox, bg ? { backgroundColor: bg } : null]}>
      <AppText style={styles.iconBoxText}>{icon}</AppText>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [reminderOn, setReminderOn] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Private profile: mirrors user.isPrivate, toggled optimistically
  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivate);
  const togglePrivate = async (value: boolean) => {
    setIsPrivate(value);
    try {
      await updateProfile({ isPrivate: value });
    } catch (e: any) {
      setIsPrivate(!value); // revert
      Alert.alert("Error", e.message || "Failed to update privacy.");
    }
  };

  // Language: effective = saved choice or device default. Tapping persists the choice.
  const currentLang = resolveLanguage(user?.language);
  const [savingLang, setSavingLang] = useState(false);
  const handleSetLanguage = async (l: Lang) => {
    if (l === user?.language) return;
    setSavingLang(true);
    try {
      await updateProfile({ language: l });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to change language.");
    } finally {
      setSavingLang(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("mealReminderId").then((id) => setReminderOn(!!id));
  }, []);

  // ── Daily calorie goal: custom override or auto (recomputed from TDEE) ──────
  const handleSaveGoal = async () => {
    const n = Number(goalInput);
    if (!goalInput.trim() || isNaN(n) || n < 800 || n > 10000) {
      Alert.alert("Invalid goal", "Calorie goal must be between 800 and 10,000 kcal.");
      return;
    }
    setIsSavingGoal(true);
    try {
      await updateProfile({ calorieGoal: n });
      setEditingGoal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update goal.");
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleAutoGoal = async () => {
    // Backend recomputes calorieGoal from TDEE when calorieGoal is absent —
    // resend current body metrics so it has the inputs to calculate
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) {
      Alert.alert(
        "Missing info",
        "Add your weight, height, age and gender in Profile first, so we can calculate your goal automatically."
      );
      return;
    }
    setIsSavingGoal(true);
    try {
      await updateProfile({
        gender: user.gender ?? undefined,
        age: user.age ?? undefined,
        weight: user.weight ?? undefined,
        height: user.height ?? undefined,
        goal: user.goal,
        activityLevel: user.activityLevel ?? undefined,
      });
      setEditingGoal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update goal.");
    } finally {
      setIsSavingGoal(false);
    }
  };

  // ── Daily meal reminder (19:00) via expo-notifications ─────────────────────
  const toggleReminder = async (value: boolean) => {
    if (value) {
      const id = await scheduleDailyReminder(19, 0);
      if (!id) {
        Alert.alert("Permission needed", "Allow notifications to get daily meal reminders.");
        return;
      }
      await AsyncStorage.setItem("mealReminderId", id);
      setReminderOn(true);
    } else {
      const id = await AsyncStorage.getItem("mealReminderId");
      await cancelNotification(id);
      await AsyncStorage.removeItem("mealReminderId");
      setReminderOn(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Settings" />
        <AppText variant="muted" style={styles.subtitle}>Tune how MealMate works for you.</AppText>

        {/* GOALS */}
        <SectionLabel>Goals</SectionLabel>
        <Card style={styles.card}>
          <Pressable
            onPress={() => {
              setGoalInput(String(user?.calorieGoal ?? 2000));
              setEditingGoal((v) => !v);
            }}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="🎯" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>Daily calorie goal</AppText>
              <AppText variant="subtle" style={styles.rowSub}>Tap to set manually or switch back to auto</AppText>
            </View>
            <AppText variant="body2" style={styles.rowValue}>{(user?.calorieGoal ?? 2000).toLocaleString()} kcal</AppText>
            <Ionicons name={editingGoal ? "chevron-up" : "chevron-forward"} size={16} color={theme.colors.subtle} />
          </Pressable>

          {editingGoal && (
            <View style={styles.goalEditor}>
              <TextField label="Custom goal (kcal)" placeholder="e.g. 1800" value={goalInput} onChangeText={setGoalInput} keyboardType="number-pad" />
              <View style={styles.goalBtns}>
                <View style={styles.flex1}>
                  <Button title="Use auto (TDEE)" variant="secondary" onPress={handleAutoGoal} disabled={isSavingGoal} />
                </View>
                <View style={styles.flex1}>
                  <Button title={isSavingGoal ? "Saving..." : "Save"} onPress={handleSaveGoal} disabled={isSavingGoal} />
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* INSIGHTS */}
        <SectionLabel>Insights</SectionLabel>
        <Card style={styles.card}>
          <Pressable onPress={() => router.push("/profile/progress" as any)} style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}>
            <IconBox icon="📊" bg="rgba(5,150,105,0.12)" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>Progress & statistics</AppText>
              <AppText variant="subtle" style={styles.rowSub}>Calories, nutrition and weekly trends</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* REMINDERS */}
        <SectionLabel>Reminders</SectionLabel>
        <Card style={styles.card}>
          <View style={styles.rowStatic}>
            <IconBox icon="⏰" bg="rgba(255,138,61,0.12)" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>Meal reminder</AppText>
              <AppText variant="subtle" style={styles.rowSub}>Daily at 7:00 PM</AppText>
            </View>
            <Switch
              value={reminderOn}
              onValueChange={toggleReminder}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* LANGUAGE */}
        <SectionLabel>Language</SectionLabel>
        <Card style={styles.langCard}>
          <View style={styles.langHead}>
            <IconBox icon="🌐" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>AI Coach language</AppText>
              <AppText variant="subtle" style={styles.rowSub}>Coach trả lời theo ngôn ngữ này. Mặc định theo điện thoại.</AppText>
            </View>
          </View>
          <View style={styles.langBtns}>
            {([["en", "English"], ["vi", "Tiếng Việt"]] as ["en" | "vi", string][]).map(([key, label]) => {
              const active = currentLang === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleSetLanguage(key)}
                  disabled={savingLang}
                  style={({ pressed }) => [styles.langBtn, active ? styles.langBtnActive : styles.langBtnIdle, pressed && styles.dim]}
                >
                  <AppText style={[styles.langBtnText, active && styles.langBtnTextActive]}>{label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* PRIVACY */}
        <SectionLabel>Privacy</SectionLabel>
        <Card style={styles.card}>
          <View style={styles.rowStatic}>
            <IconBox icon="🔒" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>Private profile</AppText>
              <AppText variant="subtle" style={styles.rowSub}>Hide your posts from Explore and other people. Only you can see them.</AppText>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={togglePrivate}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* ABOUT */}
        <AppText variant="subtle" style={styles.version}>MealMate · v1.0.0</AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  subtitle: { marginTop: -8 },
  card: { paddingVertical: 4, paddingHorizontal: theme.space.lg },

  iconBox: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },
  iconBoxText: { fontSize: 15 },

  rowTappable: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowStatic: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: "600" },
  rowSub: { fontSize: 11 },
  rowValue: { fontWeight: "700", color: theme.colors.primary },
  dim: { opacity: 0.6 },

  goalEditor: { gap: theme.space.md, paddingBottom: theme.space.md },
  goalBtns: { flexDirection: "row", gap: theme.space.md },
  flex1: { flex: 1 },

  langCard: { padding: theme.space.lg, gap: 12 },
  langHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  langBtns: { flexDirection: "row", gap: 8 },
  langBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  langBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  langBtnIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  langBtnText: { fontWeight: "700", color: theme.colors.subtle },
  langBtnTextActive: { color: theme.colors.primary },

  version: { textAlign: "center", fontSize: 11, marginTop: 4 },
});
