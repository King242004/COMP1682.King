import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
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
import { TextField } from "@/ui/components/TextField";
import { resolveLanguage, type Lang } from "@/utils/language";

// Small uppercase section label above each settings card
function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="subtle" style={{
      fontSize: 12, fontWeight: "700",
      textTransform: "uppercase", letterSpacing: 0.6,
      marginBottom: -6, marginLeft: 4,
    }}>
      {children}
    </AppText>
  );
}

// Reusable icon square for settings rows
function IconBox({ icon, bg }: { icon: string; bg?: string }) {
  return (
    <View style={{
      width: 34, height: 34, borderRadius: 11,
      backgroundColor: bg ?? "rgba(8,145,178,0.08)",
      alignItems: "center", justifyContent: "center",
    }}>
      <AppText style={{ fontSize: 15 }}>{icon}</AppText>
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
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: 60,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" />
        <AppText variant="muted" style={{ marginTop: -8 }}>Tune how MealMate works for you.</AppText>

        {/* GOALS */}
        <SectionLabel>Goals</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <Pressable
            onPress={() => {
              setGoalInput(String(user?.calorieGoal ?? 2000));
              setEditingGoal((v) => !v);
            }}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconBox icon="🎯" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body2" style={{ fontWeight: "600" }}>Daily calorie goal</AppText>
              <AppText variant="subtle" style={{ fontSize: 11 }}>
                Tap to set manually or switch back to auto
              </AppText>
            </View>
            <AppText variant="body2" style={{ fontWeight: "700", color: theme.colors.primary }}>
              {(user?.calorieGoal ?? 2000).toLocaleString()} kcal
            </AppText>
            <Ionicons
              name={editingGoal ? "chevron-up" : "chevron-forward"}
              size={16}
              color={theme.colors.subtle}
            />
          </Pressable>

          {editingGoal && (
            <View style={{ gap: theme.space.md, paddingBottom: theme.space.md }}>
              <TextField
                label="Custom goal (kcal)"
                placeholder="e.g. 1800"
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
              />
              <View style={{ flexDirection: "row", gap: theme.space.md }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Use auto (TDEE)"
                    variant="secondary"
                    onPress={handleAutoGoal}
                    disabled={isSavingGoal}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={isSavingGoal ? "Saving..." : "Save"}
                    onPress={handleSaveGoal}
                    disabled={isSavingGoal}
                  />
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* INSIGHTS */}
        <SectionLabel>Insights</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <Pressable
            onPress={() => router.push("/profile/progress" as any)}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconBox icon="📊" bg="rgba(47,191,113,0.12)" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body2" style={{ fontWeight: "600" }}>Progress & statistics</AppText>
              <AppText variant="subtle" style={{ fontSize: 11 }}>Calories, nutrition and weekly trends</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* REMINDERS */}
        <SectionLabel>Reminders</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
            <IconBox icon="⏰" bg="rgba(255,138,61,0.12)" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body2" style={{ fontWeight: "600" }}>Meal reminder</AppText>
              <AppText variant="subtle" style={{ fontSize: 11 }}>Daily at 7:00 PM</AppText>
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
        <Card style={{ padding: theme.space.lg, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <IconBox icon="🌐" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body2" style={{ fontWeight: "600" }}>AI Coach language</AppText>
              <AppText variant="subtle" style={{ fontSize: 11 }}>
                Coach trả lời theo ngôn ngữ này. Mặc định theo điện thoại.
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["en", "English"], ["vi", "Tiếng Việt"]] as ["en" | "vi", string][]).map(([key, label]) => {
              const active = currentLang === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleSetLanguage(key)}
                  disabled={savingLang}
                  style={({ pressed }) => ({
                    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.tint : theme.colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <AppText style={{ fontWeight: "700", color: active ? theme.colors.primary : theme.colors.subtle }}>
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* PRIVACY */}
        <SectionLabel>Privacy</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
            <IconBox icon="🔒" bg="rgba(8,145,178,0.08)" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body2" style={{ fontWeight: "600" }}>Private profile</AppText>
              <AppText variant="subtle" style={{ fontSize: 11 }}>
                Hide your posts from Explore and other people. Only you can see them.
              </AppText>
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
        <AppText variant="subtle" style={{ textAlign: "center", fontSize: 11, marginTop: 4 }}>
          MealMate · v1.0.0
        </AppText>
      </ScrollView>
    </Screen>
  );
}
