import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/utils/api";
import { useT } from "@/i18n";
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
  const { user, token, updateProfile } = useAuth();
  const router = useRouter();
  const t = useT();

  const [reminderOn, setReminderOn] = useState(false);
  // Reminder time is a user choice now (was hardcoded 19:00)
  const [reminderTime, setReminderTime] = useState("19:00");
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState("19:00");

  // Change password (expandable card, mirrors the calorie-goal editor)
  const [pwEditing, setPwEditing] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
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
      Alert.alert(t.common.errorTitle, e.message || t.settings.failedPrivacy);
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
      Alert.alert(t.common.errorTitle, e.message || t.settings.failedLanguage);
    } finally {
      setSavingLang(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("mealReminderId").then((id) => setReminderOn(!!id));
    AsyncStorage.getItem("mealReminderTime").then((v) => { if (v) setReminderTime(v); });
  }, []);

  // ── Reminder time: "HH:MM" (24h). Changing it while ON reschedules in place ─
  const parseTime = (raw: string): [number, number] | null => {
    const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]), min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return [h, min];
  };

  const saveReminderTime = async (raw: string) => {
    const parsed = parseTime(raw);
    if (!parsed) {
      Alert.alert(t.common.errorTitle, t.settings.invalidTime);
      return;
    }
    const label = `${String(parsed[0]).padStart(2, "0")}:${String(parsed[1]).padStart(2, "0")}`;
    setTimeModalVisible(false);
    setReminderTime(label);
    await AsyncStorage.setItem("mealReminderTime", label);
    if (reminderOn) {
      const oldId = await AsyncStorage.getItem("mealReminderId");
      await cancelNotification(oldId);
      const id = await scheduleDailyReminder(parsed[0], parsed[1]);
      if (id) await AsyncStorage.setItem("mealReminderId", id);
    }
  };

  // ── Change password (requires the current one; forgot-flow stays on login) ──
  const handleChangePassword = async () => {
    if (pwNew.length < 6) return Alert.alert(t.common.errorTitle, t.auth.passwordTooShort);
    if (!/[A-Z]/.test(pwNew)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedUpper);
    if (!/[0-9]/.test(pwNew)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedNumber);
    if (pwNew !== pwConfirm) return Alert.alert(t.common.errorTitle, t.auth.passwordsNoMatch);
    setPwSaving(true);
    try {
      await apiRequest("/user/change-password", "POST", { currentPassword: pwCurrent, newPassword: pwNew }, token ?? undefined);
      setPwEditing(false);
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      Alert.alert(t.auth.resetSuccessTitle, t.settings.passwordChanged);
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.settings.changePasswordFailed);
    } finally {
      setPwSaving(false);
    }
  };

  // ── Daily calorie goal: custom override or auto (recomputed from TDEE) ──────
  const handleSaveGoal = async () => {
    const n = Number(goalInput);
    if (!goalInput.trim() || isNaN(n) || n < 800 || n > 10000) {
      Alert.alert(t.settings.invalidGoal, t.settings.goalRange);
      return;
    }
    setIsSavingGoal(true);
    try {
      await updateProfile({ calorieGoal: n });
      setEditingGoal(false);
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.settings.failedGoal);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleAutoGoal = async () => {
    // Backend recomputes calorieGoal from TDEE when calorieGoal is absent —
    // resend current body metrics so it has the inputs to calculate
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) {
      Alert.alert(t.settings.missingInfo, t.settings.missingInfoMsg);
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
      Alert.alert(t.common.errorTitle, e.message || t.settings.failedGoal);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // ── Daily meal reminder via expo-notifications (time user-configurable) ─────
  const toggleReminder = async (value: boolean) => {
    if (value) {
      const [h, m] = parseTime(reminderTime) ?? [19, 0];
      const id = await scheduleDailyReminder(h, m);
      if (!id) {
        Alert.alert(t.profile.permissionNeeded, t.settings.reminderPermMsg);
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
        <ScreenHeader title={t.settings.title} />
        <AppText variant="muted" style={styles.subtitle}>{t.settings.subtitle}</AppText>

        {/* GOALS */}
        <SectionLabel>{t.settings.goals}</SectionLabel>
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
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.dailyCalorieGoal}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.goalRowSub}</AppText>
            </View>
            <AppText variant="body2" style={styles.rowValue}>{(user?.calorieGoal ?? 2000).toLocaleString()} {t.common.kcal}</AppText>
            <Ionicons name={editingGoal ? "chevron-up" : "chevron-forward"} size={16} color={theme.colors.subtle} />
          </Pressable>

          {editingGoal && (
            <View style={styles.goalEditor}>
              <TextField label={t.settings.customGoal} placeholder={t.settings.customGoalPlaceholder} value={goalInput} onChangeText={setGoalInput} keyboardType="number-pad" />
              <View style={styles.goalBtns}>
                <View style={styles.flex1}>
                  <Button title={t.settings.useAuto} variant="secondary" onPress={handleAutoGoal} disabled={isSavingGoal} />
                </View>
                <View style={styles.flex1}>
                  <Button title={isSavingGoal ? t.common.saving : t.common.save} onPress={handleSaveGoal} disabled={isSavingGoal} />
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* INSIGHTS */}
        <SectionLabel>{t.settings.insights}</SectionLabel>
        <Card style={styles.card}>
          <Pressable onPress={() => router.push("/profile/progress" as any)} style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}>
            <IconBox icon="📊" bg="rgba(5,150,105,0.12)" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.progressStats}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.progressSub}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* REMINDERS */}
        <SectionLabel>{t.settings.reminders}</SectionLabel>
        <Card style={styles.card}>
          <View style={styles.rowStatic}>
            <IconBox icon="⏰" bg="rgba(255,138,61,0.12)" />
            {/* Tap the text side to change the time; the switch keeps its own hit area */}
            <Pressable
              onPress={() => { setTimeInput(reminderTime); setTimeModalVisible(true); }}
              style={({ pressed }) => [styles.rowText, pressed && styles.dim]}
            >
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.mealReminder}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.mealReminderSub(reminderTime)}</AppText>
            </Pressable>
            <Switch
              value={reminderOn}
              onValueChange={toggleReminder}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* SECURITY */}
        <SectionLabel>{t.settings.security}</SectionLabel>
        <Card style={styles.card}>
          <Pressable
            onPress={() => setPwEditing((v) => !v)}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="🔑" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.changePassword}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.changePasswordSub}</AppText>
            </View>
            <Ionicons name={pwEditing ? "chevron-up" : "chevron-forward"} size={16} color={theme.colors.subtle} />
          </Pressable>

          {pwEditing && (
            <View style={styles.pwEditor}>
              <TextField
                label={t.settings.currentPassword}
                placeholder="••••••••"
                value={pwCurrent}
                onChangeText={setPwCurrent}
                secureTextEntry
                textContentType="password"
              />
              <TextField
                label={t.auth.newPassword}
                placeholder="••••••••"
                value={pwNew}
                onChangeText={setPwNew}
                secureTextEntry
                textContentType="newPassword"
              />
              <TextField
                label={t.auth.confirmPassword}
                placeholder="••••••••"
                value={pwConfirm}
                onChangeText={setPwConfirm}
                secureTextEntry
                textContentType="newPassword"
              />
              <Button
                title={pwSaving ? t.common.saving : t.settings.changePassword}
                onPress={handleChangePassword}
                disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
              />
            </View>
          )}
        </Card>

        {/* LANGUAGE */}
        <SectionLabel>{t.settings.language}</SectionLabel>
        <Card style={styles.langCard}>
          <View style={styles.langHead}>
            <IconBox icon="🌐" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.appLanguage}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.appLanguageSub}</AppText>
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
        <SectionLabel>{t.settings.privacy}</SectionLabel>
        <Card style={styles.card}>
          <View style={styles.rowStatic}>
            <IconBox icon="🔒" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.privateProfile}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.privateProfileSub}</AppText>
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

      {/* Reminder-time input (24h HH:MM) */}
      <Modal transparent visible={timeModalVisible} animationType="fade" onRequestClose={() => setTimeModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setTimeModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Card style={styles.timeCard}>
              <View style={styles.timeHead}>
                <AppText variant="h2">{t.settings.reminderTimeTitle}</AppText>
                <AppText variant="muted" style={styles.rowSub}>{t.settings.reminderTimeSub}</AppText>
              </View>
              <TextField
                label={t.settings.reminderTimeLabel}
                placeholder="19:30"
                value={timeInput}
                onChangeText={setTimeInput}
                keyboardType="numbers-and-punctuation"
                inputProps={{ autoFocus: true, maxLength: 5 }}
              />
              <View style={styles.timeActions}>
                <View style={styles.flex1}>
                  <Button title={t.common.cancel} variant="secondary" onPress={() => setTimeModalVisible(false)} />
                </View>
                <View style={styles.flex1}>
                  <Button title={t.common.save} onPress={() => saveReminderTime(timeInput)} />
                </View>
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
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

  pwEditor: { gap: theme.space.md, paddingBottom: theme.space.md },

  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", paddingHorizontal: theme.space.xl,
  },
  timeCard: { padding: theme.space.xl, gap: theme.space.lg },
  timeHead: { gap: 4 },
  timeActions: { flexDirection: "row", gap: theme.space.md },

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
