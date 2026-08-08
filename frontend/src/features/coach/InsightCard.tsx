// ═══ FILE NÀY LÀM GÌ ═══
// Thẻ điểm sức khỏe ở đầu màn Coach.
//
// Ai gọi tới: CoachScreen
// Nhận vào:   điểm tổng và bốn phần điểm thành phần
// Trả ra:     thẻ điểm, luôn hiện đủ bốn phần chứ không chỉ con số tổng
// Khi lỗi:    chưa đủ hồ sơ thì mời hoàn tất, không hiện điểm bịa

// Điểm này do backend/src/services/coach/dailyHealthScore.js tính bằng công thức cố định,
// không phải do aiClient chấm.
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { CoachInsight } from "@/features/coach/coachApi";

// ══════════════════════════════════════════════════════════
// VẼ THẺ ĐIỂM SỨC KHỎE
//
// Đến từ màn Coach. Ba bước, đọc từ trên xuống là đúng thứ tự.
// KHÔNG gọi mạng, điểm do màn Coach tải về rồi đưa xuống.
// ══════════════════════════════════════════════════════════

// Màu theo mức điểm: từ 75 trở lên là xanh lá, từ 50 là cam, dưới nữa là đỏ.
// Chỉ có ba mức, không có mức trung gian nào khác.
function scoreColor(score: number) {
  if (score >= 75) return theme.colors.accent;
  if (score >= 50) return theme.colors.accent2;
  return theme.colors.danger;
}

// VẼ THẺ ĐIỂM BƯỚC 1. Nhận điểm cùng bốn cờ trạng thái từ màn Coach.
// Bốn trạng thái rỗng khác nhau, xử lý ở phần trên của hàm: đang tải,
// hồ sơ chưa đủ, gọi hỏng, và chưa ghi món nào hôm nay.
export function InsightCard({ insight, loading, sending, failText, profileIncomplete, onCompleteProfile, onLogMeal, onAskTip }: {
  insight: CoachInsight | null;
  loading: boolean;
  sending: boolean;
  failText: string;
  profileIncomplete: boolean;
  onCompleteProfile: () => void;
  onLogMeal: () => void;
  onAskTip: (tip: string) => void;
}) {
  const t = useT();
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  // Ngày chưa có bữa nào thì không chấm. Hiện một điểm rất thấp lúc sáng sớm
  // là phán xét người dùng trong khi họ chưa làm gì sai, ngày còn chưa bắt đầu.
  if (insight?.pending) {
    return (
      <Card style={styles.failCard}>
        <AppText variant="muted" style={styles.failText}>{t.coach.scorePending}</AppText>
        <Pressable onPress={onLogMeal} style={({ pressed }) => [styles.profileBtn, pressed && styles.dim]}>
          <AppText style={styles.profileBtnText}>{t.coach.scorePendingCta}</AppText>
        </Pressable>
      </Card>
    );
  }

  if (!insight) {
    return (
      <Card style={styles.failCard}>
        <AppText variant="muted" style={styles.failText}>{profileIncomplete ? t.coach.profileNeeded : failText}</AppText>
        {profileIncomplete && (
          <Pressable onPress={onCompleteProfile} style={({ pressed }) => [styles.profileBtn, pressed && styles.dim]}>
            <AppText style={styles.profileBtnText}>{t.coach.completeProfile}</AppText>
          </Pressable>
        )}
      </Card>
    );
  }

  // VẼ THẺ ĐIỂM BƯỚC 2. Tới đây là chắc chắn có điểm, dựng dữ liệu để vẽ.
  const color = scoreColor(insight.score);
  // VẼ THẺ ĐIỂM BƯỚC 3. Bốn dòng điểm thành phần, mỗi dòng gồm nhãn, điểm, và trọng số.
  // Trọng số do backend đưa xuống chứ app không tự đặt, nên đổi cách chấm ở backend
  // là màn này hiện theo luôn, khỏi phải sửa gì.
  const scoreRows = [
    [t.coach.scoreCalorie, insight.breakdown.calorie, insight.weights.calorie],
    [t.coach.scoreProtein, insight.breakdown.protein, insight.weights.protein],
    [t.coach.scoreActivity, insight.breakdown.activity, insight.weights.activity],
    [t.coach.scoreConsistency, insight.breakdown.consistency, insight.weights.consistency],
  ] as const;

  return (
    <Card style={styles.card}>
      <View style={styles.headRow}>
        {/* Màu viền phụ thuộc điểm nên chỉ biết khi component chạy. */}
        <View style={[styles.scoreRing, { borderColor: color }]}>
          <AppText style={[styles.scoreText, { color }]}>{insight.score}</AppText>
        </View>
        <View style={styles.headBody}>
          <AppText variant="h2" style={styles.title}>{t.coach.healthScore}</AppText>
          <AppText variant="muted" style={styles.summary}>{insight.summary}</AppText>
        </View>
      </View>

      <View style={styles.breakdown}>
        {scoreRows.map(([label, value, max]) => (
          <View key={label} style={styles.scorePart}>
            <AppText variant="subtle" style={styles.scorePartLabel} numberOfLines={1}>{label}</AppText>
            <AppText style={styles.scorePartValue}>{value}/{max}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="subtle" style={styles.scoreNote}>{t.coach.scoreNote}</AppText>

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
  profileBtn: { marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  profileBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
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
  breakdown: { flexDirection: "row", gap: 6 },
  scorePart: { flex: 1, alignItems: "center", backgroundColor: theme.colors.bg, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 3 },
  scorePartLabel: { fontSize: 9 },
  scorePartValue: { fontSize: 12, fontWeight: "800", color: theme.colors.primary },
  scoreNote: { fontSize: 10, textAlign: "center" },
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
