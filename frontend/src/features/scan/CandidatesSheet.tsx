// Bottom sheet with the AI's top-3 dish guesses after a photo scan.
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import type { Candidate } from "@/features/scan/api";

export function CandidatesSheet({ visible, candidates, previewUri, onPick, onManual, onClose }: {
  visible: boolean;
  candidates: Candidate[] | null;
  previewUri: string | null;
  onPick: (c: Candidate) => void;
  onManual: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <View>
              <AppText variant="h2">What did AI see?</AppText>
              <AppText variant="muted" style={styles.subtitle}>Pick the closest match</AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
            </Pressable>
          </View>
          {previewUri && (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          )}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {candidates?.map((c, i) => {
                const pct = Math.round(c.confidence * 100);
                const isTop = i === 0;
                return (
                  <Pressable key={i} onPress={() => onPick(c)}>
                    <Card style={[styles.candidateCard, isTop && styles.candidateCardTop]}>
                      <View style={styles.candidateRow}>
                        <View style={styles.candidateInfo}>
                          <View style={styles.nameRow}>
                            <AppText variant="h2" style={styles.name}>{c.name}</AppText>
                            {isTop && (
                              <View style={styles.bestBadge}>
                                <AppText style={styles.bestBadgeText}>BEST MATCH</AppText>
                              </View>
                            )}
                          </View>
                          {c.portionDescription && (
                            <AppText variant="muted" style={styles.portion}>{c.portionDescription}</AppText>
                          )}
                          <View style={styles.macroRow}>
                            <AppText style={styles.kcal}>{c.calories} kcal</AppText>
                            <AppText style={styles.macros}>P {c.protein}g · C {c.carbs}g · F {c.fat}g</AppText>
                          </View>
                        </View>
                        <View style={styles.confidenceCol}>
                          <AppText style={[styles.confidence, isTop && styles.confidenceTop]}>{pct}%</AppText>
                          <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
              <Pressable onPress={onManual} style={styles.manualWrap}>
                <View style={styles.manualBox}>
                  <AppText style={styles.manualText}>None of these → enter manually</AppText>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40,
    maxHeight: "85%",
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: "center", marginBottom: theme.space.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md },
  subtitle: { fontSize: 13 },
  preview: { width: "100%", height: 140, borderRadius: 12, marginBottom: theme.space.md },
  list: { gap: theme.space.sm },
  candidateCard: { padding: theme.space.lg, borderWidth: 1, borderColor: theme.colors.border },
  candidateCardTop: { borderWidth: 2, borderColor: theme.colors.primary },
  candidateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  candidateInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 17 },
  bestBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bestBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  portion: { fontSize: 12 },
  macroRow: { flexDirection: "row", gap: 12, marginTop: 6, flexWrap: "wrap" },
  kcal: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  macros: { fontSize: 12, color: theme.colors.subtle },
  confidenceCol: { alignItems: "flex-end", gap: 2, marginLeft: 8 },
  confidence: { fontSize: 18, fontWeight: "800", color: theme.colors.subtle },
  confidenceTop: { color: theme.colors.primary },
  manualWrap: { marginTop: theme.space.sm },
  manualBox: {
    padding: theme.space.md, borderRadius: theme.radius.card,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
    alignItems: "center", gap: 4,
  },
  manualText: { fontSize: 14, fontWeight: "600", color: theme.colors.subtle },
});
