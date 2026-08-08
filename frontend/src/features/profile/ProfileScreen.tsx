// ═══ FILE NÀY LÀM GÌ ═══
// Màn Hồ sơ, tab thứ tư. Cửa ngõ dẫn sang nhiều màn khác.
//
// Ai gọi tới: app/tabs/profile
// Nhận vào:   hồ sơ người dùng và vài số liệu tóm tắt
// Trả ra:     thẻ thông tin cá nhân và danh sách lối vào các màn con
// Khi lỗi:    tải hồ sơ hỏng thì hiện lời nhắc, các lối vào vẫn bấm được
//
// Các lối đi từ màn này: Sửa hồ sơ, Cài đặt, Tiến trình, Nhắc nhở,
// Đổi mật khẩu, và nút Đăng xuất.
import { useCallback, useState } from "react";
import { Alert, Image, InteractionManager, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { initials } from "@/utils/nameUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { resolveDraftWeightDirection, WEIGHT_GOAL_BY_DIRECTION } from "@/config/nutritionCalculations";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { SectionLabel } from "@/ui/components/SectionLabel";

// Một dòng trong danh sách: icon, nhãn, giá trị, và mũi tên nếu bấm được.
// Có onPress thì bọc Pressable, không có thì chỉ là một dòng chữ.
// Nhờ vậy dòng chỉ để xem và dòng bấm được nhìn giống hệt nhau, chỉ khác cái mũi tên.
function SettingRow({ icon, label, value, last, onPress }: {
  icon: string; label: string; value: string; last?: boolean; onPress?: () => void;
}) {
  // Dựng phần ruột ra biến trước, vì hai nhánh bên dưới đều dùng chung y hệt.
  const content = (
    <>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={16} color={theme.colors.primary} />
      </View>
      <AppText variant="body2" style={styles.rowLabel}>{label}</AppText>
      <AppText variant="body2" style={styles.rowValue}>{value}</AppText>
      {onPress && <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && styles.dim]}>
      {content}
    </Pressable>
  ) : (
    <View style={[styles.row, last && styles.rowLast]}>{content}</View>
  );
}

// ══════════════════════════════════════════════════════════
// MỞ HỒ SƠ
//
// Đến từ tab thứ tư. Hai bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì màn hiện tên, ảnh đại diện, và ba chỉ số tóm tắt.
// ══════════════════════════════════════════════════════════

// MỞ HỒ SƠ BƯỚC 1. Lấy hồ sơ với số liệu tóm tắt từ AuthContext.
export default function ProfileScreen() {
  const router = useRouter();
  const { user, stats, logout, fetchProfile, uploadAvatar } = useAuth();
  const t = useT();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // MỞ HỒ SƠ BƯỚC 2. Tự tải lại mỗi lần quay về tab này, không ai bấm.
  // Đường đi: AuthContext.fetchProfile → authApi → apiClient → GET /profile
  //           → profileController.getProfile → buildStats
  // Bên đó tính BMI với TDEE rồi trả về, nên hai số đó luôn khớp số đo mới nhất
  // chứ không phải bản cũ lưu trong máy.
  // Nuốt lỗi vì hồ sơ cũ trong AuthContext vẫn dùng được, và các lối vào bên dưới
  // đâu cần hồ sơ mới mà vẫn bấm được.
  useFocusEffect(useCallback(() => { void fetchProfile().catch(() => {}); }, [fetchProfile]));

  // ══════════════════════════════════════════════════════════
  // ĐỔI ẢNH ĐẠI DIỆN
  //
  // Đến từ việc chạm vào ảnh đại diện. Bốn bước, đọc từ trên xuống
  // là đúng thứ tự. Một chặng chờ mạng ở BƯỚC 4.
  // Xong thì ảnh đổi ngay trên màn, vì AuthContext đã cập nhật hồ sơ.
  // ══════════════════════════════════════════════════════════

  // ĐỔI ẢNH BƯỚC 1. Xin quyền đọc thư viện ảnh trước.
  // Chưa cho quyền thì dừng hẳn, không mở được thư viện.
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.profile.avatarPermMsg);
      return;
    }
    // ĐỔI ẢNH BƯỚC 2. Mở thư viện, cho cắt ảnh vuông ngay tại đó.
    // aspect [1,1] ép khung vuông vì avatar là hình tròn, ảnh chữ nhật sẽ bị cắt xấu.
    // quality 0.8 nén bớt cho nhẹ, đỡ bị imageUpload ở backend từ chối vì quá nặng.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    // ĐỔI ẢNH BƯỚC 3. Người dùng bấm hủy giữa chừng thì thoát êm, không báo lỗi gì.
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setIsUploadingAvatar(true);
    try {
      // ĐỔI ẢNH BƯỚC 4. Gửi ảnh lên rồi ĐỨNG ĐÂY CHỜ. Chặng này lâu vì phải tải file.
      // Đường đi: AuthContext.uploadAvatar → authApi → apiClient → POST /user/avatar
      //           → imageUpload → accountController.uploadAvatar → Cloudinary
      // Bên đó đẩy ảnh lên Cloudinary, cắt vuông, xóa ảnh cũ, rồi trả về đường dẫn.
      // App chỉ giữ ĐƯỜNG DẪN, không giữ file ảnh trong máy.
      await uploadAvatar(result.assets[0].uri);
    } catch (error) {
      Alert.alert(t.profile.uploadFailed, getUserErrorMessage(error, t, t.profile.uploadFailedMsg));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // ĐĂNG XUẤT
  //
  // Đến từ nút Đăng xuất ở cuối màn. Ba bước, và THỨ TỰ ở đây là quan trọng.
  // Xong thì app về màn Đăng nhập, phiên với lời nhắc đã bị dọn sạch.
  // ══════════════════════════════════════════════════════════

  // ĐĂNG XUẤT BƯỚC 1. Hỏi lại cho chắc.
  const handleLogout = () => {
    Alert.alert(t.profile.logout, t.profile.logoutMsg, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.profile.logout,
        style: "destructive",
        onPress: () => {
          // ĐĂNG XUẤT BƯỚC 2. Chuyển màn TRƯỚC, dọn phiên sau.
          router.replace("/auth/login");
          // ĐĂNG XUẤT BƯỚC 3. Chờ hiệu ứng chuyển màn xong rồi mới dọn phiên.
          // Dọn sớm là mấy màn đang mở render lại lúc chưa kịp thoát, nhìn giật một cái.
          // logout xóa phiên, hủy mọi lời nhắc, và dọn dữ liệu tạm của tài khoản.
          InteractionManager.runAfterInteractions(() => {
            void logout().catch((error) => console.error("Could not clear auth session:", error));
          });
        },
      },
    ]);
  };

  const displayName = user?.name ?? t.profile.fallbackName;
  const badge = initials(displayName);
  const displayedDirection = resolveDraftWeightDirection(
    user?.weight ?? null,
    user?.targetWeight ?? null,
    stats?.maintainWeightThresholdKg,
  ) ?? stats?.weightDirection;
  const displayedGoal = displayedDirection ? WEIGHT_GOAL_BY_DIRECTION[displayedDirection] : user?.goal;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <AppText variant="h1">{t.profile.title}</AppText>
          <AppText variant="muted">{t.profile.subtitle}</AppText>
        </View>

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
              {/* Dùng cùng bộ icon với cả màn thay vì emoji, để nét vẽ đồng bộ. */}
              <View style={styles.avatarCam}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </Pressable>
            <View style={styles.userInfo}>
              <AppText variant="h2">{displayName}</AppText>
              <AppText variant="muted" style={styles.userEmail}>{user?.email}</AppText>
              {isUploadingAvatar && <AppText variant="muted" style={styles.uploadingText}>{t.profile.uploading}</AppText>}
            </View>
            <Pressable
              onPress={() => router.push("/profile/edit")}
              style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
            >
              <Ionicons name="pencil" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        </Card>

        {/* Dải này chỉ chứa SỰ THẬT VỀ CƠ THỂ, tính ra từ số đo của người dùng.
            Mục tiêu calo KHÔNG nằm ở đây: nó là thứ người dùng nhắm tới chứ không
            phải số đo, và ở đây bấm vào nó cũng không làm được gì. Nơi của nó là
            Trang chủ để theo dõi mỗi ngày, và Cài đặt để sửa.

            Ba ô đọc từ trái sang phải chính là mạch tính:
              BMI  cân nặng so với chiều cao,
              BMR  mức đốt khi nằm yên cả ngày,
              TDEE bằng BMR nhân hệ số vận động. */}
        {stats && (
          <View style={styles.statsStrip}>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{stats.bmi ?? "-"}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.bmi}</AppText>
            </Card>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{stats.bmr ?? "-"}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.bmr}</AppText>
            </Card>
            <Card style={styles.statCard}>
              <AppText variant="h0" style={styles.statValue}>{stats.tdee ?? "-"}</AppText>
              <AppText variant="subtle" style={styles.statLabel}>{t.profile.tdee}</AppText>
            </Card>
          </View>
        )}
        {stats?.bmi && user?.age && user.age < 18 ? (
          <AppText variant="subtle" style={styles.bmiYouthNote}>{t.profile.bmiYouthNote}</AppText>
        ) : null}

        {/* Thiếu số đo thì cả ba ô chỉ hiện dấu gạch, không nói vì sao.
            Thay bằng lời mời hoàn thiện hồ sơ kèm lối đi thẳng tới màn sửa. */}
        {stats && stats.bmi == null && stats.bmr == null && stats.tdee == null && (
          <Card style={styles.statsEmpty}>
            <Ionicons name="body-outline" size={22} color={theme.colors.primary} />
            <AppText variant="body2" style={styles.statsEmptyText}>{t.profile.statsEmpty}</AppText>
            <Pressable
              onPress={() => router.push("/profile/edit")}
              style={({ pressed }) => [styles.statsEmptyBtn, pressed && styles.dim]}
            >
              <AppText style={styles.statsEmptyBtnText}>{t.profile.statsEmptyCta}</AppText>
            </Pressable>
          </Card>
        )}

        {/* Health details */}
        <SectionLabel>{t.profile.healthDetails}</SectionLabel>
        <Card style={styles.detailCard}>
          {/* Dùng danh mục ngôn ngữ như mọi hàng khác, nếu không sẽ hiện male hoặc female. */}
          <SettingRow icon="person" label={t.profile.gender} value={t.labels.gender[user?.gender ?? ""] ?? "-"} />
          <SettingRow icon="calendar" label={t.profile.age} value={user?.age ? t.profile.ageValue(user.age) : "-"} />
          <SettingRow icon="scale" label={t.profile.weight} value={user?.weight ? t.profile.weightValue(user.weight) : "-"} />
          <SettingRow icon="resize" label={t.profile.height} value={user?.height ? t.profile.heightValue(user.height) : "-"} />
          <SettingRow
            icon="flag"
            label={t.profile.goal}
            value={t.labels.goal[displayedGoal ?? ""] ?? "-"}
            onPress={() => router.push("/profile/goals")}
          />
          <SettingRow icon="walk" label={t.profile.activity} value={t.labels.activity[user?.activityLevel ?? ""] ?? "-"} />
          <SettingRow icon="heart" label={t.profile.conditions} value={user?.conditions?.length ? user.conditions.map((c) => t.labels.condition[c] ?? c).join(", ") : t.profile.none} />
          <SettingRow icon="restaurant" label={t.profile.taste} value={user?.tastePreferences?.trim() ? user.tastePreferences : "-"} last />
        </Card>

        {/* Account */}
        <SectionLabel>{t.profile.account}</SectionLabel>
        <Card style={styles.detailCard}>
          <Pressable
            onPress={() => router.push("/profile/help")}
            style={({ pressed }) => [styles.accountRow, styles.accountRowDivider, pressed && styles.dim]}
          >
            <View style={styles.accountIcon}>
              <Ionicons name="help-circle-outline" size={17} color={theme.colors.primary} />
            </View>
            <AppText variant="body2" style={styles.accountLabel}>{t.profile.help}</AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile/settings")}
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
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  titleBlock: { gap: 4 },

  // Setting/detail row
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, color: theme.colors.muted },
  rowValue: { fontWeight: "700", textTransform: "capitalize" },

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
  userInfo: { flex: 1, gap: 4 },
  userEmail: { fontSize: 13 },
  uploadingText: { fontSize: 11 },
  editBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center" },
  editBtnPressed: { backgroundColor: "rgba(8,145,178,0.18)" },

  // Dải chỉ số: BMI, BMR, TDEE
  statsStrip: { flexDirection: "row", gap: theme.space.md },
  bmiYouthNote: { textAlign: "center", paddingHorizontal: theme.space.md },
  statsEmpty: { padding: theme.space.lg, alignItems: "center", gap: theme.space.sm },
  statsEmptyText: { textAlign: "center", color: theme.colors.muted },
  statsEmptyBtn: {
    paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.tint,
  },
  statsEmptyBtnText: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  statCard: { flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 },
  statValue: { fontSize: 24, color: theme.colors.primary },
  statLabel: { fontSize: 12 },

  detailCard: { paddingVertical: 4, paddingHorizontal: theme.space.lg },

  // Các hàng trong thẻ Tài khoản
  accountRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  accountRowDivider: { borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  accountIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },
  accountIconDanger: { width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(229,72,77,0.10)", alignItems: "center", justifyContent: "center" },
  accountLabel: { flex: 1, fontWeight: "600" },
  accountLabelDanger: { flex: 1, fontWeight: "700", color: theme.colors.danger },
  dim: { opacity: 0.6 },

  version: { textAlign: "center", fontSize: 11, marginTop: 4 },
});
