import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/utils/api";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

// Đổi mật khẩu khi đang đăng nhập cần xác minh bằng mật khẩu hiện tại.
// Luồng OTP quên mật khẩu dành cho trường hợp không thể đăng nhập.
// Màn riêng tạo đủ chỗ cho ba ô mật khẩu.
export default function ChangePasswordScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (next.length < 6) return Alert.alert(t.common.errorTitle, t.auth.passwordTooShort);
    if (!/[A-Z]/.test(next)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedUpper);
    if (!/[0-9]/.test(next)) return Alert.alert(t.common.errorTitle, t.auth.passwordNeedNumber);
    if (next !== confirm) return Alert.alert(t.common.errorTitle, t.auth.passwordsNoMatch);
    setSaving(true);
    try {
      await apiRequest("/user/change-password", "POST", { currentPassword: current, newPassword: next }, token ?? undefined);
      Alert.alert(t.auth.resetSuccessTitle, t.settings.passwordChanged, [
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t.common.errorTitle, e.message || t.settings.changePasswordFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <View style={styles.content}>
        <ScreenHeader title={t.settings.changePassword} />

        <Card style={styles.card}>
          <AppText variant="subtle" style={styles.hint}>{t.settings.changePasswordSub}</AppText>
          <TextField
            label={t.settings.currentPassword}
            placeholder="••••••••"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            textContentType="password"
          />
          <TextField
            label={t.auth.newPassword}
            placeholder="••••••••"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            textContentType="newPassword"
          />
          <TextField
            label={t.auth.confirmPassword}
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="newPassword"
          />
          <Button
            title={saving ? t.common.saving : t.settings.changePassword}
            onPress={handleSubmit}
            disabled={saving || !current || !next || !confirm}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },
  card: { padding: theme.space.lg, gap: theme.space.md },
  hint: { fontSize: 12 },
});
