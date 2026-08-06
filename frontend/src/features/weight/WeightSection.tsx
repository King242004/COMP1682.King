// ═══ FILE NÀY LÀM GÌ ═══
// Phần Cân nặng trong màn Tiến trình. File BẮT ĐẦU của luồng ghi cân nặng.
//
// Ai gọi tới: ProgressScreen
// Nhận vào:   số cân nặng người dùng gõ
// Trả ra:     không trả gì, ghi xong thì biểu đồ và mục tiêu calo tự cập nhật
// Khi lỗi:    số ngoài khoảng hợp lý thì backend từ chối và màn hiện lỗi

// LUỒNG GHI CÂN NẶNG
// 1. Bấm nút Ghi cân nặng, hộp nhập mở ra
// 2. Nhập số rồi bấm lưu, chạy onLog
// 3. logWeight                    (POST /weight)
// 4. backend weightController.logWeight lưu, mỗi ngày chỉ giữ MỘT lần cân
// 5. nếu là lần cân mới nhất thì cập nhật luôn cân nặng trong hồ sơ,
//    và tính lại mục tiêu calo nếu người dùng để app tự tính
// 6. tải lại danh sách, biểu đồ vẽ lại
// Hai việc khác trong phần này: xóa một lần cân và xem biểu đồ đường.
// Cân nặng mục tiêu cùng tốc độ được chỉnh ở màn Mục tiêu cân nặng riêng.
import { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { TextField } from "@/ui/components/TextField";
import { PROFILE_LIMITS, resolveDraftWeightDirection, type WeightGoal } from "@/config/nutritionCalculations";
import { getWeights, logWeight, deleteWeight, type WeightHistory } from "./weightApi";
import { WeightChart } from "./WeightChart";
import { DIGIT_LIMITS } from "@/config/inputLimits";

function KgModal({ visible, title, sub, initial, onCancel, onSave }: {
  visible: boolean;
  title: string;
  sub: string;
  initial: string;
  onCancel: () => void;
  onSave: (raw: string) => void;
}) {
  const t = useT();
  const [value, setValue] = useState(initial);
  // Đặt lại giá trị trong hộp nhập mỗi lần hộp mở ra.
  useEffect(() => { if (visible) setValue(initial); }, [visible, initial]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHead}>
              <AppText variant="h2">{title}</AppText>
              <AppText variant="muted" style={styles.modalSub}>{sub}</AppText>
            </View>
            <TextField
              label={t.weight.kgLabel}
              placeholder={t.weight.kgPlaceholder}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              maxLength={DIGIT_LIMITS.WEIGHT}
              inputProps={{ autoFocus: true }}
            />
            <View style={styles.modalActions}>
              <View style={styles.flex1}>
                <Button title={t.common.cancel} variant="secondary" onPress={onCancel} />
              </View>
              <View style={styles.flex1}>
                <Button title={t.common.save} onPress={() => onSave(value)} />
              </View>
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function WeightSection() {
  const { token, user, stats, fetchProfile } = useAuth();
  const router = useRouter();
  // Ngày tháng đi theo ngôn ngữ đã chọn trong app.
  const locale = localeTag(resolveLanguage(user?.language));
  const t = useT();
  const weightLimit = PROFILE_LIMITS.weightKg;

  const showGoalAdjustment = (adjustedGoal?: WeightGoal) => {
    if (!adjustedGoal) return;
    Alert.alert(t.weight.goalAdjustedTitle, t.weight.goalAdjusted(t.labels.goal[adjustedGoal]));
  };

  const [history, setHistory] = useState<WeightHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [logVisible, setLogVisible] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setHistory(await getWeights(token));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Tự tải danh sách cân nặng khi mở phần này.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const parseKg = (raw: string): number | null => {
    // Chấp nhận dấu phẩy thập phân thường dùng trong tiếng Việt.
    const n = Number(raw.replace(",", "."));
    if (!raw.trim() || isNaN(n) || n < weightLimit.min || n > weightLimit.max) return null;
    return n;
  };

  const onLog = async (raw: string) => {
    const kg = parseKg(raw);
    if (kg == null) {
      Alert.alert(t.common.errorTitle, t.weight.invalidKg(String(weightLimit.min), String(weightLimit.max)));
      return;
    }
    setLogVisible(false);
    try {
      const result = await logWeight(token!, kg);
      await Promise.all([load(), fetchProfile()]);
      showGoalAdjustment(result.adjustedGoal);
    } catch (error) {
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.weight.saveFailed));
    }
  };

  // Xóa một lần cân.
  // Backend sẽ tự lấy lần cân còn lại mới nhất để cập nhật lại hồ sơ,
  // vì nếu xóa đúng lần mới nhất thì hồ sơ đang giữ một số không còn tồn tại.
  const onDelete = (id: string, date: string) => {
    Alert.alert(t.weight.deleteTitle, t.weight.deleteMsg(dLabel(date)), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          try {
            const result = await deleteWeight(token!, id);
            await Promise.all([load(), fetchProfile()]);
            showGoalAdjustment(result.adjustedGoal);
          } catch {
            Alert.alert(t.common.errorTitle, t.common.tryAgain);
          }
        },
      },
    ]);
  };

  const dLabel = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  const numberLabel = (value: number) =>
    value.toLocaleString(locale, { maximumFractionDigits: 2 });

  if (loading && !history) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const logs = history?.logs ?? [];
  const currentWeight = history?.currentWeight ?? null;
  const targetWeight = history?.targetWeight ?? null;
  const remainingWeightKg = currentWeight != null && targetWeight != null
    ? Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10
    : null;
  const reached = remainingWeightKg != null && resolveDraftWeightDirection(
    currentWeight,
    targetWeight,
    stats?.maintainWeightThresholdKg,
  ) === "maintain";

  return (
    <>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <AppText variant="subtle" style={styles.summaryLabel}>{t.weight.current}</AppText>
            <View style={styles.baseline}>
              <AppText variant="h0" style={styles.currentKg}>{currentWeight == null ? "-" : numberLabel(currentWeight)}</AppText>
              {currentWeight != null && <AppText variant="muted" style={styles.kgUnit}>kg</AppText>}
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <AppText variant="subtle" style={styles.summaryLabel}>{t.weight.target}</AppText>
            <View style={styles.baseline}>
              <AppText variant="h0" style={styles.targetKg}>{targetWeight == null ? "-" : numberLabel(targetWeight)}</AppText>
              {targetWeight != null && <AppText variant="muted" style={styles.kgUnit}>kg</AppText>}
            </View>
          </View>
        </View>

        {remainingWeightKg != null && (
          <View style={[styles.toGoChip, reached && styles.toGoChipDone]}>
            <AppText style={[styles.toGoText, reached && styles.toGoTextDone]}>
              {reached ? t.weight.reached : t.weight.toGo(numberLabel(remainingWeightKg))}
            </AppText>
          </View>
        )}

        <View style={styles.actions}>
          <Button title={t.weightGoals.adjust} variant="secondary" onPress={() => router.push("/profile/goals")} />
          <Button title={t.weight.logWeight} onPress={() => setLogVisible(true)} />
        </View>
      </Card>

      {/* Trend chart — needs at least 2 points to draw a line */}
      {logs.length >= 2 ? (
        <Card style={styles.chartCard}>
          <View style={styles.chartHead}>
            <AppText variant="h2">{t.weight.chartTitle}</AppText>
            <AppText variant="subtle" style={styles.changeText}>
              {t.weight.changeSince(
                `${logs[logs.length - 1].weightKg - logs[0].weightKg > 0 ? "+" : ""}${Math.round((logs[logs.length - 1].weightKg - logs[0].weightKg) * 10) / 10}`,
                dLabel(logs[0].date)
              )}
            </AppText>
          </View>
          <WeightChart logs={logs} targetWeight={targetWeight} locale={locale} />
        </Card>
      ) : logs.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="scale-outline" size={28} color={theme.colors.primary} />
          </View>
          <AppText variant="h2" style={styles.centerText}>{t.weight.emptyTitle}</AppText>
          <AppText variant="muted" style={styles.centerText}>{t.weight.emptySub}</AppText>
        </Card>
      ) : null}

      {logs.length > 0 && (
        <Card style={styles.listCard}>
          <AppText variant="h2">{t.weight.entries}</AppText>
          <View style={styles.list}>
            {[...logs].reverse().map((l) => (
              <View key={l._id} style={styles.row}>
                <AppText variant="body2" style={styles.rowDate}>{dLabel(l.date)}</AppText>
                <AppText variant="body2" style={styles.rowKg}>{l.weightKg} kg</AppText>
                <Pressable onPress={() => onDelete(l._id, l.date)} hitSlop={10} style={({ pressed }) => pressed && styles.dim}>
                  <Ionicons name="trash-outline" size={16} color={theme.colors.subtle} />
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      )}

      <KgModal
        visible={logVisible}
        title={t.weight.logTitle}
        sub={t.weight.logSub}
        initial={currentWeight != null ? String(currentWeight) : ""}
        onCancel={() => setLogVisible(false)}
        onSave={onLog}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },

  summaryCard: { padding: theme.space.xl, gap: theme.space.md },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryCol: { flex: 1, alignItems: "center", gap: 2 },
  summaryDivider: { width: 0.5, alignSelf: "stretch", backgroundColor: theme.colors.border },
  summaryLabel: { fontSize: 12 },
  baseline: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  currentKg: { fontSize: 30, color: theme.colors.primary },
  targetKg: { fontSize: 30, color: theme.colors.accent },
  kgUnit: { fontSize: 13 },
  toGoChip: {
    alignSelf: "center", paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.tint,
  },
  toGoChipDone: { backgroundColor: "rgba(5,150,105,0.12)" },
  toGoText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  toGoTextDone: { color: theme.colors.accent },

  actions: { gap: theme.space.sm },

  chartCard: { padding: theme.space.lg, gap: theme.space.md },
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  changeText: { fontSize: 11 },

  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  centerText: { textAlign: "center" },

  listCard: { padding: theme.space.lg, gap: theme.space.md },
  list: { gap: 2 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border,
  },
  rowDate: { flex: 1, color: theme.colors.muted },
  rowKg: { fontWeight: "700" },

  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", paddingHorizontal: theme.space.xl,
  },
  modalCard: { padding: theme.space.xl, gap: theme.space.lg },
  modalHead: { gap: 4 },
  modalSub: { fontSize: 13 },
  modalActions: { flexDirection: "row", gap: theme.space.md },
});
