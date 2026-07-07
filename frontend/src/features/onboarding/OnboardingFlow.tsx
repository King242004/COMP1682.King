// New-account onboarding: intro → goal → body (live TDEE) → health & taste.
// Every answer feeds the AI features (coach, suggestions, weekly plan) from
// minute one. Every step can be skipped — the user lands on Home regardless.
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

type Step = "intro" | "goal" | "body" | "health";
const STEPS: Step[] = ["intro", "goal", "body", "health"];

// Mifflin-St Jeor — display estimate only; the backend recomputes the
// authoritative goal from the same inputs when the profile is saved.
function calcTDEE(w: number, h: number, age: number, gender: "male" | "female", activity: string) {
  const bmr = 10 * w + 6.25 * h - 5 * age + (gender === "male" ? 5 : -161);
  const factor = activity === "sedentary" ? 1.2 : activity === "active" ? 1.725 : 1.55;
  return Math.round(bmr * factor);
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const t = useT();
  const L = t.onboarding;

  const GOALS = [
    { key: "lose_weight", icon: "trending-down", label: t.labels.goal.lose_weight },
    { key: "gain_muscle", icon: "barbell", label: t.labels.goal.gain_muscle },
    { key: "eat_healthy", icon: "leaf", label: t.labels.goal.eat_healthy },
  ];
  const ACTIVITIES = [
    { key: "sedentary", label: t.labels.activity.sedentary },
    { key: "moderate", label: t.labels.activity.moderate },
    { key: "active", label: t.labels.activity.active },
  ];
  const CONDITIONS = [
    { key: "diabetes", label: t.labels.condition.diabetes },
    { key: "hypertension", label: t.labels.condition.hypertension },
  ];

  const [step, setStep] = useState<Step>("intro");
  const [goal, setGoal] = useState("eat_healthy");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [conditions, setConditions] = useState<string[]>([]);
  const [taste, setTaste] = useState("");
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  // Live TDEE preview — the "wow" moment: numbers react as they type
  const w = Number(weight), h = Number(height), a = Number(age);
  const tdee = gender && w > 0 && h > 0 && a > 0 ? calcTDEE(w, h, a, gender, activity) : null;
  const goalCal = tdee === null ? null : goal === "lose_weight" ? tdee - 500 : goal === "gain_muscle" ? tdee + 300 : tdee;

  const toggleCondition = (c: string) =>
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const goHome = () => router.replace("/tabs");

  // Save whatever was answered; backend auto-computes calorieGoal from TDEE
  // when body metrics are present. Failures never trap the user here.
  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateProfile({
        goal,
        activityLevel: activity,
        ...(gender ? { gender } : {}),
        ...(a >= 10 && a <= 120 ? { age: a } : {}),
        ...(w >= 20 && w <= 300 ? { weight: w } : {}),
        ...(h >= 50 && h <= 250 ? { height: h } : {}),
        conditions,
        tastePreferences: taste.trim(),
      });
    } catch {
      Alert.alert("", L.saveErr);
    } finally {
      setSaving(false);
      goHome();
    }
  };

  // Shared selectable chip
  const Chip = ({ active, label, onPress, flex }: { active: boolean; label: string; onPress: () => void; flex?: boolean }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        flex && styles.flex1,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.chipText, active && styles.chipTextActive]}>{label}</AppText>
    </Pressable>
  );

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress segments + Skip */}
        <View style={styles.progressRow}>
          <View style={styles.segments}>
            {STEPS.map((s, i) => (
              <View key={s} style={[styles.segment, stepIndex >= i && styles.segmentActive]} />
            ))}
          </View>
          <Pressable onPress={goHome} hitSlop={10}>
            <AppText variant="subtle" style={styles.skipText}>{L.skip}</AppText>
          </Pressable>
        </View>

        {/* ── Intro ── */}
        {step === "intro" && (
          <View style={styles.introWrap}>
            <View style={styles.headerBlock}>
              <AppText variant="h1">{L.introTitle}</AppText>
              <AppText variant="muted">{L.introSub}</AppText>
            </View>
            <Card style={styles.featureCard}>
              {[
                { icon: "scan", text: L.featScan, color: theme.colors.primary, bg: "rgba(8,145,178,0.10)" },
                { icon: "sparkles", text: L.featCoach, color: theme.colors.accent, bg: "rgba(5,150,105,0.10)" },
                { icon: "calendar", text: L.featPlan, color: theme.colors.indigo, bg: "rgba(99,102,241,0.10)" },
              ].map((f) => (
                <View key={f.icon} style={styles.featureRow}>
                  {/* per-feature tint, known at runtime */}
                  <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                    <Ionicons name={f.icon as any} size={19} color={f.color} />
                  </View>
                  <AppText variant="body2" style={styles.flex1}>{f.text}</AppText>
                </View>
              ))}
            </Card>
            <Button title={L.start} size="lg" onPress={() => setStep("goal")} />
          </View>
        )}

        {/* ── Goal ── */}
        {step === "goal" && (
          <View style={styles.stepWrap}>
            <View style={styles.headerBlockTight}>
              <AppText variant="h1">{L.goalTitle}</AppText>
              <AppText variant="muted">{L.goalSub}</AppText>
            </View>
            <View style={styles.goalList}>
              {GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <Pressable
                    key={g.key}
                    onPress={() => setGoal(g.key)}
                    style={({ pressed }) => [styles.goalCard, active && styles.goalCardActive, pressed && styles.pressedFaint]}
                  >
                    <View style={[styles.goalIcon, active && styles.goalIconActive]}>
                      <Ionicons name={g.icon as any} size={20} color={active ? "#fff" : theme.colors.primary} />
                    </View>
                    <AppText variant="h2" style={[styles.goalLabel, active && styles.goalLabelActive]}>
                      {g.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <Button title={L.next} size="lg" onPress={() => setStep("body")} />
            <Pressable onPress={() => setStep("intro")} style={styles.backBtn}>
              <AppText style={styles.backText}>{L.back}</AppText>
            </Pressable>
          </View>
        )}

        {/* ── Body + live TDEE ── */}
        {step === "body" && (
          <View style={styles.stepWrap}>
            <View style={styles.headerBlockTight}>
              <AppText variant="h1">{L.bodyTitle}</AppText>
              <AppText variant="muted">{L.bodySub}</AppText>
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="muted">{L.gender}</AppText>
              <View style={styles.chipRow}>
                <Chip flex active={gender === "male"} label={L.male} onPress={() => setGender("male")} />
                <Chip flex active={gender === "female"} label={L.female} onPress={() => setGender("female")} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <TextField style={styles.flex1} label={L.age} placeholder="21" value={age} onChangeText={setAge} keyboardType="number-pad" />
              <TextField style={styles.flex1} label={L.weight} placeholder="65" value={weight} onChangeText={setWeight} keyboardType="number-pad" />
            </View>
            <TextField label={L.height} placeholder="170" value={height} onChangeText={setHeight} keyboardType="number-pad" />

            <View style={styles.fieldBlock}>
              <AppText variant="muted">{L.activity}</AppText>
              <View style={styles.chipRow}>
                {ACTIVITIES.map((ac) => (
                  <Chip key={ac.key} flex active={activity === ac.key} label={ac.label} onPress={() => setActivity(ac.key)} />
                ))}
              </View>
            </View>

            {/* The wow moment: TDEE + goal appear the second the inputs are complete */}
            {tdee !== null && (
              <Card style={styles.tdeeCard}>
                <AppText variant="subtle" style={styles.smallLabel}>{L.tdeeLabel}</AppText>
                <View style={styles.tdeeRow}>
                  <AppText variant="h0" style={styles.tdeeNum}>{tdee.toLocaleString()}</AppText>
                  <AppText variant="muted">kcal / {L.perDay}</AppText>
                </View>
                <AppText variant="subtle" style={styles.smallLabel}>
                  {L.tdeeGoal}: <AppText style={styles.tdeeGoal}>{goalCal?.toLocaleString()} kcal</AppText>
                </AppText>
              </Card>
            )}

            <Button title={L.next} size="lg" onPress={() => setStep("health")} />
            <Pressable onPress={() => setStep("goal")} style={styles.backBtn}>
              <AppText style={styles.backText}>{L.back}</AppText>
            </Pressable>
          </View>
        )}

        {/* ── Health & taste ── */}
        {step === "health" && (
          <View style={styles.stepWrap}>
            <View style={styles.headerBlockTight}>
              <AppText variant="h1">{L.healthTitle}</AppText>
              <AppText variant="muted">{L.healthSub}</AppText>
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="muted">{L.conditions}</AppText>
              <View style={styles.chipRowWrap}>
                {CONDITIONS.map((c) => (
                  <Chip key={c.key} active={conditions.includes(c.key)} label={c.label} onPress={() => toggleCondition(c.key)} />
                ))}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <TextField label={L.taste} placeholder={L.tastePh} value={taste} onChangeText={setTaste} textContentType="none" />
              <AppText variant="subtle" style={styles.tasteHint}>
                {L.tasteHint}
              </AppText>
            </View>

            <Button title={saving ? L.saving : L.finish} size="lg" disabled={saving} onPress={finish} />
            <Pressable onPress={() => setStep("body")} style={styles.backBtn}>
              <AppText style={styles.backText}>{L.back}</AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  pressed: { opacity: 0.7 },
  pressedFaint: { opacity: 0.8 },
  smallLabel: { fontSize: 12 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: 70,
    paddingBottom: 40,
    gap: theme.space.lg,
    flexGrow: 1,
  },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  segments: { flex: 1, flexDirection: "row", gap: 6 },
  segment: { height: 4, flex: 1, borderRadius: 99, backgroundColor: "rgba(8,145,178,0.12)" },
  segmentActive: { backgroundColor: theme.colors.primary },
  skipText: { fontSize: 13, color: theme.colors.primary },

  introWrap: { gap: theme.space.lg, flex: 1, justifyContent: "center" },
  stepWrap: { gap: theme.space.lg },
  headerBlock: { gap: 8 },
  headerBlockTight: { gap: 6 },
  featureCard: { padding: theme.space.lg, gap: theme.space.lg },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },

  goalList: { gap: 10 },
  goalCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: theme.space.lg, borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  goalCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  goalIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(8,145,178,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  goalIconActive: { backgroundColor: theme.colors.primary },
  goalLabel: { fontSize: 16, color: theme.colors.text },
  goalLabelActive: { color: theme.colors.primary },

  fieldBlock: { gap: 6 },
  fieldRow: { flexDirection: "row", gap: theme.space.md },
  chipRow: { flexDirection: "row", gap: 8 },
  chipRowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  chipText: { fontWeight: "700", color: theme.colors.subtle },
  chipTextActive: { color: theme.colors.primary },

  tdeeCard: {
    padding: theme.space.lg, gap: 6,
    backgroundColor: "rgba(5,150,105,0.06)",
    borderColor: "rgba(5,150,105,0.2)",
  },
  tdeeRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  tdeeNum: { fontSize: 32, color: theme.colors.accent },
  tdeeGoal: { fontSize: 12, fontWeight: "800", color: theme.colors.accent },

  tasteHint: { fontSize: 11 },
  backBtn: { alignItems: "center", paddingVertical: 6 },
  backText: { fontSize: 14, fontWeight: "600", color: theme.colors.subtle },
});
