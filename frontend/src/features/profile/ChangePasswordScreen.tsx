// ═══ FILE NÀY LÀM GÌ ═══
// Màn Đổi mật khẩu, dùng khi ĐANG đăng nhập.
//
// Ai gọi tới: SettingsScreen
// Nhận vào:   mật khẩu hiện tại và mật khẩu mới
// Trả ra:     không trả gì, đổi xong thì quay lại và nhận thẻ đăng nhập mới
// Khi lỗi:    sai mật khẩu hiện tại thì báo lỗi. Khác màn Quên mật khẩu, ở đây không cần mã email

// Khác hẳn màn Quên mật khẩu, ở đây không cần mã 6 số qua email.
// LUỒNG ĐỔI MẬT KHẨU
// 1. Nhập mật khẩu hiện tại và mật khẩu mới, bấm Lưu
// 2. POST /user/change-password
// 3. Route gọi hàm changePassword trong backend/src/controllers/accountController.js;
//    hàm này so mật khẩu hiện tại,
//    mã hóa và lưu mật khẩu mới
// 4. changePassword tăng tokenVersion để vô hiệu hóa token cũ và trả token mới
// 5. AuthContext lưu token mới, hiện thông báo rồi quay về màn trước
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { apiRequest } from "@/utils/apiClient";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";
import { isStrongPassword } from "@/features/auth/authValidation";
import { INPUT_LIMITS } from "@/config/inputLimits";

// Đổi mật khẩu khi đang đăng nhập cần xác minh bằng mật khẩu hiện tại.
// Luồng OTP quên mật khẩu dành cho trường hợp không thể đăng nhập.
// Màn riêng tạo đủ chỗ cho ba ô mật khẩu.
export default function ChangePasswordScreen() {
  const router = useRouter();
  const { token, replaceSessionToken } = useAuth();
  const t = useT();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Nút Lưu của màn đổi mật khẩu.
  const handleSubmit = async () => {
    if (next.length < 6) return Alert.alert(t.common.errorTitle, t.auth.passwordTooShort);
    if (!/[A-Z]/.test(next)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedUpper);
    if (!/[0-9]/.test(next)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedNumber);
    if (next !== confirm) return Alert.alert(t.common.errorTitle, t.auth.passwordsNoMatch);
    setSaving(true);
    try {
      const result = await apiRequest<{ token: string }>(
        "/user/change-password",
        "POST",
        { currentPassword: current, newPassword: next },
        token ?? undefined
      );
      await replaceSessionToken(result.token);
      Alert.alert(t.auth.resetSuccessTitle, t.settings.passwordChanged, [
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.settings.changePasswordFailed));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <View style={styles.content}>
        <ScreenHeader title={t.settings.changePassword} />

        <Card style={styles.card}>
          <TextField
            label={t.settings.currentPassword}
            placeholder="••••••••"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            textContentType="password"
            maxLength={INPUT_LIMITS.PASSWORD}
          />
          <View style={styles.fieldNote}>
            <TextField
              label={t.auth.newPassword}
              placeholder="••••••••"
              value={next}
              onChangeText={setNext}
              secureTextEntry
              textContentType="newPassword"
              maxLength={INPUT_LIMITS.PASSWORD}
            />
            <AppText variant="subtle" style={styles.hint}>• {t.auth.passwordChecklistLength}</AppText>
            <AppText variant="subtle" style={styles.hint}>• {t.auth.passwordChecklistUpperAndNumber}</AppText>
          </View>
          <TextField
            label={t.auth.confirmPassword}
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="newPassword"
            maxLength={INPUT_LIMITS.PASSWORD}
          />
          <Button
            title={saving ? t.common.saving : t.settings.changePassword}
            onPress={handleSubmit}
            disabled={saving || !current || !isStrongPassword(next) || next !== confirm}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },
  card: { padding: theme.space.lg, gap: theme.space.md },
  fieldNote: { gap: theme.space.xs },
  hint: { fontSize: 12 },
});
