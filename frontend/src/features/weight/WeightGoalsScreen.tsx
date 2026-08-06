// ═══ FILE NÀY LÀM GÌ ═══
// Màn Mục tiêu cân nặng. File BẮT ĐẦU của luồng đặt mục tiêu calo.
//
// Ai gọi tới: ProfileScreen, qua địa chỉ /profile/goals
// Nhận vào:   cân nặng mục tiêu và tốc độ muốn đổi mỗi tuần
// Trả ra:     không trả gì, lưu xong thì mục tiêu calo được backend tính lại
// Khi lỗi:    thiếu hồ sơ để tính thì mời hoàn tất hồ sơ trước.
//             Tốc độ quá nhanh thì backend kẹp lại và app hiện con số thật.
//
// Điểm cần nói khi bảo vệ: mục tiêu calo có một mức SÀN, app không cho tụt
// xuống dưới. Câu cảnh báo nói rõ phần mềm dừng ở đâu và vì sao, chứ không
// tuyên bố gì về cơ thể người dùng.
//
// LUỒNG ĐẶT MỤC TIÊU
// 1. Mở màn, useFocusEffect gọi lại hồ sơ để lấy số mới nhất
// 2. Chọn hướng là giảm, giữ, hay tăng cân
// 3. Nhập cân nặng đích
// 4. Chọn tốc độ kg mỗi tuần trong các mức backend cho phép
// 5. Màn hiện thử mục tiêu calo, tính tại chỗ bằng estimateCalorieGoal
// 6. Bấm Lưu, chạy saveGoal
// 7. AuthContext.updateProfile        (PUT /profile)
// 8. backend tính lại mục tiêu chính thức và trả hồ sơ mới
// BA điều dễ hiểu nhầm ở màn này:
// Hướng và cân đích ràng buộc lẫn nhau. Chọn hướng thì ô cân đích được chuẩn bị
// sẵn, còn gõ cân đích thì hướng tự đổi theo. Người dùng đi đường nào cũng được.
// Con số calo trên màn chỉ là XEM TRƯỚC, tính bằng bản mirror ở frontend.
// Con số chính thức do backend tính lại sau khi lưu, và hai bên có thể lệch nhau
// khi backend phải áp mức sàn calo.
// Chọn tự động thì gửi calorieGoal bằng null để backend tự tính. Chọn tự đặt thì
// gửi đúng con số người dùng gõ, và backend ghi nhớ đây là mục tiêu tự đặt.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  PROFILE_LIMITS,
  estimateCalorieGoal,
  resolveDraftWeightDirection,
  WEIGHT_GOAL_BY_DIRECTION,
  type WeightDirection,
} from "@/config/nutritionCalculations";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { localeTag, resolveLanguage } from "@/utils/languageUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { SectionLabel } from "@/ui/components/SectionLabel";
import { TextField } from "@/ui/components/TextField";
import { DIGIT_LIMITS } from "@/config/inputLimits";

type CalorieMode = "automatic" | "custom";
const DIRECTIONS: WeightDirection[] = ["lose", "maintain", "gain"];
const DIRECTION_ICONS = {
  lose: "trending-down",
  maintain: "remove",
  gain: "trending-up",
} as const;

const parseNumber = (value: string) => Number(value.trim().replace(",", "."));

export default function WeightGoalsScreen() {
  const { user, stats, updateProfile, fetchProfile } = useAuth();
  const router = useRouter();
  const t = useT();
  const locale = localeTag(resolveLanguage(user?.language));
  const [targetInput, setTargetInput] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<WeightDirection>("maintain");
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [calorieMode, setCalorieMode] = useState<CalorieMode>("automatic");
  const [calorieInput, setCalorieInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Workflow tự chạy: mỗi lần quay lại màn thì tải lại hồ sơ, vì cân nặng có thể
  // vừa được ghi ở màn Tiến trình và mọi phép tính ở đây đều dựa vào nó.
  useFocusEffect(useCallback(() => { void fetchProfile().catch(() => {}); }, [fetchProfile]));

  // Workflow tự chạy: đổ hồ sơ vừa tải về vào form.
  useEffect(() => {
    setTargetInput(user?.targetWeight == null ? "" : String(user.targetWeight));
    setSelectedDirection(
      resolveDraftWeightDirection(
        user?.weight ?? null,
        user?.targetWeight ?? null,
        stats?.maintainWeightThresholdKg,
      ) ?? stats?.weightDirection ?? "maintain",
    );
    setSelectedRate(user?.weeklyRateKg ?? null);
    setCalorieMode(user?.customGoal ? "custom" : "automatic");
    setCalorieInput(user?.calorieGoal == null ? "" : String(user.calorieGoal));
  }, [
    stats?.maintainWeightThresholdKg,
    stats?.weightDirection,
    user?.calorieGoal,
    user?.customGoal,
    user?.targetWeight,
    user?.weeklyRateKg,
    user?.weight,
  ]);

  const currentWeight = user?.weight ?? null;
  const draftTargetWeight = targetInput.trim() ? parseNumber(targetInput) : null;
  const threshold = stats?.maintainWeightThresholdKg;

  const targetDirection = resolveDraftWeightDirection(currentWeight, draftTargetWeight, threshold);

  // Hai cách đặt mục tiêu chạy cùng nhau: chọn hướng sẽ chuẩn bị ô cân phù hợp,
  // còn nhập cân đích sẽ tự cập nhật lại hướng ngay trên màn hình.
  useEffect(() => {
    if (targetDirection) setSelectedDirection(targetDirection);
  }, [targetDirection]);

  const chooseDirection = (direction: WeightDirection) => {
    setSelectedDirection(direction);
    setSaveError("");
    if (direction === "maintain") {
      setTargetInput(currentWeight == null ? "" : String(currentWeight));
    } else if (targetDirection && targetDirection !== direction) {
      setTargetInput("");
    }
  };

  const rateOptions = useMemo(
    () => selectedDirection === "maintain" ? [] : stats?.rateOptions?.[selectedDirection] ?? [],
    [selectedDirection, stats?.rateOptions],
  );

  // Workflow tự chạy: giữ tốc độ đang chọn luôn nằm trong danh sách hợp lệ.
  // Giữ cân thì tốc độ đúng bằng 0. Đổi hướng mà tốc độ cũ không còn trong danh
  // sách của hướng mới thì lấy mức mặc định backend đưa xuống.
  useEffect(() => {
    if (selectedDirection === "maintain") {
      setSelectedRate(0);
      return;
    }
    if (!rateOptions.some((option) => option.value === selectedRate)) {
      setSelectedRate(stats?.rateBands?.[selectedDirection]?.default ?? rateOptions[0]?.value ?? null);
    }
  }, [rateOptions, selectedDirection, selectedRate, stats?.rateBands]);

  const numberLabel = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
  const previewTargetWeight = selectedDirection === "maintain" ? currentWeight : draftTargetWeight;
  const customCalorieGoal = calorieInput.trim() ? parseNumber(calorieInput) : null;
  const weightLimit = PROFILE_LIMITS.weightKg;
  const calorieLimit = PROFILE_LIMITS.calorieGoal;
  const currentWeightIsValid = currentWeight != null
    && Number.isFinite(currentWeight)
    && currentWeight >= weightLimit.min
    && currentWeight <= weightLimit.max;
  const targetWeightIsValid = previewTargetWeight != null
    && Number.isFinite(previewTargetWeight)
    && previewTargetWeight >= weightLimit.min
    && previewTargetWeight <= weightLimit.max;
  const customCaloriesAreValid = calorieMode === "automatic"
    || (customCalorieGoal != null
      && Number.isFinite(customCalorieGoal)
      && customCalorieGoal >= calorieLimit.min
      && customCalorieGoal <= calorieLimit.max);
  const rateIsValid = selectedDirection === "maintain" || selectedRate != null;
  const canSave = currentWeightIsValid && targetWeightIsValid && customCaloriesAreValid && rateIsValid;
  const gender = user?.gender === "male" || user?.gender === "female" ? user.gender : null;
  const automaticCalorieGoal = gender
    ? estimateCalorieGoal(
      stats?.tdee ?? null,
      gender,
      WEIGHT_GOAL_BY_DIRECTION[selectedDirection],
      selectedRate,
    )
    : null;
  const previewCalorieGoal = calorieMode === "automatic"
    ? automaticCalorieGoal
    : customCaloriesAreValid ? customCalorieGoal : null;
  const remainingWeightKg = currentWeight != null && previewTargetWeight != null && Number.isFinite(previewTargetWeight)
    ? Math.round(Math.abs(previewTargetWeight - currentWeight) * 10) / 10
    : null;

  // BƯỚC 6 CỦA LUỒNG. Người dùng bấm Lưu.
  // Gửi calorieGoal bằng null khi chọn tự động. Đó là tín hiệu để backend tính
  // lại từ TDEE chứ không phải là xóa mục tiêu.
  const saveGoal = async () => {
    if (!canSave || previewTargetWeight == null) return;

    setSaving(true);
    setSaveError("");
    try {
      await updateProfile({
        targetWeight: previewTargetWeight,
        weeklyRateKg: selectedDirection === "maintain" ? 0 : selectedRate,
        calorieGoal: calorieMode === "custom" ? customCalorieGoal : null,
      });
      router.back();
    } catch (error) {
      setSaveError(getUserErrorMessage(error, t, t.weight.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title={t.weightGoals.title} />
          <AppText variant="muted" style={styles.subtitle}>{t.weightGoals.subtitle}</AppText>
        </View>

        <SectionLabel>{t.weightGoals.targetSection}</SectionLabel>
        <Card style={styles.goalCard}>
          <View style={styles.directionCard}>
            {DIRECTIONS.map((direction) => {
              const active = selectedDirection === direction;
              return (
                <Pressable
                  key={direction}
                  onPress={() => chooseDirection(direction)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.directionOption,
                    active && styles.directionOptionActive,
                    pressed && styles.dim,
                  ]}
                >
                  <Ionicons
                    name={DIRECTION_ICONS[direction]}
                    size={18}
                    color={active ? "#FFFFFF" : theme.colors.subtle}
                  />
                  <AppText style={[styles.directionText, active && styles.directionTextActive]}>
                    {t.weightGoals.directions[direction]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.weightRow}>
            <View style={styles.weightColumn}>
              <AppText variant="subtle">{t.weightGoals.currentWeight}</AppText>
              <AppText variant="h1" style={styles.currentWeight}>
                {currentWeight == null ? "-" : numberLabel(currentWeight)}
              </AppText>
              <AppText variant="subtle">kg</AppText>
            </View>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={17} color={theme.colors.primary} />
            </View>
            <View style={styles.weightColumn}>
              <AppText variant="subtle">{t.weightGoals.targetWeight}</AppText>
              <AppText variant="h1" style={styles.targetWeight}>
                {previewTargetWeight == null || !Number.isFinite(previewTargetWeight)
                  ? "-"
                  : numberLabel(previewTargetWeight)}
              </AppText>
              <AppText variant="subtle">kg</AppText>
            </View>
          </View>
          {remainingWeightKg != null && selectedDirection !== "maintain" && (
            <View style={styles.remainingChip}>
              <AppText style={styles.remainingText}>{t.weightGoals.remaining(numberLabel(remainingWeightKg))}</AppText>
            </View>
          )}

          {selectedDirection === "maintain" ? (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
              <AppText variant="muted" style={styles.infoText}>{t.weightGoals.maintainHint}</AppText>
            </View>
          ) : (
            <>
              <View style={styles.divider} />
              <TextField
                label={t.weightGoals.targetLabel}
                placeholder={t.weightGoals.targetPlaceholder}
                value={targetInput}
                onChangeText={(value) => {
                  setTargetInput(value);
                  setSaveError("");
                }}
                keyboardType="decimal-pad"
                maxLength={DIGIT_LIMITS.WEIGHT}
              />
              <AppText variant="subtle" style={styles.hint}>{t.weightGoals.targetHint}</AppText>
            </>
          )}
        </Card>

        {selectedDirection !== "maintain" && (
          <>
            <SectionLabel>{t.weightGoals.paceSection}</SectionLabel>
            <Card style={styles.paceCard}>
              <AppText variant="subtle" style={styles.hint}>{t.weightGoals.paceHint}</AppText>
              <View style={styles.rateGrid}>
                {rateOptions.map((option) => {
                  const active = selectedRate === option.value;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setSelectedRate(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.rateOption,
                        active && styles.rateOptionActive,
                        pressed && styles.dim,
                      ]}
                    >
                      <View style={styles.rateTop}>
                        <AppText style={[styles.rateName, active && styles.activeText]}>
                          {t.weightGoals.paceNames[option.key]}
                        </AppText>
                        {active && <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />}
                      </View>
                      <AppText variant="subtle">{t.weight.rateValue(numberLabel(option.value))}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        <SectionLabel>{t.weightGoals.calorieSection}</SectionLabel>
        <Card style={styles.formCard}>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <AppText variant="subtle">{t.weightGoals.tdee}</AppText>
              <AppText variant="h2">{stats?.tdee?.toLocaleString(locale) ?? "-"}</AppText>
              <AppText variant="subtle">{t.common.kcal}</AppText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <AppText variant="subtle">{t.weightGoals.dailyGoal}</AppText>
              <AppText variant="h2" style={styles.goalCalories}>{previewCalorieGoal?.toLocaleString(locale) ?? "-"}</AppText>
              <AppText variant="subtle">{t.common.kcal}</AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable
            onPress={() => {
              setCalorieMode("automatic");
              setSaveError("");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: calorieMode === "automatic" }}
            style={({ pressed }) => [styles.modeRow, calorieMode === "automatic" && styles.modeRowActive, pressed && styles.dim]}
          >
            <Ionicons
              name="sparkles-outline"
              size={21}
              color={calorieMode === "automatic" ? theme.colors.primary : theme.colors.subtle}
            />
            <View style={styles.flex1}>
              <AppText style={styles.modeTitle}>{t.weightGoals.automatic}</AppText>
              <AppText variant="subtle">{t.weightGoals.automaticSub}</AppText>
            </View>
            {calorieMode === "automatic" && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
          </Pressable>
          <Pressable
            onPress={() => {
              setCalorieMode("custom");
              setSaveError("");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: calorieMode === "custom" }}
            style={({ pressed }) => [styles.modeRow, calorieMode === "custom" && styles.modeRowActive, pressed && styles.dim]}
          >
            <Ionicons
              name="create-outline"
              size={21}
              color={calorieMode === "custom" ? theme.colors.primary : theme.colors.subtle}
            />
            <View style={styles.flex1}>
              <AppText style={styles.modeTitle}>{t.weightGoals.custom}</AppText>
              <AppText variant="subtle">{t.weightGoals.customSub}</AppText>
            </View>
            {calorieMode === "custom" && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
          </Pressable>
          {calorieMode === "custom" && (
            <TextField
              label={t.weightGoals.customLabel}
              placeholder={t.settings.customGoalPlaceholder}
              value={calorieInput}
              onChangeText={(value) => {
                setCalorieInput(value);
                setSaveError("");
              }}
              keyboardType="number-pad"
              maxLength={DIGIT_LIMITS.CALORIE_GOAL}
            />
          )}
        </Card>

        {saveError ? <AppText style={styles.error}>{saveError}</AppText> : null}
        <Button
          title={saving ? t.common.saving : t.weightGoals.save}
          onPress={saveGoal}
          disabled={!canSave || saving}
          size="lg"
          left={<Ionicons name="checkmark" size={20} color="#FFFFFF" />}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 48, gap: theme.space.lg },
  subtitle: { marginTop: -8, lineHeight: 20 },
  goalCard: { padding: theme.space.lg, gap: theme.space.lg },
  directionCard: {
    flexDirection: "row", gap: 4, padding: 4,
    borderRadius: theme.radius.input, backgroundColor: theme.colors.tintSoft,
  },
  directionOption: {
    flex: 1, minHeight: 64, alignItems: "center", justifyContent: "center", gap: 4,
    borderRadius: 11,
  },
  directionOptionActive: { backgroundColor: theme.colors.primary },
  directionText: { fontSize: 12, fontWeight: "700", color: theme.colors.subtle, textAlign: "center" },
  directionTextActive: { color: "#FFFFFF" },
  weightRow: {
    flexDirection: "row", alignItems: "center", gap: theme.space.md,
    padding: theme.space.lg, borderRadius: theme.radius.card, backgroundColor: theme.colors.tintSoft,
  },
  weightColumn: { flex: 1, alignItems: "center", gap: 4 },
  currentWeight: { color: theme.colors.primary },
  targetWeight: { color: theme.colors.accent },
  arrowCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface,
  },
  remainingChip: {
    alignSelf: "center", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.tint,
  },
  remainingText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  divider: { height: 1, backgroundColor: theme.colors.border },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoText: { flex: 1, lineHeight: 19 },
  formCard: { padding: theme.space.lg, gap: theme.space.md },
  paceCard: { padding: theme.space.lg, gap: theme.space.md },
  hint: { lineHeight: 18 },
  rateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rateOption: {
    flexBasis: "47%", flexGrow: 1, gap: 6,
    padding: theme.space.md, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.input, backgroundColor: theme.colors.tintSoft,
  },
  rateOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  rateTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rateName: { fontWeight: "700" },
  activeText: { color: theme.colors.primary },
  metricRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: theme.space.md, borderRadius: theme.radius.input, backgroundColor: theme.colors.tintSoft,
  },
  metric: { flex: 1, alignItems: "center", gap: 4 },
  metricDivider: { width: 1, height: 48, backgroundColor: theme.colors.border },
  goalCalories: { color: theme.colors.accent },
  modeRow: {
    flexDirection: "row", alignItems: "center", gap: theme.space.md,
    padding: theme.space.md, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
  },
  modeRowActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  modeTitle: { fontWeight: "700" },
  error: { fontSize: 12, color: theme.colors.danger },
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },
});
