// New-account onboarding: intro → goal → body (live TDEE) → health & taste.
// Every answer feeds the AI features (coach, suggestions, weekly plan) from
// minute one. Every step can be skipped — the user lands on Home regardless.
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { resolveLanguage } from "@/utils/language";
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
  const vi = resolveLanguage(user?.language) === "vi";

  const L = vi
    ? {
        introTitle: "Chào mừng đến MealMate 👋",
        introSub: "Người bạn đồng hành bữa ăn của bạn. Trả lời vài câu hỏi để AI hiểu bạn ngay từ đầu nhé (~1 phút).",
        featScan: "Chụp ảnh món ăn — AI tự nhận diện và tính calo",
        featCoach: "AI Coach tư vấn theo mục tiêu, bệnh lý và khẩu vị của bạn",
        featPlan: "Tự lên thực đơn tuần với món Việt quen thuộc",
        start: "Bắt đầu", skip: "Bỏ qua", next: "Tiếp tục", back: "Quay lại",
        finish: "Hoàn tất", saving: "Đang lưu...",
        goalTitle: "Mục tiêu của bạn là gì?",
        goalSub: "AI sẽ điều chỉnh calo và món ăn theo mục tiêu này.",
        bodyTitle: "Về cơ thể bạn",
        bodySub: "Để tính nhu cầu calo mỗi ngày (TDEE) cho riêng bạn.",
        gender: "Giới tính", male: "Nam", female: "Nữ",
        age: "Tuổi", weight: "Cân nặng (kg)", height: "Chiều cao (cm)",
        activity: "Mức vận động",
        tdeeLabel: "Nhu cầu calo của bạn", tdeeGoal: "Mục tiêu mỗi ngày",
        healthTitle: "Sức khoẻ & khẩu vị",
        healthSub: "AI sẽ né các món không hợp với bạn.",
        conditions: "Bệnh nền (nếu có)",
        taste: "Khẩu vị",
        tastePh: "vd: không ăn hải sản, thích gà, ít cay...",
        saveErr: "Chưa lưu được hồ sơ, bạn có thể cập nhật lại trong Profile nhé.",
      }
    : {
        introTitle: "Welcome to MealMate 👋",
        introSub: "Your meal companion. Answer a few questions so the AI understands you from day one (~1 minute).",
        featScan: "Snap a photo — AI recognizes the dish and counts calories",
        featCoach: "AI Coach advises around your goal, conditions and taste",
        featPlan: "Generates a weekly menu with familiar Vietnamese dishes",
        start: "Get started", skip: "Skip", next: "Continue", back: "Back",
        finish: "Finish", saving: "Saving...",
        goalTitle: "What's your goal?",
        goalSub: "The AI adapts calories and dishes to this goal.",
        bodyTitle: "About your body",
        bodySub: "Used to calculate your personal daily calorie needs (TDEE).",
        gender: "Gender", male: "Male", female: "Female",
        age: "Age", weight: "Weight (kg)", height: "Height (cm)",
        activity: "Activity level",
        tdeeLabel: "Your daily calorie needs", tdeeGoal: "Daily goal",
        healthTitle: "Health & taste",
        healthSub: "The AI will steer clear of foods that don't suit you.",
        conditions: "Health conditions (if any)",
        taste: "Taste preferences",
        tastePh: "e.g. no seafood, love chicken, less spicy...",
        saveErr: "Couldn't save your profile — you can update it later in Profile.",
      };

  const GOALS = [
    { key: "lose_weight", icon: "trending-down", label: vi ? "Giảm cân" : "Lose weight" },
    { key: "gain_muscle", icon: "barbell", label: vi ? "Tăng cơ" : "Gain muscle" },
    { key: "eat_healthy", icon: "leaf", label: vi ? "Ăn lành mạnh" : "Eat healthy" },
  ];
  const ACTIVITIES = [
    { key: "sedentary", label: vi ? "Ít vận động" : "Sedentary" },
    { key: "moderate", label: vi ? "Vừa phải" : "Moderate" },
    { key: "active", label: vi ? "Năng động" : "Active" },
  ];
  const CONDITIONS = [
    { key: "diabetes", label: vi ? "Tiểu đường" : "Diabetes" },
    { key: "hypertension", label: vi ? "Huyết áp cao" : "Hypertension" },
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
      style={({ pressed }) => ({
        ...(flex ? { flex: 1 } : {}),
        alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
        borderWidth: 1.5,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.tint : theme.colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <AppText style={{ fontWeight: "700", color: active ? theme.colors.primary : theme.colors.subtle }}>{label}</AppText>
    </Pressable>
  );

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 70, paddingBottom: 40, gap: theme.space.lg, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress segments + Skip */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
            {STEPS.map((s, i) => (
              <View key={s} style={{
                height: 4, flex: 1, borderRadius: 99,
                backgroundColor: stepIndex >= i ? theme.colors.primary : "rgba(8,145,178,0.12)",
              }} />
            ))}
          </View>
          <Pressable onPress={goHome} hitSlop={10}>
            <AppText variant="subtle" style={{ fontSize: 13, color: theme.colors.primary }}>{L.skip}</AppText>
          </Pressable>
        </View>

        {/* ── Intro ── */}
        {step === "intro" && (
          <View style={{ gap: theme.space.lg, flex: 1, justifyContent: "center" }}>
            <View style={{ gap: 8 }}>
              <AppText variant="h1">{L.introTitle}</AppText>
              <AppText variant="muted">{L.introSub}</AppText>
            </View>
            <Card style={{ padding: theme.space.lg, gap: theme.space.lg }}>
              {[
                { icon: "scan", text: L.featScan, color: theme.colors.primary, bg: "rgba(8,145,178,0.10)" },
                { icon: "sparkles", text: L.featCoach, color: theme.colors.accent, bg: "rgba(5,150,105,0.10)" },
                { icon: "calendar", text: L.featPlan, color: theme.colors.indigo, bg: "rgba(99,102,241,0.10)" },
              ].map((f) => (
                <View key={f.icon} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: f.bg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={f.icon as any} size={19} color={f.color} />
                  </View>
                  <AppText variant="body2" style={{ flex: 1 }}>{f.text}</AppText>
                </View>
              ))}
            </Card>
            <Button title={L.start} size="lg" onPress={() => setStep("goal")} />
          </View>
        )}

        {/* ── Goal ── */}
        {step === "goal" && (
          <View style={{ gap: theme.space.lg }}>
            <View style={{ gap: 6 }}>
              <AppText variant="h1">{L.goalTitle}</AppText>
              <AppText variant="muted">{L.goalSub}</AppText>
            </View>
            <View style={{ gap: 10 }}>
              {GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <Pressable
                    key={g.key}
                    onPress={() => setGoal(g.key)}
                    style={({ pressed }) => ({
                      flexDirection: "row", alignItems: "center", gap: 14,
                      padding: theme.space.lg, borderRadius: theme.radius.card,
                      borderWidth: 1.5,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.tint : theme.colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 14,
                      backgroundColor: active ? theme.colors.primary : "rgba(8,145,178,0.08)",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name={g.icon as any} size={20} color={active ? "#fff" : theme.colors.primary} />
                    </View>
                    <AppText variant="h2" style={{ fontSize: 16, color: active ? theme.colors.primary : theme.colors.text }}>
                      {g.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <Button title={L.next} size="lg" onPress={() => setStep("body")} />
            <Pressable onPress={() => setStep("intro")} style={{ alignItems: "center", paddingVertical: 6 }}>
              <AppText style={{ fontSize: 14, fontWeight: "600", color: theme.colors.subtle }}>{L.back}</AppText>
            </Pressable>
          </View>
        )}

        {/* ── Body + live TDEE ── */}
        {step === "body" && (
          <View style={{ gap: theme.space.lg }}>
            <View style={{ gap: 6 }}>
              <AppText variant="h1">{L.bodyTitle}</AppText>
              <AppText variant="muted">{L.bodySub}</AppText>
            </View>

            <View style={{ gap: 6 }}>
              <AppText variant="muted">{L.gender}</AppText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Chip flex active={gender === "male"} label={L.male} onPress={() => setGender("male")} />
                <Chip flex active={gender === "female"} label={L.female} onPress={() => setGender("female")} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: theme.space.md }}>
              <TextField style={{ flex: 1 }} label={L.age} placeholder="21" value={age} onChangeText={setAge} keyboardType="number-pad" />
              <TextField style={{ flex: 1 }} label={L.weight} placeholder="65" value={weight} onChangeText={setWeight} keyboardType="number-pad" />
            </View>
            <TextField label={L.height} placeholder="170" value={height} onChangeText={setHeight} keyboardType="number-pad" />

            <View style={{ gap: 6 }}>
              <AppText variant="muted">{L.activity}</AppText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {ACTIVITIES.map((ac) => (
                  <Chip key={ac.key} flex active={activity === ac.key} label={ac.label} onPress={() => setActivity(ac.key)} />
                ))}
              </View>
            </View>

            {/* The wow moment: TDEE + goal appear the second the inputs are complete */}
            {tdee !== null && (
              <Card style={{ padding: theme.space.lg, backgroundColor: "rgba(5,150,105,0.06)", borderColor: "rgba(5,150,105,0.2)", gap: 6 }}>
                <AppText variant="subtle" style={{ fontSize: 12 }}>{L.tdeeLabel}</AppText>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                  <AppText variant="h0" style={{ fontSize: 32, color: theme.colors.accent }}>{tdee.toLocaleString()}</AppText>
                  <AppText variant="muted">kcal / {vi ? "ngày" : "day"}</AppText>
                </View>
                <AppText variant="subtle" style={{ fontSize: 12 }}>
                  {L.tdeeGoal}: <AppText style={{ fontSize: 12, fontWeight: "800", color: theme.colors.accent }}>{goalCal?.toLocaleString()} kcal</AppText>
                </AppText>
              </Card>
            )}

            <Button title={L.next} size="lg" onPress={() => setStep("health")} />
            <Pressable onPress={() => setStep("goal")} style={{ alignItems: "center", paddingVertical: 6 }}>
              <AppText style={{ fontSize: 14, fontWeight: "600", color: theme.colors.subtle }}>{L.back}</AppText>
            </Pressable>
          </View>
        )}

        {/* ── Health & taste ── */}
        {step === "health" && (
          <View style={{ gap: theme.space.lg }}>
            <View style={{ gap: 6 }}>
              <AppText variant="h1">{L.healthTitle}</AppText>
              <AppText variant="muted">{L.healthSub}</AppText>
            </View>

            <View style={{ gap: 6 }}>
              <AppText variant="muted">{L.conditions}</AppText>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {CONDITIONS.map((c) => (
                  <Chip key={c.key} active={conditions.includes(c.key)} label={c.label} onPress={() => toggleCondition(c.key)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <TextField label={L.taste} placeholder={L.tastePh} value={taste} onChangeText={setTaste} textContentType="none" />
              <AppText variant="subtle" style={{ fontSize: 11 }}>
                {vi ? "Gợi ý món, Coach và kế hoạch tuần sẽ luôn theo khẩu vị này." : "Suggestions, Coach and weekly plans will always respect this."}
              </AppText>
            </View>

            <Button title={saving ? L.saving : L.finish} size="lg" disabled={saving} onPress={finish} />
            <Pressable onPress={() => setStep("body")} style={{ alignItems: "center", paddingVertical: 6 }}>
              <AppText style={{ fontSize: 14, fontWeight: "600", color: theme.colors.subtle }}>{L.back}</AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
