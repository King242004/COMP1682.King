import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { GOALS, ACTIVITY_LEVELS } from "@/utils/profileOptions";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

const CONDITIONS = ["diabetes", "hypertension", "none"];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changeName } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : "");
  const [height, setHeight] = useState(user?.height ? String(user.height) : "");
  const [gender, setGender] = useState<"male" | "female" | "">((user?.gender as "male" | "female" | "") ?? "");
  const [goal, setGoal] = useState(user?.goal ?? "eat_healthy");
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel ?? "moderate");
  const [conditions, setConditions] = useState<string[]>(user?.conditions ?? []);
  const [taste, setTaste] = useState(user?.tastePreferences ?? "");

  const toggleCondition = (c: string) => {
    if (c === "none") { setConditions([]); return; }
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev.filter((x) => x !== "none"), c]
    );
  };

  const isConditionActive = (c: string) => (c === "none" ? conditions.length === 0 : conditions.includes(c));

  const handleSave = async () => {
    // Validate name first (backend rule: 2+ chars, letters only)
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert("Invalid name", "Name must be at least 2 characters.");
      return;
    }
    // \p{L} = any Unicode letter (supports Vietnamese, Chinese, etc.)
    if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
      Alert.alert("Invalid name", "Name must contain only letters and spaces.");
      return;
    }
    if (age && (Number(age) < 10 || Number(age) > 120)) {
      Alert.alert("Invalid age", "Age must be between 10 and 120.");
      return;
    }
    if (weight && (Number(weight) < 20 || Number(weight) > 300)) {
      Alert.alert("Invalid weight", "Weight must be between 20 and 300 kg.");
      return;
    }
    if (height && (Number(height) < 50 || Number(height) > 250)) {
      Alert.alert("Invalid height", "Height must be between 50 and 250 cm.");
      return;
    }
    setIsSaving(true);
    try {
      // Only call changeName if it actually changed (saves a request)
      if (trimmedName !== user?.name) await changeName(trimmedName);
      await updateProfile({
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        goal: goal || undefined,
        activityLevel: activityLevel || undefined,
        conditions,
        tastePreferences: taste.trim(), // empty string clears saved preferences
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Edit profile" />

        <Card style={styles.card}>
          {/* Name */}
          <TextField label="Name" placeholder="e.g. John Doe" value={name} onChangeText={setName} autoCapitalize="words" />

          {/* Gender */}
          <View style={styles.field}>
            <AppText variant="muted">Gender</AppText>
            <View style={styles.genderRow}>
              {["male", "female"].map((g) => {
                const active = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g as "male" | "female")}
                    style={[styles.genderBtn, active ? styles.optActive : styles.optIdle]}
                  >
                    <AppText style={[styles.optText, active && styles.optTextActive]}>{g}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField label="Age" placeholder="e.g. 21" value={age} onChangeText={setAge} keyboardType="number-pad" />
          <TextField label="Weight (kg)" placeholder="e.g. 65" value={weight} onChangeText={setWeight} keyboardType="number-pad" />
          <TextField label="Height (cm)" placeholder="e.g. 170" value={height} onChangeText={setHeight} keyboardType="number-pad" />

          {/* Goal */}
          <View style={styles.field}>
            <AppText variant="muted">Goal</AppText>
            <View style={styles.stackList}>
              {GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <Pressable key={g.key} onPress={() => setGoal(g.key)} style={[styles.stackBtn, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optTextLeft, active && styles.optTextActive]}>{g.label}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.field}>
            <AppText variant="muted">Activity Level</AppText>
            <View style={styles.stackList}>
              {ACTIVITY_LEVELS.map((a) => {
                const active = activityLevel === a.key;
                return (
                  <Pressable key={a.key} onPress={() => setActivityLevel(a.key)} style={[styles.stackBtn, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optTextLeft, active && styles.optTextActive]}>{a.label}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Conditions */}
          <View style={styles.field}>
            <AppText variant="muted">Health Conditions</AppText>
            <View style={styles.chipWrap}>
              {CONDITIONS.map((c) => {
                const active = isConditionActive(c);
                return (
                  <Pressable key={c} onPress={() => toggleCondition(c)} style={[styles.chip, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optText, active && styles.optTextActive]}>{c}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Taste preferences — read by every AI feature (suggest, coach, weekly plan) */}
          <View style={styles.field}>
            <TextField
              label="Taste preferences"
              placeholder="e.g. không ăn hải sản, thích gà, ít cay..."
              value={taste}
              onChangeText={setTaste}
              textContentType="none"
            />
            <AppText variant="subtle" style={styles.hint}>
              AI (gợi ý món, Coach, kế hoạch tuần) sẽ luôn tôn trọng khẩu vị này.
            </AppText>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
            </View>
            <View style={styles.actionBtn}>
              <Button title={isSaving ? "Saving..." : "Save"} onPress={handleSave} disabled={isSaving} />
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  card: { padding: theme.space.lg, gap: theme.space.md },
  field: { gap: 6 },
  // Shared option-button visual states
  optActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  optIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  optText: { color: theme.colors.subtle, textTransform: "capitalize" },
  optTextLeft: { color: theme.colors.subtle },
  optTextActive: { color: theme.colors.primary },
  genderRow: { flexDirection: "row", gap: 8 },
  genderBtn: { flex: 1, padding: 10, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  stackList: { gap: 6 },
  stackBtn: { padding: 12, borderRadius: 12, borderWidth: 1.5 },
  chipWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5 },
  hint: { fontSize: 11 },
  actions: { flexDirection: "row", gap: theme.space.md },
  actionBtn: { flex: 1 },
});
