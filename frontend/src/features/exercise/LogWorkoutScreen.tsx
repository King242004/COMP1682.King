import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { addExercise, estimateBurned, getExerciseHistory, ACTIVITY_GROUPS, SIMPLE_ACTIVITIES, DURATION_PRESETS, type Activity } from "@/features/exercise/api";
import { GUIDED_ROUTINES } from "@/features/exercise/guided";
import { resolveLanguage } from "@/utils/language";
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
  const t = useT();
  const { date } = useLocalSearchParams<{ date?: string }>();

  // Log today or a past day; never the future (guard the param, fall back to today)
  const todayStr = todayKey();
  const logDate = date && date <= todayStr ? date : todayStr;
  const isBackdated = logDate !== todayStr;

  const [selected, setSelected] = useState<Activity | null>(null);
  const [duration, setDuration] = useState("");
  const [customName, setCustomName] = useState("");
  // Custom "Other" activity: pick an intensity (plain words), we map it to a
  // MET behind the scenes — asking users for a raw MET number was confusing.
  const [customIntensity, setCustomIntensity] = useState<"light" | "moderate" | "intense">("moderate");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustom = selected?.custom === true;
  const lang = resolveLanguage(user?.language);
  const INTENSITY_MET = { light: 3, moderate: 5, intense: 8 } as const;
  const customMet = String(INTENSITY_MET[customIntensity]);

  // "Recent" one-tap chips: the user's own last workouts (people repeat the
  // same 2-3 activities) — tap = everything prefilled, just hit Save.
  type RecentWorkout = { name: string; met: number; durationMin: number };
  const [recent, setRecent] = useState<RecentWorkout[]>([]);
  useEffect(() => {
    if (!token) return;
    getExerciseHistory(token)
      .then((list) => {
        const seen = new Set<string>();
        const out: RecentWorkout[] = [];
        for (const e of list) {
          const k = e.name.trim().toLowerCase();
          if (seen.has(k)) continue;
          seen.add(k);
          out.push({ name: e.name, met: e.met, durationMin: e.durationMin });
          if (out.length >= 5) break;
        }
        setRecent(out);
      })
      .catch(() => {});
  }, [token]);

  const applyRecent = (r: RecentWorkout) => {
    // Match by CURRENT localized label: simple list first, then the detailed
    // legacy catalog (old logs like "Tạ nặng"); else reuse via the custom entry.
    const legacy = ACTIVITY_GROUPS.flatMap((g) => g.items);
    const match = [...SIMPLE_ACTIVITIES, ...legacy].find(
      (a) => !a.custom && (t.exercise.activities[a.key] ?? a.key) === r.name
    );
    if (match) {
      setSelected(match);
    } else {
      const custom = SIMPLE_ACTIVITIES.find((a) => a.custom)!;
      setSelected(custom);
      setCustomName(r.name);
      // Map the stored MET back to the nearest intensity bucket
      setCustomIntensity(r.met <= 4 ? "light" : r.met <= 6.5 ? "moderate" : "intense");
    }
    setDuration(String(r.durationMin));
    setError(null);
  };

  // Effective MET + name (custom entry pulls from the typed fields).
  // The LOCALIZED label is what gets saved as the workout name.
  const met = isCustom ? Number(customMet) : selected?.met ?? 0;
  const name = isCustom
    ? customName.trim()
    : selected
    ? t.exercise.activities[selected.key] ?? selected.key
    : "";
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
      setError(err.message || t.exercise.failed);
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
          <ScreenHeader title={t.exercise.title} />
          <AppText variant="muted" style={styles.subtitle}>{t.exercise.subtitle}</AppText>
        </View>

        {/* Back-dated banner — make it clear WHICH day this workout goes to */}
        {isBackdated && (
          <View style={styles.backdateBanner}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.backdateText}>
              {t.exercise.loggingFor} <AppText style={styles.backdateDate}>{backdatedLabel}</AppText>
            </AppText>
          </View>
        )}

        {/* Weight hint — the estimate needs it */}
        {!user?.weight && (
          <View style={styles.warnBanner}>
            <AppText style={styles.warnEmoji}>⚠️</AppText>
            <AppText variant="subtle" style={styles.warnText}>{t.exercise.weightWarn}</AppText>
          </View>
        )}

        {/* Guided routines — follow along step by step; finishing auto-logs */}
        <View style={styles.group}>
          <AppText variant="subtle" style={styles.groupLabel}>{t.exercise.guidedSection}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guidedRow}>
            {GUIDED_ROUTINES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => router.push({ pathname: "/exercise/guided" as any, params: { routine: r.key } })}
                style={({ pressed }) => [styles.guidedCard, pressed && styles.pressed]}
              >
                <AppText style={styles.guidedIcon}>{r.icon}</AppText>
                <AppText style={styles.guidedTitle} numberOfLines={2}>{r.title[lang]}</AppText>
                <AppText variant="subtle" style={styles.guidedMeta}>
                  {r.durationMin} {t.home.min} · ~{estimateBurned(r.met, r.durationMin, user?.weight ?? null)} {t.common.kcal}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recent workouts — one tap prefills everything */}
        {recent.length > 0 && (
          <View style={styles.group}>
            <AppText variant="subtle" style={styles.groupLabel}>{t.exercise.recent}</AppText>
            <View style={styles.chipWrap}>
              {recent.map((r) => (
                <Pressable
                  key={r.name}
                  onPress={() => applyRecent(r)}
                  style={({ pressed }) => [styles.chip, styles.chipIdle, pressed && styles.pressed]}
                >
                  <AppText style={styles.chipIcon}>🔁</AppText>
                  <AppText style={styles.chipText}>{r.name} · {r.durationMin}′</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Manual picker — ONE flat row of coarse activities (what real memory
            can answer), no groups. "Khác" keeps the precise custom path. */}
        <View style={styles.group}>
          <AppText variant="subtle" style={styles.groupLabel}>{t.exercise.pickManual}</AppText>
          <View style={styles.chipWrap}>
            {SIMPLE_ACTIVITIES.map((a) => {
              const active = selected?.key === a.key;
              return (
                <Pressable
                  key={a.key}
                  onPress={() => { setSelected(a); setError(null); }}
                  style={({ pressed }) => [styles.chip, active ? styles.chipActive : styles.chipIdle, pressed && styles.pressed]}
                >
                  <AppText style={styles.chipIcon}>{a.icon}</AppText>
                  <AppText style={[styles.chipText, active && styles.chipTextActive]}>{t.exercise.activities[a.key] ?? a.key}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Custom activity fields — name + intensity (plain words, no MET math) */}
        {isCustom && (
          <Card style={styles.card}>
            <TextField
              label={t.exercise.activityName}
              placeholder={t.exercise.activityNamePlaceholder}
              value={customName}
              onChangeText={setCustomName}
              textContentType="none"
            />
            <View>
              <AppText variant="subtle" style={styles.groupLabel}>{t.exercise.intensity}</AppText>
              <View style={styles.durRow}>
                {(["light", "moderate", "intense"] as const).map((lvl) => {
                  const active = customIntensity === lvl;
                  return (
                    <Pressable
                      key={lvl}
                      onPress={() => { setCustomIntensity(lvl); setError(null); }}
                      style={({ pressed }) => [styles.durChip, active ? styles.durChipActive : styles.durChipIdle, pressed && styles.pressed]}
                    >
                      <AppText style={[styles.durChipText, active && styles.durChipTextActive]}>
                        {t.exercise.intensityLevel[lvl]}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>
        )}

        {/* Duration — pick the NEAREST preset ("cỡ 30 phút"); the exact input
            below stays as the optional precise path */}
        <Card style={styles.durationCard}>
          <AppText variant="subtle" style={styles.groupLabel}>{t.exercise.duration}</AppText>
          <View style={styles.durRow}>
            {DURATION_PRESETS.map((m) => {
              const active = duration === String(m);
              return (
                <Pressable
                  key={m}
                  onPress={() => { setDuration(String(m)); setError(null); }}
                  style={({ pressed }) => [styles.durChip, active ? styles.durChipActive : styles.durChipIdle, pressed && styles.pressed]}
                >
                  <AppText style={[styles.durChipText, active && styles.durChipTextActive]}>
                    {m < 60 ? `${m}′` : m === 60 ? "1h" : "1h30"}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {/* Breathing room so the optional field reads as a separate choice
              rather than a caption attached to the chips above */}
          <View style={styles.exactField}>
            <TextField
              label={t.exercise.exactMinutes}
              placeholder={t.exercise.durationPlaceholder}
              value={duration}
              onChangeText={(v) => { setDuration(v); setError(null); }}
              keyboardType="number-pad"
              textContentType="none"
            />
          </View>
        </Card>

        {/* Live estimate */}
        <Card style={styles.estimateCard}>
          <AppText variant="subtle" style={styles.estimateLabel}>{t.exercise.estimatedBurned}</AppText>
          <View style={styles.estimateValueRow}>
            <AppText variant="h0" style={styles.estimateValue}>{estimate}</AppText>
            <AppText variant="muted" style={styles.estimateUnit}>{t.common.kcal}</AppText>
          </View>
        </Card>

        {error && <AppText style={styles.error}>{error}</AppText>}

        <Button title={saving ? t.common.saving : t.exercise.title} size="lg" disabled={!canSave || saving} onPress={handleSave} />

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <AppText style={styles.cancelText}>{t.common.cancel}</AppText>
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

  group: { gap: 8 },
  // 8px matches the label-to-input gap inside TextField, so a section label
  // sits the same distance above its chips as a field label above its box
  groupLabel: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  chipIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipIcon: { fontSize: 15 },
  chipText: { fontSize: 13, fontWeight: "600", color: theme.colors.text },
  chipTextActive: { color: theme.colors.primary },
  pressed: { opacity: 0.7 },

  card: { padding: theme.space.lg, gap: theme.space.md },

  durRow: { flexDirection: "row", gap: 8 },
  durChip: {
    flex: 1, alignItems: "center", paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5,
  },
  durChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  durChipIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  durChipText: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  durChipTextActive: { color: theme.colors.primary },

  guidedRow: { gap: theme.space.sm },
  guidedCard: {
    width: 150, padding: theme.space.md, gap: 4,
    borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  guidedIcon: { fontSize: 22 },
  guidedTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.text },
  guidedMeta: { fontSize: 11 },
  durationCard: { padding: theme.space.lg },
  exactField: { marginTop: theme.space.lg },

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
