import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

const GOAL_KEYS = ["lose_weight", "gain_muscle", "eat_healthy"] as const;
const ACTIVITY_KEYS = ["sedentary", "moderate", "active"] as const;
const CONDITION_KEYS = ["diabetes", "hypertension", "gout", "high_cholesterol", "gastritis", "none"] as const;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changeName } = useAuth();
  const t = useT();

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
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert(t.editProfile.invalidName, t.editProfile.nameMin);
      return;
    }
    // \p{L} = any Unicode letter (supports Vietnamese, Chinese, etc.)
    if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
      Alert.alert(t.editProfile.invalidName, t.editProfile.nameLettersOnly);
      return;
    }
    if (age && (Number(age) < 10 || Number(age) > 120)) {
      Alert.alert(t.editProfile.invalidAge, t.editProfile.ageRange);
      return;
    }
    if (weight && (Number(weight) < 20 || Number(weight) > 300)) {
      Alert.alert(t.editProfile.invalidWeight, t.editProfile.weightRange);
      return;
    }
    if (height && (Number(height) < 50 || Number(height) > 250)) {
      Alert.alert(t.editProfile.invalidHeight, t.editProfile.heightRange);
      return;
    }
    setIsSaving(true);
    try {
      if (trimmedName !== user?.name) await changeName(trimmedName);
      await updateProfile({
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        goal: goal || undefined,
        activityLevel: activityLevel || undefined,
        conditions,
        // Chuỗi rỗng sẽ xóa sở thích ăn uống đã lưu trước đó.
        tastePreferences: taste.trim(),
      });
      router.back();
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.editProfile.updateFailed);
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
        <ScreenHeader title={t.editProfile.title} />

        <Card style={styles.card}>
          {/* Name */}
          <TextField label={t.editProfile.nameLabel} placeholder={t.editProfile.namePlaceholder} value={name} onChangeText={setName} autoCapitalize="words" />

          {/* Gender */}
          <View style={styles.field}>
            <AppText variant="muted">{t.profile.gender}</AppText>
            <View style={styles.genderRow}>
              {["male", "female"].map((g) => {
                const active = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g as "male" | "female")}
                    style={[styles.genderBtn, active ? styles.optActive : styles.optIdle]}
                  >
                    <AppText style={[styles.optText, active && styles.optTextActive]}>{t.labels.gender[g]}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField label={t.profile.age} placeholder={t.editProfile.agePlaceholder} value={age} onChangeText={setAge} keyboardType="number-pad" />
          <TextField label={t.editProfile.weightLabel} placeholder={t.editProfile.weightPlaceholder} value={weight} onChangeText={setWeight} keyboardType="number-pad" />
          <TextField label={t.editProfile.heightLabel} placeholder={t.editProfile.heightPlaceholder} value={height} onChangeText={setHeight} keyboardType="number-pad" />

          <View style={styles.field}>
            <AppText variant="muted">{t.profile.goal}</AppText>
            <View style={styles.stackList}>
              {GOAL_KEYS.map((key) => {
                const active = goal === key;
                return (
                  <Pressable key={key} onPress={() => setGoal(key)} style={[styles.stackBtn, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optTextLeft, active && styles.optTextActive]}>{t.labels.goal[key]}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.field}>
            <AppText variant="muted">{t.editProfile.activityLabel}</AppText>
            <View style={styles.stackList}>
              {ACTIVITY_KEYS.map((key) => {
                const active = activityLevel === key;
                return (
                  <Pressable key={key} onPress={() => setActivityLevel(key)} style={[styles.stackBtn, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optTextLeft, active && styles.optTextActive]}>{t.labels.activity[key]}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Conditions */}
          <View style={styles.field}>
            <AppText variant="muted">{t.editProfile.healthConditions}</AppText>
            <View style={styles.chipWrap}>
              {CONDITION_KEYS.map((c) => {
                const active = isConditionActive(c);
                return (
                  <Pressable key={c} onPress={() => toggleCondition(c)} style={[styles.chip, active ? styles.optActive : styles.optIdle]}>
                    <AppText style={[styles.optText, active && styles.optTextActive]}>{t.labels.condition[c]}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Taste preferences — read by every AI feature (suggest, coach, weekly plan) */}
          <View style={styles.field}>
            <TextField
              label={t.editProfile.tasteLabel}
              placeholder={t.editProfile.tastePlaceholder}
              value={taste}
              onChangeText={setTaste}
              textContentType="none"
            />
            <AppText variant="subtle" style={styles.hint}>{t.editProfile.tasteHint}</AppText>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              <Button title={t.common.cancel} variant="secondary" onPress={() => router.back()} />
            </View>
            <View style={styles.actionBtn}>
              <Button title={isSaving ? t.common.saving : t.common.save} onPress={handleSave} disabled={isSaving} />
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
