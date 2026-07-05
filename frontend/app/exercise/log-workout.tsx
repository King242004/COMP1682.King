import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { addExercise, estimateBurned, ACTIVITY_GROUPS, type Activity } from "@/features/exercise/api";
import { todayKey } from "@/utils/date";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

export default function AddExerciseScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();

  // Log today or a past day; never the future (guard the param, fall back to today)
  const todayStr = todayKey();
  const logDate = date && date <= todayStr ? date : todayStr;
  const isBackdated = logDate !== todayStr;

  const [selected, setSelected] = useState<Activity | null>(null);
  const [duration, setDuration] = useState("");
  const [customName, setCustomName] = useState("");
  const [customMet, setCustomMet] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustom = selected?.custom === true;

  // Effective MET + name (custom entry pulls from the typed fields)
  const met = isCustom ? Number(customMet) : selected?.met ?? 0;
  const name = isCustom ? customName.trim() : selected?.name ?? "";
  const durationNum = Number(duration);

  const estimate = useMemo(() => {
    if (!selected || !durationNum || durationNum <= 0 || !met || met <= 0) return 0;
    return estimateBurned(met, durationNum, user?.weight ?? null);
  }, [selected, durationNum, met, user?.weight]);

  const canSave =
    !!selected &&
    durationNum >= 1 &&
    durationNum <= 600 &&
    met > 0 &&
    (!isCustom || (customName.trim().length >= 2 && Number(customMet) > 0 && Number(customMet) <= 25));

  const handleSave = async () => {
    if (!canSave || !token) return;
    setSaving(true);
    setError(null);
    try {
      await addExercise(token, { name, met, durationMin: durationNum, date: logDate });
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to log workout.");
      setSaving(false);
    }
  };

  const backdatedLabel = new Date(logDate + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title="Log workout" />
          <AppText variant="muted" style={styles.subtitle}>
            Calories burned are estimated from the MET formula.
          </AppText>
        </View>

        {/* Back-dated banner — make it clear WHICH day this workout goes to */}
        {isBackdated && (
          <View style={styles.backdateBanner}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.backdateText}>
              Logging for <AppText style={styles.backdateDate}>{backdatedLabel}</AppText>
            </AppText>
          </View>
        )}

        {/* Weight hint — the estimate needs it */}
        {!user?.weight && (
          <View style={styles.warnBanner}>
            <AppText style={styles.warnEmoji}>⚠️</AppText>
            <AppText variant="subtle" style={styles.warnText}>
              Set your weight in Profile for an accurate estimate. Using 60 kg for now.
            </AppText>
          </View>
        )}

        {/* Activity picker */}
        <View style={styles.groups}>
          {ACTIVITY_GROUPS.map((grp) => (
            <View key={grp.group} style={styles.group}>
              <AppText variant="subtle" style={styles.groupLabel}>{grp.group}</AppText>
              <View style={styles.chipWrap}>
                {grp.items.map((a) => {
                  const active = selected?.name === a.name;
                  return (
                    <Pressable
                      key={a.name}
                      onPress={() => { setSelected(a); setError(null); }}
                      style={({ pressed }) => [styles.chip, active ? styles.chipActive : styles.chipIdle, pressed && styles.pressed]}
                    >
                      <AppText style={styles.chipIcon}>{a.icon}</AppText>
                      <AppText style={[styles.chipText, active && styles.chipTextActive]}>{a.name}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Custom activity fields */}
        {isCustom && (
          <Card style={styles.card}>
            <TextField
              label="Activity name"
              placeholder="e.g. Rock climbing"
              value={customName}
              onChangeText={setCustomName}
              textContentType="none"
            />
            <TextField
              label="MET value"
              placeholder="e.g. 8"
              value={customMet}
              onChangeText={setCustomMet}
              keyboardType="decimal-pad"
              textContentType="none"
            />
            <AppText variant="subtle" style={styles.metHint}>
              MET = how many times harder than resting. Walking ≈ 3.5, running ≈ 8, intense ≈ 10+.
            </AppText>
          </Card>
        )}

        {/* Duration */}
        <Card style={styles.durationCard}>
          <TextField
            label="Duration (minutes)"
            placeholder="e.g. 30"
            value={duration}
            onChangeText={(t) => { setDuration(t); setError(null); }}
            keyboardType="number-pad"
            textContentType="none"
          />
        </Card>

        {/* Live estimate */}
        <Card style={styles.estimateCard}>
          <AppText variant="subtle" style={styles.estimateLabel}>Estimated calories burned</AppText>
          <View style={styles.estimateValueRow}>
            <AppText variant="h0" style={styles.estimateValue}>{estimate}</AppText>
            <AppText variant="muted" style={styles.estimateUnit}>kcal</AppText>
          </View>
        </Card>

        {error && <AppText style={styles.error}>{error}</AppText>}

        <Button title={saving ? "Saving..." : "Log workout"} size="lg" disabled={!canSave || saving} onPress={handleSave} />

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <AppText style={styles.cancelText}>Cancel</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  subtitle: { marginTop: -8 },

  backdateBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.colors.tint, borderRadius: 12, padding: theme.space.md,
  },
  backdateText: { fontSize: 13, color: theme.colors.muted },
  backdateDate: { fontWeight: "700", color: theme.colors.primary },

  warnBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,138,61,0.10)", borderColor: "rgba(255,138,61,0.25)",
    borderWidth: 1, borderRadius: 12, padding: theme.space.md,
  },
  warnEmoji: { fontSize: 16 },
  warnText: { fontSize: 12, flex: 1 },

  groups: { gap: theme.space.md },
  group: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  chipIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipIcon: { fontSize: 15 },
  chipText: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  chipTextActive: { color: theme.colors.primary },
  pressed: { opacity: 0.7 },

  card: { padding: theme.space.lg, gap: theme.space.md },
  metHint: { fontSize: 11 },
  durationCard: { padding: theme.space.lg },

  estimateCard: {
    padding: theme.space.lg, alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,138,61,0.06)", borderColor: "rgba(255,138,61,0.2)",
  },
  estimateLabel: { fontSize: 12 },
  estimateValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  estimateValue: { fontSize: 32, color: theme.colors.accent2 },
  estimateUnit: { fontSize: 14 },

  error: { fontSize: 13, color: theme.colors.danger, textAlign: "center" },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 15, fontWeight: "600", color: theme.colors.primary },
});
