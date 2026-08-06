// Màn Thiết lập lần đầu. Đây là file BẮT ĐẦU của luồng thiết lập hồ sơ.
// Bốn bước nằm trong CÙNG một màn, đổi bằng biến step chứ không chuyển màn.
// LUỒNG THIẾT LẬP LẦN ĐẦU
// 1. Đăng ký xong, RegisterScreen đá tới đây
// 2. Người dùng đi qua bốn bước: giới thiệu, mục tiêu, cơ thể, sức khỏe
// 3. Bấm Hoàn tất ở bước cuối, chạy finish
// 4. AuthContext.updateProfile
// 5. accountApi.updateProfileRequest   (PUT /profile)
// 6. backend profileController.updateProfile tính lại mục tiêu calo rồi lưu
// 7. router.replace sang /tabs
// Thiết lập tài khoản mới đi từ giới thiệu, mục tiêu, cơ thể đến sức khỏe và khẩu vị.
// Câu trả lời cung cấp dữ liệu cho Coach, gợi ý và kế hoạch tuần ngay từ đầu.
// Mọi bước đều có thể bỏ qua và người dùng vẫn vào được Home.
// Phần bệnh nền ở bước cuối là dữ liệu quan trọng nhất, vì nó nuôi
// cả hai lớp lọc an toàn ở backend khi tạo kế hoạch và gợi ý món.
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";
import { estimateTDEE, estimateCalorieGoal, type WeightGoal } from "@/config/nutritionCalculations";
import { INPUT_LIMITS, DIGIT_LIMITS } from "@/config/inputLimits";

type Step = "intro" | "goal" | "body" | "health";
const STEPS: Step[] = ["intro", "goal", "body", "health"];

// Công thức và hệ số nay nằm ở src/config/nutrition.ts, không gõ lại tại đây.
// Hai con số này chỉ để xem trước trong lúc thiết lập, backend sẽ tính lại
// mục tiêu chính thức từ cùng dữ liệu khi hồ sơ được lưu.

export function OnboardingFlow() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const t = useT();
  const L = t.onboarding;

  const GOALS: { key: WeightGoal; icon: string; label: string }[] = [
    { key: "lose_weight", icon: "trending-down", label: t.labels.goal.lose_weight },
    { key: "gain_weight", icon: "barbell", label: t.labels.goal.gain_weight },
    { key: "maintain_weight", icon: "leaf", label: t.labels.goal.maintain_weight },
  ];
  const ACTIVITIES = [
    { key: "sedentary", label: t.labels.activity.sedentary },
    { key: "moderate", label: t.labels.activity.moderate },
    { key: "active", label: t.labels.activity.active },
  ];
  const CONDITIONS = [
    { key: "diabetes", label: t.labels.condition.diabetes },
    { key: "hypertension", label: t.labels.condition.hypertension },
    { key: "gout", label: t.labels.condition.gout },
    { key: "high_cholesterol", label: t.labels.condition.high_cholesterol },
    { key: "gastritis", label: t.labels.condition.gastritis },
  ];

  const [step, setStep] = useState<Step>("intro");
  const [goal, setGoal] = useState<WeightGoal>("maintain_weight");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [conditions, setConditions] = useState<string[]>([]);
  const [taste, setTaste] = useState("");
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  // TDEE ước tính thay đổi ngay khi người dùng nhập dữ liệu.
  const w = Number(weight), h = Number(height), a = Number(age);
  const tdee = gender && w > 0 && h > 0 && a > 0 ? estimateTDEE(w, h, a, gender, activity) : null;
  const goalCal = gender ? estimateCalorieGoal(tdee, gender, goal) : null;

  const toggleCondition = (c: string) =>
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const goHome = () => router.replace("/tabs");

  // Lưu các câu đã trả lời. Backend tự tính calorieGoal từ TDEE khi đủ số đo.
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

  // Lựa chọn dạng thẻ dùng chung cho nhiều bước.
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
        {/* Thanh tiến độ và nút bỏ qua. */}
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

        {/* Bước giới thiệu. */}
        {step === "intro" && (
          <View style={styles.introWrap}>
            <Image
              source={require("../../../assets/images/mealmate-logo-transparent.png")}
              style={styles.introLogo}
              resizeMode="contain"
              accessibilityLabel="MealMate"
            />
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
                {/* Mỗi tính năng có màu riêng được xác định khi chạy. */}
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

        {/* Bước chọn mục tiêu. */}
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

        {/* Bước nhập cơ thể và xem TDEE trực tiếp. */}
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
              <TextField style={styles.flex1} label={L.age} placeholder="21" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={DIGIT_LIMITS.AGE} />
              <TextField style={styles.flex1} label={L.weight} placeholder="65" value={weight} onChangeText={setWeight} keyboardType="number-pad" maxLength={DIGIT_LIMITS.WEIGHT} />
            </View>
            <TextField label={L.height} placeholder="170" value={height} onChangeText={setHeight} keyboardType="number-pad" maxLength={DIGIT_LIMITS.HEIGHT} />

            <View style={styles.fieldBlock}>
              <AppText variant="muted">{L.activity}</AppText>
              <View style={styles.chipRow}>
                {ACTIVITIES.map((ac) => (
                  <Chip key={ac.key} flex active={activity === ac.key} label={ac.label} onPress={() => setActivity(ac.key)} />
                ))}
              </View>
            </View>

          {/* Hiện TDEE và mục tiêu ngay khi người dùng nhập đủ dữ liệu. */}
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

        {/* Bước nhập sức khỏe và khẩu vị. */}
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
              <TextField label={L.taste} placeholder={L.tastePh} value={taste} onChangeText={setTaste} textContentType="none" maxLength={INPUT_LIMITS.TASTE_PREFERENCES} showCounter />
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
  introLogo: { width: 88, height: 88, alignSelf: "center" },
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
