// Weight tab content for the Progress screen: current/target summary,
// log + target modals, trend chart and the entry list.
import { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { TextField } from "@/ui/components/TextField";
import { getWeights, logWeight, deleteWeight, type WeightHistory } from "./api";
import { WeightChart } from "./WeightChart";

// Small centered input dialog shared by the log + target modals
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
  // Re-seed the field every time the modal opens
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
  const { token, updateProfile, fetchProfile } = useAuth();
  const t = useT();

  const [history, setHistory] = useState<WeightHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [logVisible, setLogVisible] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setHistory(await getWeights(token));
    } catch {
      // keep whatever we had — the empty state covers first load failures
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const parseKg = (raw: string): number | null => {
    const n = Number(raw.replace(",", ".")); // accept the Vietnamese decimal comma
    if (!raw.trim() || isNaN(n) || n < 20 || n > 300) return null;
    return n;
  };

  const onLog = async (raw: string) => {
    const kg = parseKg(raw);
    if (kg == null) {
      Alert.alert(t.common.errorTitle, t.weight.invalidKg);
      return;
    }
    setLogVisible(false);
    try {
      await logWeight(token!, kg);
      await Promise.all([load(), fetchProfile()]); // profile weight synced server-side
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.weight.saveFailed);
    }
  };

  const onSaveTarget = async (raw: string) => {
    // Empty input clears the target
    const kg = raw.trim() ? parseKg(raw) : null;
    if (raw.trim() && kg == null) {
      Alert.alert(t.common.errorTitle, t.weight.invalidKg);
      return;
    }
    setTargetVisible(false);
    try {
      await updateProfile({ targetWeight: kg });
      await load();
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.weight.saveFailed);
    }
  };

  const onDelete = (id: string, date: string) => {
    Alert.alert(t.weight.deleteTitle, t.weight.deleteMsg(dLabel(date)), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteWeight(token!, id);
            await Promise.all([load(), fetchProfile()]);
          } catch {
            Alert.alert(t.common.errorTitle, t.common.tryAgain);
          }
        },
      },
    ]);
  };

  const dLabel = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  if (loading && !history) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const logs = history?.logs ?? [];
  const current = history?.currentWeight ?? null;
  const target = history?.targetWeight ?? null;
  const toGo = current != null && target != null ? Math.round((current - target) * 10) / 10 : null;
  // "Reached" depends on direction: cutting → at/below target; bulking → at/above
  const reached =
    toGo != null &&
    (target! <= (logs[0]?.weightKg ?? current!) ? current! <= target! : current! >= target!);

  return (
    <>
      {/* Summary: current | target + distance chip */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <AppText variant="subtle" style={styles.summaryLabel}>{t.weight.current}</AppText>
            <View style={styles.baseline}>
              <AppText variant="h0" style={styles.currentKg}>{current ?? "—"}</AppText>
              {current != null && <AppText variant="muted" style={styles.kgUnit}>kg</AppText>}
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <Pressable onPress={() => setTargetVisible(true)} style={({ pressed }) => [styles.summaryCol, pressed && styles.dim]}>
            <View style={styles.targetLabelRow}>
              <AppText variant="subtle" style={styles.summaryLabel}>{t.weight.target}</AppText>
              <Ionicons name="pencil" size={11} color={theme.colors.subtle} />
            </View>
            <View style={styles.baseline}>
              <AppText variant="h0" style={styles.targetKg}>{target ?? "—"}</AppText>
              {target != null && <AppText variant="muted" style={styles.kgUnit}>kg</AppText>}
            </View>
          </Pressable>
        </View>

        {toGo != null && (
          <View style={[styles.toGoChip, reached && styles.toGoChipDone]}>
            <AppText style={[styles.toGoText, reached && styles.toGoTextDone]}>
              {reached ? t.weight.reached : t.weight.toGo(String(Math.abs(toGo)))}
            </AppText>
          </View>
        )}

        <Button title={t.weight.logWeight} onPress={() => setLogVisible(true)} />
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
          <WeightChart logs={logs} targetWeight={target} />
        </Card>
      ) : logs.length === 0 ? (
        <Card style={styles.emptyCard}>
          <AppText style={styles.emptyEmoji}>⚖️</AppText>
          <AppText variant="h2" style={styles.centerText}>{t.weight.emptyTitle}</AppText>
          <AppText variant="muted" style={styles.centerText}>{t.weight.emptySub}</AppText>
        </Card>
      ) : null}

      {/* Entry list — newest first */}
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
        initial={current != null ? String(current) : ""}
        onCancel={() => setLogVisible(false)}
        onSave={onLog}
      />
      <KgModal
        visible={targetVisible}
        title={t.weight.targetTitle}
        sub={t.weight.targetSub}
        initial={target != null ? String(target) : ""}
        onCancel={() => setTargetVisible(false)}
        onSave={onSaveTarget}
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
  targetLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
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

  chartCard: { padding: theme.space.lg, gap: theme.space.md },
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  changeText: { fontSize: 11 },

  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
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
