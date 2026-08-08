// ═══ FILE NÀY LÀM GÌ ═══
// Màn Cài đặt. File BẮT ĐẦU của nhiều luồng nhỏ, gồm cả xóa tài khoản.
//
// Ai gọi tới: ProfileScreen
// Nhận vào:   lựa chọn ngôn ngữ, quyền riêng tư, và các lệnh về tài khoản
// Trả ra:     không trả gì, mỗi lựa chọn tự lưu ngay
// Khi lỗi:    xóa tài khoản phải nhập mật khẩu và xác nhận, vì việc này KHÔNG lùi được

// Bốn nhóm cài đặt, mỗi nhóm một khối riêng trong thân file:
//   Mục tiêu cân nặng, chỉ là lối vào một màn riêng, không xử lý gì ở đây.
//   Ngôn ngữ, xem khối ĐỔI NGÔN NGỮ.
//   Tài khoản riêng tư, bật lên thì bài đăng bị ẩn khỏi Cộng đồng.
//   Xóa tài khoản, xem khối XÓA TÀI KHOẢN.
//
// Nhớ: mỗi lựa chọn TỰ LƯU ngay khi bấm, màn này không có nút Lưu chung.
import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { enabledCount, loadReminders } from "@/utils/notifications/reminderSettings";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { SectionLabel } from "@/ui/components/SectionLabel";
import { TextField } from "@/ui/components/TextField";
import { resolveLanguage, type Lang } from "@/utils/languageUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { resolveDraftWeightDirection, WEIGHT_GOAL_BY_DIRECTION } from "@/config/nutritionCalculations";
import { INPUT_LIMITS } from "@/config/inputLimits";

// Ô biểu tượng dùng chung giúp các hàng cài đặt có cùng cách trình bày.
function IconBox({ icon, bg, color }: { icon: string; bg?: string; color?: string }) {
  return (
    <View style={[styles.iconBox, bg ? { backgroundColor: bg } : null]}>
      <Ionicons name={icon as any} size={17} color={color ?? theme.colors.primary} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════
// MỞ CÀI ĐẶT
//
// Đến từ màn Hồ sơ. Hai bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì hiện bốn nhóm cài đặt, mỗi nhóm tự lo phần của mình.
// ══════════════════════════════════════════════════════════

// MỞ CÀI ĐẶT BƯỚC 1. Lấy hồ sơ từ AuthContext, KHÔNG gọi mạng lấy lại.
export default function SettingsScreen() {
  const { user, stats, updateProfile, deleteAccount } = useAuth();
  const router = useRouter();
  const t = useT();

  // Trạng thái của các hộp thoại và thao tác trong màn cài đặt.
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivate);
  const [savingLang, setSavingLang] = useState(false);

  // MỞ CÀI ĐẶT BƯỚC 2. Đếm lại số lời nhắc đang bật, đọc từ bộ nhớ máy chứ không gọi mạng.
  // Dùng useFocusEffect vì lời nhắc được chỉnh ở màn riêng, quay về đây phải đếm lại
  // thì con số bên cạnh hàng Nhắc nhở mới đúng.
  useFocusEffect(useCallback(() => {
    void loadReminders().then((r) => setReminderCount(enabledCount(r))).catch(() => {});
  }, []));

  // Gạt công tắc tài khoản riêng tư.
  // Gạt trên màn NGAY cho bấm là thấy nhúc nhích, rồi mới gửi lên.
  // Đường đi: AuthContext.updateProfile → authApi → apiClient → PUT /profile
  //           → profileController.updateProfile
  // Gửi hụt thì GẠT NGƯỢC LẠI, kẻo màn hiện riêng tư mà server vẫn để công khai.
  const togglePrivate = async (value: boolean) => {
    setIsPrivate(value);
    try {
      await updateProfile({ isPrivate: value });
    } catch (error) {
      // Trả lại trạng thái cũ nếu cập nhật quyền riêng tư thất bại.
      setIsPrivate(!value);
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.settings.failedPrivacy));
    }
  };

  // Chưa lưu lựa chọn nào thì lấy ngôn ngữ mặc định của máy.
  const currentLang = resolveLanguage(user?.language);

  // Hướng cân nặng để hiện bên cạnh hàng Mục tiêu. Suy từ cân hiện tại với cân đích,
  // không đọc thẳng user.goal, vì hai số kia mới là thứ người dùng vừa đặt.
  // Suy không ra thì mới lùi về giá trị backend đưa.
  const displayedDirection = resolveDraftWeightDirection(
    user?.weight ?? null,
    user?.targetWeight ?? null,
    stats?.maintainWeightThresholdKg,
  ) ?? stats?.weightDirection;
  const displayedGoal = displayedDirection ? WEIGHT_GOAL_BY_DIRECTION[displayedDirection] : user?.goal;
  // ══════════════════════════════════════════════════════════
  // ĐỔI NGÔN NGỮ
  //
  // Đến từ hai nút Tiếng Việt và English. Hai bước, một chặng chờ mạng.
  // Xong thì Coach tải lại lịch sử của ngôn ngữ mới, và các lời nhắc
  // sẽ được đặt lại bằng ngôn ngữ đó khi người dùng đụng vào công tắc.
  // ══════════════════════════════════════════════════════════

  // ĐỔI NGÔN NGỮ BƯỚC 1. Bấm đúng ngôn ngữ đang dùng thì thoát luôn, khỏi gửi hụt một lượt.
  const handleSetLanguage = async (l: Lang) => {
    if (l === user?.language) return;
    setSavingLang(true);
    try {
      // ĐỔI NGÔN NGỮ BƯỚC 2. Lưu LÊN SERVER chứ không chỉ lưu ở máy.
      // Đường đi: AuthContext.updateProfile → authApi → apiClient → PUT /profile
      //           → profileController.updateProfile
      // Phải lên server vì coachController.chat đọc trường này để biết trả lời
      // bằng tiếng gì. Chỉ lưu ở máy là Coach vẫn nói tiếng cũ.
      await updateProfile({ language: l });
    } catch (error) {
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.settings.failedLanguage));
    } finally {
      setSavingLang(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // XÓA TÀI KHOẢN
  //
  // Đến từ nút Xóa tài khoản, đặt cuối màn vì đây là việc KHÔNG lùi lại được.
  // Ba bước, đọc từ trên xuống là đúng thứ tự. Một chặng chờ mạng ở BƯỚC 2.
  // Xong thì app tự đăng xuất và quay về màn Đăng nhập.
  // ══════════════════════════════════════════════════════════

  // XÓA TÀI KHOẢN BƯỚC 1. Bắt nhập mật khẩu, không cho xóa bằng một cú bấm.
  // Cờ deleting chặn bấm hai lần liên tiếp.
  const handleDeleteAccount = async () => {
    if (!deletePw || deleting) return;
    setDeleting(true);
    try {
      // XÓA TÀI KHOẢN BƯỚC 2. Gửi đi rồi ĐỨNG ĐÂY CHỜ, đây là chặng lâu nhất.
      // Đường đi: AuthContext.deleteAccount → authApi → apiClient
      //           → DELETE /user/account → accountController.deleteAccount
      // Bên đó so mật khẩu trước, rồi xóa ảnh trên Cloudinary, xóa dữ liệu ở mọi bảng,
      // cuối cùng mới xóa tài khoản. Sai mật khẩu thì ném lỗi và KHÔNG xóa gì cả.
      await deleteAccount(deletePw);
      // XÓA TÀI KHOẢN BƯỚC 3. Đóng hộp rồi về màn Đăng nhập.
      // AuthContext đã tự đăng xuất ngay sau khi backend xóa xong.
      setDeleteVisible(false);
      router.replace("/auth/login");
    } catch (error) {
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.settings.deleteFailed));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t.settings.title} />

        {/* Nhóm Mục tiêu. Chỉ là lối vào màn Mục tiêu cân nặng, không xử lý gì ở đây. */}
        <SectionLabel>{t.settings.goals}</SectionLabel>
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push("/profile/goals")}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="flag" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.weightGoals.title}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.labels.goal[displayedGoal ?? ""] ?? "-"}</AppText>
            </View>
            <AppText variant="body2" style={styles.rowValue}>
              {user?.calorieGoal != null ? `${user.calorieGoal.toLocaleString()} ${t.common.kcal}` : "-"}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* Nhóm Theo dõi. Lối vào màn Tiến trình và màn Nhắc nhở. */}
        <SectionLabel>{t.settings.insights}</SectionLabel>
        <Card style={styles.card}>
          <Pressable onPress={() => router.push("/profile/progress")} style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}>
            <IconBox icon="stats-chart" bg="rgba(5,150,105,0.12)" color={theme.colors.accent} />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.progressStats}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.progressSub}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        <SectionLabel>{t.settings.reminders}</SectionLabel>
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push("/profile/reminders")}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="alarm" bg="rgba(255,138,61,0.12)" color={theme.colors.accent2} />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.mealReminder}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>
                {reminderCount > 0 ? t.settings.mealReminderCount(reminderCount) : t.settings.mealReminderNone}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* Nhóm Bảo mật. Lối vào màn Đổi mật khẩu. */}
        <SectionLabel>{t.settings.security}</SectionLabel>
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push("/profile/change-password")}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="key" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.changePassword}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* Nhóm Ngôn ngữ. Bấm là lưu ngay, xem khối ĐỔI NGÔN NGỮ ở trên. */}
        <SectionLabel>{t.settings.language}</SectionLabel>
        <Card style={styles.langCard}>
          <View style={styles.langHead}>
            <IconBox icon="globe-outline" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.appLanguage}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.appLanguageSub}</AppText>
            </View>
          </View>
          <View style={styles.langBtns}>
            {([["en", "English"], ["vi", "Tiếng Việt"]] as ["en" | "vi", string][]).map(([key, label]) => {
              const active = currentLang === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleSetLanguage(key)}
                  disabled={savingLang}
                  style={({ pressed }) => [styles.langBtn, active ? styles.langBtnActive : styles.langBtnIdle, pressed && styles.dim]}
                >
                  <AppText style={[styles.langBtnText, active && styles.langBtnTextActive]}>{label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Nhóm Riêng tư. Công tắc gạt là lưu ngay, không có nút Lưu. */}
        <SectionLabel>{t.settings.privacy}</SectionLabel>
        <Card style={styles.card}>
          <View style={styles.rowStatic}>
            <IconBox icon="lock-closed" />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.rowTitle}>{t.settings.privateProfile}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.privateProfileSub}</AppText>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={togglePrivate}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <SectionLabel>{t.settings.dataSection}</SectionLabel>
        <Card style={styles.card}>
          <AppText variant="subtle" style={styles.dataNotice}>{t.settings.dataNotice}</AppText>
          <Pressable
            onPress={() => { setDeletePw(""); setDeleteVisible(true); }}
            style={({ pressed }) => [styles.rowTappable, pressed && styles.dim]}
          >
            <IconBox icon="trash" bg="rgba(229,72,77,0.10)" color={theme.colors.danger} />
            <View style={styles.rowText}>
              <AppText variant="body2" style={styles.deleteTitle}>{t.settings.deleteAccount}</AppText>
              <AppText variant="subtle" style={styles.rowSub}>{t.settings.deleteAccountSub}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        {/* Nhóm Giới thiệu, và nút Xóa tài khoản đặt cuối cùng vì không lùi lại được. */}
        <AppText variant="subtle" style={styles.version}>MealMate · v1.0.0</AppText>
      </ScrollView>

      <Modal transparent visible={deleteVisible} animationType="fade" onRequestClose={() => !deleting && setDeleteVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => !deleting && setDeleteVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Card style={styles.timeCard}>
              <View style={styles.timeHead}>
                <AppText variant="h2" style={styles.deleteTitle}>{t.settings.deleteConfirmTitle}</AppText>
                <AppText variant="muted" style={styles.rowSub}>{t.settings.deleteConfirmMsg}</AppText>
              </View>
              <TextField
                label={t.settings.currentPassword}
                placeholder="••••••••"
                value={deletePw}
                onChangeText={setDeletePw}
                secureTextEntry
                textContentType="password"
                maxLength={INPUT_LIMITS.PASSWORD}
              />
              <View style={styles.timeActions}>
                <View style={styles.flex1}>
                  <Button title={t.common.cancel} variant="secondary" onPress={() => setDeleteVisible(false)} disabled={deleting} />
                </View>
                <View style={styles.flex1}>
                  <Pressable
                    onPress={handleDeleteAccount}
                    disabled={!deletePw || deleting}
                    style={({ pressed }) => [styles.deleteBtn, (!deletePw || deleting) && styles.deleteBtnDisabled, pressed && styles.dim]}
                  >
                    <AppText style={styles.deleteBtnText}>{deleting ? t.settings.deleting : t.settings.deleteForever}</AppText>
                  </Pressable>
                </View>
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  card: { paddingVertical: 4, paddingHorizontal: theme.space.lg },

  iconBox: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.colors.tintSoft, alignItems: "center", justifyContent: "center" },

  rowTappable: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowStatic: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: "600" },
  rowSub: { fontSize: 11 },
  rowValue: { fontWeight: "700", color: theme.colors.primary },
  dim: { opacity: 0.6 },

  flex1: { flex: 1 },

  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", paddingHorizontal: theme.space.xl,
  },
  timeCard: { padding: theme.space.xl, gap: theme.space.lg },
  timeHead: { gap: 4 },
  timeActions: { flexDirection: "row", gap: theme.space.md },

  langCard: { padding: theme.space.lg, gap: 12 },
  langHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  langBtns: { flexDirection: "row", gap: 8 },
  langBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  langBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  langBtnIdle: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  langBtnText: { fontWeight: "700", color: theme.colors.subtle },
  langBtnTextActive: { color: theme.colors.primary },

  version: { textAlign: "center", fontSize: 11, marginTop: 4 },

  dataNotice: { fontSize: 12, lineHeight: 18, paddingTop: theme.space.md },
  deleteTitle: { fontWeight: "600", color: theme.colors.danger },
  deleteBtn: {
    height: 48, borderRadius: theme.radius.button,
    backgroundColor: theme.colors.danger,
    alignItems: "center", justifyContent: "center",
  },
  deleteBtnDisabled: { backgroundColor: theme.colors.border },
  deleteBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
