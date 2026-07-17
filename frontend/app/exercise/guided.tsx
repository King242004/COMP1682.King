// GUIDED WORKOUT SESSION — step-by-step timer for a static routine
// (features/exercise/guided.ts). Finishing auto-logs a real Exercise for
// today, so the burn flows into net calories / Health Score / Coach.
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { addExercise } from "@/features/exercise/api";
import { GUIDED_ROUTINES } from "@/features/exercise/guided";
import { todayKey } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function GuidedWorkoutScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();
  const lang = resolveLanguage(user?.language);
  const { routine: routineKey } = useLocalSearchParams<{ routine: string }>();
  const routine = GUIDED_ROUTINES.find((r) => r.key === routineKey);

  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(routine?.steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const finishedRef = useRef(false);

  // 1-second tick while running; advancing/finishing handled in the effect below
  useEffect(() => {
    if (!running || !routine) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, routine]);

  // Step finished → next step, or the whole routine is done
  useEffect(() => {
    if (!routine || secondsLeft > 0) return;
    if (stepIndex < routine.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setSecondsLeft(routine.steps[stepIndex + 1].seconds);
    } else if (!finishedRef.current) {
      finishedRef.current = true;
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const finish = async () => {
    if (!routine) return;
    setRunning(false);
    setFinishing(true);
    const weight = user?.weight && user.weight > 0 ? user.weight : 60;
    const kcal = Math.round(routine.met * weight * (routine.durationMin / 60));
    try {
      if (token) {
        await addExercise(token, {
          name: routine.title[lang],
          met: routine.met,
          durationMin: routine.durationMin,
          date: todayKey(),
        });
      }
      Alert.alert(t.exercise.finishedTitle, t.exercise.finishedMsg(kcal), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t.common.errorTitle, t.exercise.failed, [{ text: "OK", onPress: () => router.back() }]);
    }
  };

  const skipStep = () => {
    if (!routine) return;
    setSecondsLeft(0); // the effect advances (or finishes on the last step)
  };

  const quit = () => {
    setRunning(false);
    Alert.alert(t.exercise.quitTitle, t.exercise.quitMsg, [
      { text: t.common.cancel, style: "cancel", onPress: () => setRunning(true) },
      { text: t.exercise.quit, style: "destructive", onPress: () => router.back() },
    ]);
  };

  if (!routine) {
    return (
      <Screen>
        <AppText variant="muted">{t.common.error}</AppText>
      </Screen>
    );
  }

  const step = routine.steps[stepIndex];
  const mm = String(Math.floor(Math.max(0, secondsLeft) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, secondsLeft) % 60).padStart(2, "0");
  const progress = (stepIndex + 1) / routine.steps.length;

  return (
    <Screen padded={false}>
      <View style={styles.content}>
        <ScreenHeader title={routine.title[lang]} />

        {/* Progress: step counter + slim bar */}
        <View style={styles.progressBlock}>
          <AppText variant="subtle" style={styles.stepCount}>
            {t.exercise.guidedStep(stepIndex + 1, routine.steps.length)}
          </AppText>
          <View style={styles.progressTrack}>
            {/* width known only at runtime */}
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Current step + big countdown */}
        <Card style={styles.stepCard}>
          <AppText style={styles.routineIcon}>{routine.icon}</AppText>
          <AppText variant="h1" style={styles.stepName}>{step[lang]}</AppText>
          <AppText variant="h0" style={styles.timer}>{mm}:{ss}</AppText>
        </Card>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={() => setRunning((r) => !r)}
            disabled={finishing}
            style={({ pressed }) => [styles.mainBtn, pressed && styles.pressed]}
          >
            <Ionicons name={running ? "pause" : "play"} size={22} color="#fff" />
            <AppText style={styles.mainBtnText}>{running ? t.exercise.pause : t.exercise.resume}</AppText>
          </Pressable>
          <Pressable
            onPress={skipStep}
            disabled={finishing}
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
          >
            <Ionicons name="play-skip-forward" size={18} color={theme.colors.primary} />
            <AppText style={styles.sideBtnText}>{t.exercise.skip}</AppText>
          </Pressable>
        </View>

        {/* Safety note (health-conditions app: always visible) */}
        <AppText variant="subtle" style={styles.safety}>{t.exercise.safety}</AppText>

        <Pressable onPress={quit} style={({ pressed }) => [styles.quitBtn, pressed && styles.pressed]}>
          <AppText style={styles.quitText}>{t.exercise.quit}</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  content: { flex: 1, paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },

  progressBlock: { gap: 8 },
  stepCount: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  progressTrack: { height: 6, borderRadius: 99, backgroundColor: theme.colors.tint, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: theme.colors.primary },

  stepCard: { padding: theme.space.xl, alignItems: "center", gap: theme.space.md },
  routineIcon: { fontSize: 34 },
  stepName: { textAlign: "center" },
  timer: { fontSize: 56, color: theme.colors.primary },

  controls: { flexDirection: "row", gap: theme.space.md },
  mainBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 14,
  },
  mainBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sideBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 14, paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  sideBtnText: { color: theme.colors.primary, fontWeight: "700", fontSize: 13 },

  safety: { fontSize: 12, textAlign: "center" },
  quitBtn: { alignItems: "center", paddingVertical: 10 },
  quitText: { fontSize: 14, fontWeight: "600", color: theme.colors.danger },
});
