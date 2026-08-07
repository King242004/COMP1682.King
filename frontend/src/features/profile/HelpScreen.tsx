// ═══ FILE NÀY LÀM GÌ ═══
// Màn Giới thiệu và hướng dẫn. Đây là màn TÀI LIỆU, không phải màn dữ liệu.
//
// Ai gọi tới: ProfileScreen
// Nhận vào:   không nhận gì
// Trả ra:     các mục hướng dẫn dùng app
// Khi lỗi:    không có nhánh lỗi; file này không gọi apiClient

// Đây là màn TÀI LIỆU, không phải màn dữ liệu. Nó không gọi apiClient,
// KHÔNG đọc hồ sơ người dùng và không hiện con số của ai.
// Lý do: mỗi con số chỉ nên có một nhà, và nhà của BMI, BMR, TDEE là màn Hồ sơ.
// Nhét lại vào đây là lặp đúng cái đã dọn khi bỏ ô mục tiêu calo khỏi Hồ sơ.
// Năm tab: Giới thiệu, BMI, BMR, TDEE, Mục tiêu calo.
// Bốn tab sau dùng chung một khuôn: là gì, cách tính, ví dụ cố định,
// điều nó không nói được, và nguồn.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { SectionLabel } from "@/ui/components/SectionLabel";

type TabKey = "intro" | "bmi" | "bmr" | "tdee" | "goal";

// Một dòng trong danh sách app làm được gì.
function FeatureRow({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as never} size={17} color={theme.colors.primary} />
      </View>
      <View style={styles.featureBody}>
        <AppText variant="body2" style={styles.featureTitle}>{title}</AppText>
        <AppText variant="subtle" style={styles.featureText}>{text}</AppText>
      </View>
    </View>
  );
}

// Khối công thức, nền nhạt và chữ đều nét để đọc như một dòng tính.
function FormulaBox({ lines }: { lines: string[] }) {
  return (
    <View style={styles.formulaBox}>
      {lines.map((line) => (
        <AppText key={line} style={styles.formulaText}>{line}</AppText>
      ))}
    </View>
  );
}

// Một gạch đầu dòng có chấm tròn.
function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <AppText variant="body2" style={styles.bulletText}>{text}</AppText>
    </View>
  );
}

export default function HelpScreen() {
  const t = useT();
  const L = t.help;
  const [tab, setTab] = useState<TabKey>("intro");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "intro", label: L.tabIntro },
    { key: "bmi", label: L.tabBmi },
    { key: "bmr", label: L.tabBmr },
    { key: "tdee", label: L.tabTdee },
    { key: "goal", label: L.tabGoal },
  ];

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={L.title} />
      </View>

      {/* Thanh tab cuộn ngang, vì năm nhãn không đủ chỗ trên máy màn nhỏ. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        style={styles.tabBarWrap}
      >
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.dim]}
            >
              <AppText numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "intro" && (
          <>
            <Card style={styles.card}>
              <AppText variant="h2">{L.aboutTitle}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.aboutText}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.problemText}</AppText>
            </Card>

            <SectionLabel>{L.featuresTitle}</SectionLabel>
            <Card style={styles.featureCard}>
              <FeatureRow icon="restaurant-outline" title={L.featLogTitle} text={L.featLogText} />
              <FeatureRow icon="camera-outline" title={L.featScanTitle} text={L.featScanText} />
              <FeatureRow icon="sparkles-outline" title={L.featCoachTitle} text={L.featCoachText} />
              <FeatureRow icon="calendar-outline" title={L.featPlanTitle} text={L.featPlanText} />
              <FeatureRow icon="barbell-outline" title={L.featActivityTitle} text={L.featActivityText} />
              <FeatureRow icon="trending-up-outline" title={L.featProgressTitle} text={L.featProgressText} />
            </Card>

            <SectionLabel>{L.notesTitle}</SectionLabel>
            <Card style={styles.card}>
              <Bullet text={L.noteEstimate} />
              <Bullet text={L.noteMedical} />
              <Bullet text={L.noteNumbers} />
              <Bullet text={L.noteSources} />
            </Card>
          </>
        )}

        {tab === "bmi" && (
          <>
            <Card style={styles.card}>
              <AppText variant="h2">{L.bmiName}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.bmiWhat}</AppText>
            </Card>

            <SectionLabel>{L.formulaTitle}</SectionLabel>
            <Card style={styles.card}>
              <FormulaBox lines={[L.bmiFormula]} />
              <AppText variant="subtle" style={styles.exampleWho}>{L.bmiExampleWho}</AppText>
              <FormulaBox lines={[L.bmiExample]} />
            </Card>

            <SectionLabel>{L.bmiRangesTitle}</SectionLabel>
            <Card style={styles.card}>
              <Bullet text={L.bmiUnder} />
              <Bullet text={L.bmiNormal} />
              <Bullet text={L.bmiOver} />
              <Bullet text={L.bmiObese} />
              <AppText variant="subtle" style={styles.noteText}>{L.bmiGender}</AppText>
            </Card>

            <SectionLabel>{L.limitTitle}</SectionLabel>
            <Card style={styles.card}>
              <AppText variant="body2" style={styles.paragraph}>{L.bmiLimit}</AppText>
              <AppText variant="subtle" style={styles.sourceText}>{L.sourceTitle}: {L.bmiSource}</AppText>
            </Card>
          </>
        )}

        {tab === "bmr" && (
          <>
            <Card style={styles.card}>
              <AppText variant="h2">{L.bmrName}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.bmrWhat}</AppText>
            </Card>

            <SectionLabel>{L.formulaTitle}</SectionLabel>
            <Card style={styles.card}>
              <FormulaBox lines={[L.bmrFormulaMale, L.bmrFormulaFemale]} />
              <AppText variant="body2" style={styles.paragraph}>{L.bmrGender}</AppText>
              <AppText variant="subtle" style={styles.exampleWho}>{L.bmrExampleWho}</AppText>
              <FormulaBox lines={[L.bmrExample]} />
            </Card>

            <SectionLabel>{L.limitTitle}</SectionLabel>
            <Card style={styles.card}>
              <AppText variant="body2" style={styles.paragraph}>{L.bmrLimit}</AppText>
              <AppText variant="subtle" style={styles.sourceText}>{L.sourceTitle}: {L.bmrSource}</AppText>
            </Card>
          </>
        )}

        {tab === "tdee" && (
          <>
            <Card style={styles.card}>
              <AppText variant="h2">{L.tdeeName}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.tdeeWhat}</AppText>
            </Card>

            <SectionLabel>{L.formulaTitle}</SectionLabel>
            <Card style={styles.card}>
              <FormulaBox lines={[L.tdeeFormula]} />
              <AppText variant="subtle" style={styles.exampleWho}>{L.tdeeExampleWho}</AppText>
              <FormulaBox lines={[L.tdeeExample]} />
            </Card>

            <SectionLabel>{L.tdeeLevelsTitle}</SectionLabel>
            <Card style={styles.card}>
              <Bullet text={L.tdeeSedentary} />
              <Bullet text={L.tdeeModerate} />
              <Bullet text={L.tdeeActive} />
              <AppText variant="subtle" style={styles.noteText}>{L.tdeeNote}</AppText>
              <AppText variant="subtle" style={styles.sourceText}>{L.sourceTitle}: {L.tdeeSource}</AppText>
            </Card>
          </>
        )}

        {tab === "goal" && (
          <>
            <Card style={styles.card}>
              <AppText variant="h2">{L.goalName}</AppText>
              <AppText variant="body2" style={styles.paragraph}>{L.goalWhat}</AppText>
            </Card>

            <SectionLabel>{L.formulaTitle}</SectionLabel>
            <Card style={styles.card}>
              <FormulaBox lines={[L.goalFormulaLose, L.goalFormulaGain, L.goalFormulaRate]} />
              <AppText variant="subtle" style={styles.exampleWho}>{L.goalExampleWho}</AppText>
              <FormulaBox lines={[L.goalExample]} />
            </Card>

            <SectionLabel>{L.goalLimitsTitle}</SectionLabel>
            <Card style={styles.card}>
              <Bullet text={L.goalCap} />
              <Bullet text={L.goalFloor} />
              <AppText variant="subtle" style={styles.noteText}>{L.goalFloorNote}</AppText>
              <AppText variant="subtle" style={styles.sourceText}>{L.sourceTitle}: {L.goalSource}</AppText>
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.6 },
  // Các màn khác dùng paddingTop 60 để tiêu đề không đụng thanh trạng thái.
  headerWrap: { paddingHorizontal: theme.space.lg, paddingTop: 60 },

  // Cao cố định để chữ có dấu như "Giới thiệu" không bị cắt khi font đo hụt.
  tabBarWrap: { flexGrow: 0, height: 60 },
  tabBar: { paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm, gap: theme.space.sm, alignItems: "center" },
  tab: {
    height: 40, justifyContent: "center",
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabText: { fontSize: 13, lineHeight: 22, includeFontPadding: false, textAlignVertical: "center", fontWeight: "700", color: theme.colors.primary },
  tabTextActive: { color: "#fff" },

  content: { padding: theme.space.lg, paddingTop: theme.space.sm, paddingBottom: theme.space.xxl, gap: theme.space.md },
  card: { padding: theme.space.lg, gap: theme.space.sm },
  paragraph: { color: theme.colors.muted, lineHeight: 21 },

  featureCard: { padding: theme.space.lg, gap: theme.space.lg },
  featureRow: { flexDirection: "row", gap: theme.space.md, alignItems: "flex-start" },
  featureIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  featureBody: { flex: 1, gap: 2 },
  featureTitle: { fontWeight: "700" },
  featureText: { lineHeight: 19 },

  formulaBox: {
    backgroundColor: theme.colors.tintSoft,
    borderRadius: theme.radius.input,
    padding: theme.space.md,
    gap: 4,
  },
  formulaText: { fontSize: 13, lineHeight: 20, color: theme.colors.text },
  exampleWho: { marginTop: 2 },

  bulletRow: { flexDirection: "row", gap: theme.space.sm, alignItems: "flex-start" },
  bulletDot: {
    width: 6, height: 6, borderRadius: 3, marginTop: 8,
    backgroundColor: theme.colors.primary,
  },
  bulletText: { flex: 1, color: theme.colors.muted, lineHeight: 21 },

  noteText: { lineHeight: 19, marginTop: 2 },
  sourceText: { fontSize: 11, lineHeight: 17, marginTop: 2 },

});
