// ═══ FILE NÀY LÀM GÌ ═══
// Màn Bài tập có hướng dẫn. File BẮT ĐẦU của luồng tập theo bước.
//
// Ai gọi tới: LogActivityScreen và Kế hoạch tuần
// Nhận vào:   mã bài tập và thời lượng đã chọn
// Trả ra:     không trả gì, tập xong thì tự ghi một buổi tập vào nhật ký
// Khi lỗi:    thoát giữa chừng thì KHÔNG ghi gì, chỉ tập hết mới tính

// LUỒNG TẬP THEO HƯỚNG DẪN
// 1. Chọn một bài từ màn Ghi buổi tập, mở màn này
// 2. Bấm Bắt đầu, đồng hồ chạy theo từng bước
// 3. Hết giờ một bước thì tự nhảy sang bước kế tiếp
// 4. Xong bước cuối, chạy finish
// 5. addExercise                  (POST /exercise)
// 6. backend tạo một buổi tập thật, tính calo theo cân nặng
// 7. hiện thông báo rồi quay về màn trước
// Nội dung các bài nằm ở features/exercise/guidedRoutines.ts.
// finishedRef chặn ghi trùng, vì đồng hồ có thể chạm mốc cuối nhiều lần.
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useHealthDataRefresh } from "@/context/HealthDataRefreshContext";
import { addExercise } from "@/features/exercise/exerciseApi";
import { GUIDED_ROUTINES } from "@/features/exercise/guidedRoutines";
import { markPlanWorkoutDone } from "@/features/plan/planApi";
import { todayKey } from "@/utils/dateUtils";
import { resolveLanguage } from "@/utils/languageUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function GuidedRoutineScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();
  const t = useT();
  const lang = resolveLanguage(user?.language);
  const { routine: routineKey, planWorkoutId, previewOnly, planDate } = useLocalSearchParams<{
    routine: string;
    planWorkoutId?: string;
    previewOnly?: string;
    planDate?: string;
  }>();
  const routine = GUIDED_ROUTINES.find((r) => r.key === routineKey);
  const isPreviewOnly = previewOnly === "1";

  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(routine?.steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const finishedRef = useRef(false);

  const startSession = () => {
    setStarted(true);
    setRunning(true);
  };

  // Đồng hồ đếm ngược cho bước đang tập. Chạy lại mỗi giây.
  // Dọn đồng hồ khi thoát màn để không chạy nền.
  useEffect(() => {
    if (!started || !running || !routine) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [started, running, routine]);

  // Hết giờ một bước thì tự nhảy sang bước kế tiếp.
  // Hết bước cuối thì gọi finish để ghi buổi tập.
  useEffect(() => {
    if (!started || !routine || secondsLeft > 0) return;
    if (stepIndex < routine.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setSecondsLeft(routine.steps[stepIndex + 1].seconds);
    } else if (!finishedRef.current) {
      finishedRef.current = true;
      finish();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Chạy khi tập hết bước cuối.
  const finish = async () => {
    if (!routine) return;
    setRunning(false);
    setFinishing(true);
    try {
      if (token) {
        const completed = {
          name: routine.title[lang],
          routineKey: routine.key,
        };
        if (planWorkoutId) {
          await markPlanWorkoutDone(token, planWorkoutId, completed);
        } else {
          await addExercise(token, { ...completed, durationMin: routine.durationMin, date: todayKey() });
        }
        markHealthDataChanged();
      }
      Alert.alert(t.exercise.finishedTitle, t.exercise.finishedMsg(routine.durationMin), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        t.common.errorTitle,
        error instanceof Error && error.message === "PROFILE_WEIGHT_REQUIRED"
          ? t.exercise.weightRequired
          : t.exercise.failed,
        [{ text: "OK", onPress: () => router.back() }],
      );
    }
  };

  const skipStep = () => {
    if (!routine) return;
      // Effect sẽ chuyển sang bước tiếp theo hoặc kết thúc ở bước cuối.
      setSecondsLeft(0);
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

  if (!started) {
    return (
      <Screen padded={false}>
        <ScrollView contentContainerStyle={styles.previewContent} showsVerticalScrollIndicator={false}>
          <View>
            <ScreenHeader title={routine.title[lang]} />
            <AppText variant="muted" style={styles.previewDescription}>{routine.description[lang]}</AppText>
          </View>

          {/* Chỉ hiện thông tin chắc chắn của routine, không quảng bá calo như số đo chính xác. */}
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Ionicons name="time-outline" size={21} color={theme.colors.primary} />
              <AppText variant="h2" style={styles.previewStatVal}>{t.exercise.durationMinutes(routine.durationMin)}</AppText>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Ionicons name="list-outline" size={21} color={theme.colors.primary} />
              <AppText variant="h2" style={styles.previewStatVal}>{t.exercise.routineExerciseCount(routine.exerciseCount)}</AppText>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Ionicons name="speedometer-outline" size={21} color={theme.colors.primary} />
              <AppText variant="h2" style={styles.previewStatVal}>{t.exercise.levels[routine.level]}</AppText>
            </View>
          </View>

          <View style={styles.equipmentBadge}>
            <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
            <AppText style={styles.equipmentText}>{t.exercise.noEquipment}</AppText>
          </View>

          <Card style={styles.stepsCard}>
            {routine.steps.map((s, i) => (
              <View key={i} style={[styles.stepRow, i > 0 && styles.stepRowDivider]}>
                <View style={styles.stepNum}>
                  <AppText style={styles.stepNumText}>{i + 1}</AppText>
                </View>
                <AppText variant="body2" style={styles.stepRowName}>{s[lang]}</AppText>
                <AppText variant="subtle" style={styles.stepRowTime}>
                  {s.seconds >= 60 ? `${Math.round(s.seconds / 60)}′` : `${s.seconds}s`}
                </AppText>
              </View>
            ))}
          </Card>

          <AppText variant="subtle" style={styles.safety}>{t.exercise.safety}</AppText>

          {isPreviewOnly ? (
            <View style={styles.previewOnlyNote}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              <AppText variant="subtle" style={styles.previewOnlyText}>
                {planDate && planDate < todayKey() ? t.plan.pastWorkout : t.plan.scheduledWorkout}
              </AppText>
            </View>
          ) : (
            <Pressable onPress={startSession} style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}>
              <Ionicons name="play" size={22} color="#fff" />
              <AppText style={styles.startBtnText}>{t.exercise.guidedStart}</AppText>
            </Pressable>
          )}
        </ScrollView>
      </Screen>
    );
  }

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
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

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

  // Preview (before Start)
  previewContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  previewDescription: { marginTop: -8, lineHeight: 21 },
  previewStats: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: theme.colors.surface, borderRadius: 14, paddingVertical: theme.space.lg,
  },
  previewStat: { flex: 1, alignItems: "center", gap: 6 },
  previewStatVal: { fontSize: 13, textAlign: "center" },
  previewDivider: { width: 0.5, alignSelf: "stretch", backgroundColor: theme.colors.border },
  equipmentBadge: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.colors.tint,
  },
  equipmentText: { color: theme.colors.primary2, fontSize: 12, fontWeight: "700" },
  previewOnlyNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.colors.tint, borderRadius: 12, padding: theme.space.md,
  },
  previewOnlyText: { flex: 1, fontSize: 12 },
  stepsCard: { padding: theme.space.lg },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  stepRowDivider: { borderTopWidth: 0.5, borderTopColor: theme.colors.border },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  stepRowName: { flex: 1 },
  stepRowTime: { fontSize: 12, fontWeight: "700" },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 16,
  },
  startBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

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
