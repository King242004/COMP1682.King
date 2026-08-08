// ═══ FILE NÀY LÀM GÌ ═══
// Màn Mục tiêu cân nặng. File BẮT ĐẦU của luồng đặt mục tiêu calo.
//
// Ai gọi tới: ProfileScreen, qua địa chỉ /profile/goals
// Nhận vào:   cân nặng mục tiêu và tốc độ muốn đổi mỗi tuần
// Trả ra:     không trả gì; profileController.updateProfile trả mục tiêu calo mới
// Khi lỗi:    thiếu hồ sơ để tính thì mời hoàn tất hồ sơ trước.
//             calorieGoal.resolveRate kẹp tốc độ quá nhanh và response trả con số thật.
//
// Điểm cần nói khi bảo vệ: mục tiêu calo có một mức SÀN, app không cho tụt
// xuống dưới. Câu cảnh báo nói rõ phần mềm dừng ở đâu và vì sao, chứ không
// tuyên bố gì về cơ thể người dùng.
//
// BA điều dễ hiểu nhầm ở màn này, nhớ kỹ ba cái này:
//
// 1. Hướng và cân đích RÀNG BUỘC LẪN NHAU. Chọn hướng thì ô cân đích được chuẩn bị
//    sẵn, còn gõ cân đích thì hướng tự đổi theo. Người dùng đi đường nào cũng được.
// 2. Con số calo trên màn chỉ là XEM TRƯỚC, tính tại máy bằng nutritionCalculations.ts.
//    Con số lưu chính thức do backend tính lại trong services/nutrition/calorieGoal.js.
//    Hai số có thể LỆCH NHAU, khi calorieGoal.buildCalorieGoal áp mức sàn calo.
// 3. Chọn tự động thì gửi calorieGoal là null, đó KHÔNG phải xóa mục tiêu,
//    mà là bảo profileController tự tính lại từ TDEE.
//    Chọn tự đặt thì gửi con số người dùng gõ, và backend bật cờ customGoal.
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
import { ActionSheet } from "@/ui/components/ActionSheet";
import { TextField } from "@/ui/components/TextField";
import { DIGIT_LIMITS } from "@/config/inputLimits";

type CalorieMode = "automatic" | "custom";
const DIRECTIONS: WeightDirection[] = ["lose", "maintain", "gain"];
// Icon cho ba nút hướng. Mũi tên xuống là giảm, gạch ngang là giữ, mũi tên lên là tăng.
const DIRECTION_ICONS = {
  lose: "trending-down",
  maintain: "remove",
  gain: "trending-up",
} as const;

// Số buổi tập mỗi tuần cho người dùng chọn. null đứng đầu là "Không đặt".
// Trần 7 khớp luật trong profileController.updateProfile.
const WORKOUT_TARGET_OPTIONS: (number | null)[] = [null, 1, 2, 3, 4, 5, 6, 7];

// Đọc số từ ô nhập. Đổi dấu phẩy thành dấu chấm, vì người Việt hay gõ "65,5".
const parseNumber = (value: string) => Number(value.trim().replace(",", "."));

// ══════════════════════════════════════════════════════════
// ĐẶT MỤC TIÊU
//
// Đến từ màn Hồ sơ, qua địa chỉ /profile/goals.
// Sáu bước, đọc từ trên xuống là đúng thứ tự. Hai chặng chờ mạng,
// một ở BƯỚC 1 tải hồ sơ, một ở BƯỚC 6 lưu.
// Xong thì quay về màn Hồ sơ, và vòng calo ở Trang chủ đổi theo mục tiêu mới.
// ══════════════════════════════════════════════════════════

// ĐẶT MỤC TIÊU BƯỚC 1. Mỗi lần quay lại màn thì tải lại hồ sơ.
// Cần vì cân nặng có thể vừa được ghi ở màn Tiến trình, mà mọi phép tính
// ở màn này đều dựa vào cân nặng hiện tại.
// Đường đi: AuthContext.fetchProfile → authApi → apiClient → GET /profile
//           → profileController.getProfile
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
  // null nghĩa là chưa đặt mục tiêu. App KHÔNG tự đoán hộ một con số,
  // vì số ngày tập mỗi tuần là lựa chọn cá nhân, không phải ngưỡng sức khỏe.
  const [workoutTarget, setWorkoutTarget] = useState<number | null>(null);
  const [workoutSheetOpen, setWorkoutSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Không ai bấm, tự chạy mỗi lần màn được nhìn thấy. Nuốt lỗi vì hồ sơ cũ
  // trong AuthContext vẫn dùng được, hiện bản cũ hơn là chắn màn bằng thông báo.
  useFocusEffect(useCallback(() => { void fetchProfile().catch(() => {}); }, [fetchProfile]));

  // ĐẶT MỤC TIÊU BƯỚC 2. Đổ hồ sơ vừa tải về vào form. Cũng tự chạy, không ai bấm.
  // Chạy lại mỗi khi một trong tám giá trị ở mảng phụ thuộc phía dưới đổi.
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
    setWorkoutTarget(user?.weeklyWorkoutTarget ?? null);
  }, [
    stats?.maintainWeightThresholdKg,
    stats?.weightDirection,
    user?.calorieGoal,
    user?.customGoal,
    user?.targetWeight,
    user?.weeklyRateKg,
    user?.weeklyWorkoutTarget,
    user?.weight,
  ]);

  const currentWeight = user?.weight ?? null;
  const draftTargetWeight = targetInput.trim() ? parseNumber(targetInput) : null;
  const threshold = stats?.maintainWeightThresholdKg;

  // ĐẶT MỤC TIÊU BƯỚC 3. Hướng và cân đích ràng buộc lẫn nhau, hai chiều.
  //
  // Chiều thứ nhất, GÕ CÂN ĐÍCH thì hướng tự đổi. Suy ra hướng từ cân hiện tại
  // với cân đích, nhưng phải chênh quá threshold mới tính là giảm hay tăng,
  // chênh vài lạng thì vẫn là giữ cân.
  const targetDirection = resolveDraftWeightDirection(currentWeight, draftTargetWeight, threshold);

  // Hướng suy ra ở trên đổi thì gạt luôn nút hướng cho khớp.
  useEffect(() => {
    if (targetDirection) setSelectedDirection(targetDirection);
  }, [targetDirection]);

  // Chiều thứ hai, BẤM NÚT HƯỚNG thì ô cân đích được chuẩn bị sẵn.
  // Chọn giữ cân thì điền luôn cân hiện tại, vì đích chính là số đó.
  // Chọn hướng ngược với cân đang gõ thì XÓA TRẮNG ô, kẻo giữ lại một con số
  // mâu thuẫn với hướng vừa chọn.
  const chooseDirection = (direction: WeightDirection) => {
    setSelectedDirection(direction);
    setSaveError("");
    if (direction === "maintain") {
      setTargetInput(currentWeight == null ? "" : String(currentWeight));
    } else if (targetDirection && targetDirection !== direction) {
      setTargetInput("");
    }
  };

  // ĐẶT MỤC TIÊU BƯỚC 4. Danh sách tốc độ kg mỗi tuần cho hướng đang chọn.
  // Danh sách do BACKEND đưa qua stats.rateOptions, app không tự nghĩ ra mức nào.
  // Giữ cân thì không có tốc độ nào cả, trả mảng rỗng.
  const rateOptions = useMemo(
    () => selectedDirection === "maintain" ? [] : stats?.rateOptions?.[selectedDirection] ?? [],
    [selectedDirection, stats?.rateOptions],
  );

  // Tự chạy, giữ cho tốc độ đang chọn luôn nằm trong danh sách hợp lệ.
  // Giữ cân thì ép tốc độ về 0. Đổi hướng mà tốc độ cũ không còn trong danh sách
  // của hướng mới thì lấy mức mặc định trong stats.rateBands, cũng do backend đưa.
  useEffect(() => {
    if (selectedDirection === "maintain") {
      setSelectedRate(0);
      return;
    }
    if (!rateOptions.some((option) => option.value === selectedRate)) {
      setSelectedRate(stats?.rateBands?.[selectedDirection]?.default ?? rateOptions[0]?.value ?? null);
    }
  }, [rateOptions, selectedDirection, selectedRate, stats?.rateBands]);

  // Số kg, cắt còn tối đa hai chữ số sau dấu thập phân, theo ngôn ngữ đang chọn.
  const numberLabel = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });

  // Chữ hiện trên hàng, và danh sách trong menu trượt. Mục đang chọn mang dấu
  // tích, bảy mục còn lại không có icon, nhờ ActionSheet cho icon là tùy chọn.
  const labelForTarget = (value: number | null) =>
    value == null ? t.weightGoals.workoutNone : t.weightGoals.workoutDays(value);
  const workoutTargetLabel = labelForTarget(workoutTarget);
  const workoutItems = WORKOUT_TARGET_OPTIONS.map((option) => ({
    label: labelForTarget(option),
    ...(workoutTarget === option ? { icon: "checkmark" as const } : {}),
    onPress: () => {
      setWorkoutTarget(option);
      setSaveError("");
    },
  }));
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
  // ĐẶT MỤC TIÊU BƯỚC 5. Tính thử mục tiêu calo để hiện ngay trên màn.
  // Nhớ: con số này chỉ để XEM TRƯỚC, tính tại máy. Số lưu chính thức do backend
  //      tính lại ở BƯỚC 6, và có thể lệch khi backend áp mức sàn calo.
  // Thiếu giới tính thì không tính được, trả null và màn hiện lời mời hoàn tất hồ sơ.
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

  // ĐẶT MỤC TIÊU BƯỚC 6. Người dùng bấm Lưu.
  // Đường đi: AuthContext.updateProfile → authApi → apiClient → PUT /profile
  //           → profileController.updateProfile → services/nutrition/calorieGoal.js
  // Nhớ: chọn tự động thì gửi calorieGoal là null. Đó KHÔNG phải xóa mục tiêu,
  //      mà là bảo backend tự tính lại từ TDEE.
  const saveGoal = async () => {
    if (!canSave || previewTargetWeight == null) return;

    setSaving(true);
    setSaveError("");
    try {
      await updateProfile({
        targetWeight: previewTargetWeight,
        weeklyRateKg: selectedDirection === "maintain" ? 0 : selectedRate,
        calorieGoal: calorieMode === "custom" ? customCalorieGoal : null,
        weeklyWorkoutTarget: workoutTarget,
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

        {/* Nằm ngoài khối Tốc độ vì khối đó tự ẩn khi chọn Giữ cân,
            mà người giữ cân vẫn tập. */}
        <SectionLabel>{t.weightGoals.workoutSection}</SectionLabel>
        <Card style={styles.workoutCard}>
          <AppText variant="subtle" style={styles.hint}>{t.weightGoals.workoutHint}</AppText>
          <Pressable
            onPress={() => setWorkoutSheetOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.workoutRow, pressed && styles.dim]}
          >
            <AppText style={styles.modeTitle}>{t.weightGoals.workoutRowLabel}</AppText>
            <View style={styles.workoutValue}>
              <AppText style={styles.activeText}>{workoutTargetLabel}</AppText>
              <Ionicons name="chevron-down" size={18} color={theme.colors.primary} />
            </View>
          </Pressable>
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

      <ActionSheet
        visible={workoutSheetOpen}
        onClose={() => setWorkoutSheetOpen(false)}
        items={workoutItems}
      />
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
  workoutCard: { padding: theme.space.lg, gap: theme.space.md },
  workoutRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: theme.space.md, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
  },
  workoutValue: { flexDirection: "row", alignItems: "center", gap: 4 },
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
