import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { scheduleDailyReminder, cancelNotification } from "../utils/notifications";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

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
      backgroundColor: bg ?? "rgba(37,99,235,0.08)",
      alignItems: "center", justifyContent: "center",
    }}>
      <AppText style={{ fontSize: 15 }}>{icon}</AppText>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [reminderOn, setReminderOn] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

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
          paddingTop: theme.space.lg,
          paddingBottom: 120,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + title */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 4,
            opacity: pressed ? 0.6 : 1, alignSelf: "flex-start",
          })}
        >
          <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
          <AppText style={{ fontSize: 14, color: theme.colors.primary, fontWeight: "600" }}>
            Profile
          </AppText>
        </Pressable>

        <View style={{ gap: 4 }}>
          <AppText variant="h1">Settings</AppText>
          <AppText variant="muted">Tune how HealthySnap works for you.</AppText>
        </View>

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

        {/* GENERAL */}
        <SectionLabel>General</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <Pressable
            onPress={() => Alert.alert("Coming soon", "Vietnamese language support is on the way! 🌐")}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconBox icon="🌐" />
            <AppText variant="body2" style={{ flex: 1, fontWeight: "600" }}>Language</AppText>
            <AppText variant="body2" style={{ color: theme.colors.muted }}>English</AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* ABOUT */}
        <AppText variant="subtle" style={{ textAlign: "center", fontSize: 11, marginTop: 4 }}>
          HealthySnap · v1.0.0
        </AppText>
      </ScrollView>
    </Screen>
  );
}
