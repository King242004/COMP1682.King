// Daily Health Score card: ring-style score + tappable warnings/tips
// (tapping one sends it into the chat for elaboration).
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { CoachInsight } from "@/features/coach/api";

function scoreColor(score: number) {
  if (score >= 75) return theme.colors.accent;
  if (score >= 50) return theme.colors.accent2;
  return theme.colors.danger;
}

export function InsightCard({ insight, loading, sending, failText, onAskTip }: {
  insight: CoachInsight | null;
  loading: boolean;
  sending: boolean;
  failText: string;
  onAskTip: (tip: string) => void;
}) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!insight) {
    return (
      <Card style={styles.failCard}>
        <AppText variant="muted" style={styles.failText}>{failText}</AppText>
      </Card>
    );
  }

  const color = scoreColor(insight.score);

  return (
    <Card style={styles.card}>
      <View style={styles.headRow}>
        {/* border color depends on the score — runtime value */}
        <View style={[styles.scoreRing, { borderColor: color }]}>
          <AppText style={[styles.scoreText, { color }]}>{insight.score}</AppText>
        </View>
        <View style={styles.headBody}>
          <AppText variant="h2" style={styles.title}>Health Score</AppText>
          <AppText variant="muted" style={styles.summary}>{insight.summary}</AppText>
        </View>
      </View>

      {/* Warnings and tips are tappable → sends them to the chat for elaboration */}
      {insight.warnings.map((w, i) => (
        <Pressable
          key={i}
          onPress={() => onAskTip(w)}
          disabled={sending}
          style={({ pressed }) => [styles.warnRow, pressed && styles.warnRowPressed]}
        >
          <Ionicons name="warning-outline" size={16} color={theme.colors.danger} />
          <AppText style={styles.warnText}>{w}</AppText>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.danger} style={styles.chatIcon} />
        </Pressable>
      ))}

      {insight.tips.map((t, i) => (
        <Pressable
          key={i}
          onPress={() => onAskTip(t)}
          disabled={sending}
          style={({ pressed }) => [styles.tipRow, pressed && styles.dim]}
        >
          <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} style={styles.bulbIcon} />
          <AppText variant="body2" style={styles.flex1}>{t}</AppText>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.subtle} style={styles.chatIcon} />
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },
  loadingWrap: { paddingVertical: theme.space.xl, alignItems: "center" },
  failCard: { padding: theme.space.lg, alignItems: "center" },
  failText: { textAlign: "center" },
  card: { padding: theme.space.lg, gap: 12 },
  headRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  scoreRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 5,
    alignItems: "center", justifyContent: "center",
  },
  scoreText: { fontSize: 20, fontWeight: "800" },
  headBody: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  summary: { fontSize: 13 },
  warnRow: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "rgba(229,72,77,0.08)",
    borderRadius: 10, padding: 10,
  },
  warnRowPressed: { backgroundColor: "rgba(229,72,77,0.16)" },
  warnText: { fontSize: 13, color: theme.colors.danger, flex: 1 },
  tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bulbIcon: { marginTop: 1 },
  chatIcon: { marginTop: 2 },
});
