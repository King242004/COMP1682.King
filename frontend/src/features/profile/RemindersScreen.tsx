import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/i18n";
import {
  MEAL_KEYS, applyReminder, emptyReminders, formatTime, loadReminders, parseTime,
  type MealKey, type ReminderMap,
} from "@/utils/reminders";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

const ICONS: Record<MealKey, keyof typeof Ionicons.glyphMap> = {
  breakfast: "sunny-outline",
  lunch: "partly-sunny-outline",
  dinner: "moon-outline",
  snack: "nutrition-outline",
};

// One daily reminder per meal type. Each row owns its own switch and time, so
// there is nothing to add or remove and turning a meal on takes a single tap.
export default function RemindersScreen() {
  const t = useT();
  const [state, setState] = useState<ReminderMap>(emptyReminders());
  const [editing, setEditing] = useState<MealKey | null>(null);
  const [timeInput, setTimeInput] = useState("");
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => { loadReminders().then(setState); }, []));

  const mealLabel = (key: MealKey) => t.labels.mealType[key] ?? key;

  const notifContent = (key: MealKey) => ({
    title: t.settings.reminderNotifTitle(mealLabel(key)),
    body: t.settings.reminderNotifBody,
  });

  const toggle = async (key: MealKey, value: boolean) => {
    if (busy) return;
    setBusy(true);
    // Optimistic flip so the switch responds immediately, corrected below if
    // the operating system refuses permission
    setState((prev) => ({ ...prev, [key]: { ...prev[key], enabled: value } }));
    try {
      const next = await applyReminder(
        state, key, { enabled: value, time: state[key].time }, notifContent(key)
      );
      setState(next);
      if (value && !next[key].enabled) {
        Alert.alert(t.profile.permissionNeeded, t.settings.reminderPermMsg);
      }
    } finally {
      setBusy(false);
    }
  };

  const saveTime = async () => {
    if (!editing) return;
    const parsed = parseTime(timeInput);
    if (!parsed) {
      Alert.alert(t.common.errorTitle, t.settings.invalidTime);
      return;
    }
    const key = editing;
    const time = formatTime(parsed[0], parsed[1]);
    setEditing(null);
    setBusy(true);
    try {
      // Reschedules in place when the reminder is already on
      setState(await applyReminder(state, key, { enabled: state[key].enabled, time }, notifContent(key)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t.settings.mealReminder} />

        <AppText variant="muted" style={styles.intro}>{t.settings.reminderScreenIntro}</AppText>

        <Card style={styles.card}>
          {MEAL_KEYS.map((key, i) => (
            <View key={key} style={[styles.row, i > 0 && styles.rowDivider]}>
              <View style={styles.iconBox}>
                <Ionicons name={ICONS[key]} size={17} color={theme.colors.primary} />
              </View>

              <View style={styles.rowText}>
                <AppText variant="body2" style={styles.rowTitle}>{mealLabel(key)}</AppText>
                <Pressable
                  onPress={() => { setEditing(key); setTimeInput(state[key].time); }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${mealLabel(key)}, ${state[key].time}`}
                >
                  <AppText style={styles.time}>{state[key].time}</AppText>
                </Pressable>
              </View>

              <Switch
                value={state[key].enabled}
                onValueChange={(v) => toggle(key, v)}
                disabled={busy}
                accessibilityLabel={`${t.settings.mealReminder}, ${mealLabel(key)}`}
                accessibilityState={{ checked: state[key].enabled, disabled: busy }}
                trackColor={{ true: theme.colors.primary }}
              />
            </View>
          ))}
        </Card>

        <AppText variant="subtle" style={styles.note}>{t.settings.reminderTapTime}</AppText>

        <Card style={styles.tipCard}>
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={17} color={theme.colors.primary} />
            <AppText variant="subtle" style={styles.tipText}>{t.settings.reminderTip}</AppText>
          </View>
        </Card>

        <AppText variant="subtle" style={styles.note}>{t.settings.reminderBlindNote}</AppText>
      </ScrollView>

      {/* Time editor */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <AppText variant="h2">{t.settings.reminderTimeTitle}</AppText>
            <AppText variant="muted" style={styles.modalSub}>{t.settings.reminderTimeSub}</AppText>
            <TextField
              label={t.settings.reminderTimeLabel}
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              placeholder="19:30"
            />
            <View style={styles.modalBtns}>
              <View style={styles.flex1}>
                <Button title={t.common.cancel} variant="secondary" onPress={() => setEditing(null)} />
              </View>
              <View style={styles.flex1}>
                <Button title={t.common.save} onPress={saveTime} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.md },
  intro: { fontSize: 13, lineHeight: 19 },
  card: { paddingHorizontal: theme.space.md },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: theme.space.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  iconBox: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: "700" },
  time: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  note: { fontSize: 11, marginLeft: 4, lineHeight: 16 },
  tipCard: { padding: theme.space.md, backgroundColor: theme.colors.tintSoft },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.sm },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", paddingHorizontal: theme.space.xl,
  },
  modalCard: { padding: theme.space.lg, gap: theme.space.md },
  modalSub: { fontSize: 12 },
  modalBtns: { flexDirection: "row", gap: theme.space.md },
  flex1: { flex: 1 },
});
