import { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { initials } from "@/utils/name";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { SectionLabel } from "@/ui/components/SectionLabel";

// Settings-style row: tinted icon square + label + value on the right.
// Ionicons (not emoji) so the rows match the app's icon language.
function SettingRow({ icon, label, value, last }: {
  icon: string; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={16} color={theme.colors.primary} />
      </View>
      <AppText variant="body2" style={styles.rowLabel}>{label}</AppText>
      <AppText variant="body2" style={styles.rowValue}>{value}</AppText>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, stats, logout, fetchProfile, uploadAvatar } = useAuth();
  const t = useT();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Refresh on focus so changes made in the Edit screen show up on return
  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  // Tap on avatar → open image picker → upload to Cloudinary via backend
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.profile.avatarPermMsg);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert(t.profile.uploadFailed, e.message || t.profile.uploadFailedMsg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t.profile.logout, t.profile.logoutMsg, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.profile.logout,
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const displayName = user?.name ?? "MealMate User";
  const badge = initials(displayName);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <AppText variant="h1">{t.profile.title}</AppText>
          <AppText variant="muted">{t.profile.subtitle}</AppText>
        </View>

        {/* User card — avatar (tap to change) + name + edit button */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <Pressable onPress={handlePickAvatar} disabled={isUploadingAvatar}>
              <View style={[styles.avatar, isUploadingAvatar && styles.avatarUploading]}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <AppText variant="h2" style={styles.avatarBadge}>{badge}</AppText>
                )}
              </View>
              <View style={styles.avatarCam}>
                <AppText style={styles.avatarCamText}>📷</AppText>
              </View>
            </Pressable>
            <View style={styles.userInfo}>
              <AppText variant="h2">{displayName}</AppText>
              <AppText variant="muted" style={styles.userEmail}>{user?.email}</AppText>
              {isUploadingAvatar && <AppText variant="muted" style={styles.uploadingText}>{t.profile.uploading}</AppText>}
            </View>
            <Pressable
              onPress={() => router.push("/profile/edit" as any)}
              style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
            >
              <Ionicons name="pencil" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        </Card>

        {/* Health stats strip */}
        {stats && (
          <View style={styles.statsStrip}>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{stats.bmi ?? "—"}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.bmi}</AppText>
              {stats.bmiCategory && <AppText variant="subtle" style={styles.statSub}>{stats.bmiCategory}</AppText>}
            </Card>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{stats.tdee ?? "—"}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.tdee}</AppText>
            </Card>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{user?.calorieGoal ?? 2000}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.goalKcal}</AppText>
            </Card>
          </View>
        )}

        {/* Health details */}
        <SectionLabel>{t.profile.healthDetails}</SectionLabel>
        <Card style={styles.detailCard}>
          <SettingRow icon="person" label={t.profile.gender} value={user?.gender ?? "—"} />
          <SettingRow icon="calendar" label={t.profile.age} value={user?.age ? t.profile.ageValue(user.age) : "—"} />
          <SettingRow icon="scale" label={t.profile.weight} value={user?.weight ? t.profile.weightValue(user.weight) : "—"} />
          <SettingRow icon="resize" label={t.profile.height} value={user?.height ? t.profile.heightValue(user.height) : "—"} />
          <SettingRow icon="flag" label={t.profile.goal} value={t.labels.goal[user?.goal ?? ""] ?? "—"} />
          <SettingRow icon="walk" label={t.profile.activity} value={t.labels.activity[user?.activityLevel ?? ""] ?? "—"} />
          <SettingRow icon="heart" label={t.profile.conditions} value={user?.conditions?.length ? user.conditions.map((c) => t.labels.condition[c] ?? c).join(", ") : t.profile.none} />
          <SettingRow icon="restaurant" label={t.profile.taste} value={user?.tastePreferences?.trim() ? user.tastePreferences : "—"} last />
        </Card>

        {/* Account */}
        <SectionLabel>{t.profile.account}</SectionLabel>
        <Card style={styles.detailCard}>
          {/* Settings entry — app preferences live in their own screen */}
          <Pressable
            onPress={() => router.push("/profile/settings" as any)}
            style={({ pressed }) => [styles.accountRow, styles.accountRowDivider, pressed && styles.dim]}
          >
            <View style={styles.accountIcon}>
              <Ionicons name="settings-outline" size={17} color={theme.colors.primary} />
            </View>
            <AppText variant="body2" style={styles.accountLabel}>{t.profile.settings}</AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.accountRow, pressed && styles.dim]}>
            <View style={styles.accountIconDanger}>
              <Ionicons name="log-out-outline" size={17} color={theme.colors.danger} />
            </View>
            <AppText variant="body2" style={styles.accountLabelDanger}>{t.profile.logout}</AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        <AppText variant="subtle" style={styles.version}>MealMate · v1.0.0</AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // paddingTop 60 = safe-area top (no tab header above anymore)
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  titleBlock: { gap: 4 },

  // Setting/detail row
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, color: theme.colors.muted },
  rowValue: { fontWeight: "700", textTransform: "capitalize" },

  // User card
  userCard: { padding: theme.space.xl },
  userRow: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  avatar: { width: 68, height: 68, borderRadius: 24, backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarUploading: { opacity: 0.5 },
  avatarImg: { width: "100%", height: "100%" },
  avatarBadge: { color: theme.colors.primary },
  avatarCam: {
    position: "absolute", bottom: -2, right: -2, backgroundColor: theme.colors.primary,
    width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: theme.colors.surface,
  },
  avatarCamText: { fontSize: 11, color: "#fff" },
  userInfo: { flex: 1, gap: 4 },
  userEmail: { fontSize: 13 },
  uploadingText: { fontSize: 11 },
  editBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center" },
  editBtnPressed: { backgroundColor: "rgba(8,145,178,0.18)" },

  // Stats strip
  statsStrip: { flexDirection: "row", gap: theme.space.md },
  statCard: { flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 },
  statValue: { fontSize: 24, color: theme.colors.primary },
  statLabel: { fontSize: 12 },
  statSub: { fontSize: 11 },

  detailCard: { paddingVertical: 4, paddingHorizontal: theme.space.lg },

  // Account rows
  accountRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  accountRowDivider: { borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  accountIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },
  accountIconDanger: { width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(229,72,77,0.10)", alignItems: "center", justifyContent: "center" },
  accountLabel: { flex: 1, fontWeight: "600" },
  accountLabelDanger: { flex: 1, fontWeight: "700", color: theme.colors.danger },
  dim: { opacity: 0.6 },

  version: { textAlign: "center", fontSize: 11, marginTop: 4 },
});
