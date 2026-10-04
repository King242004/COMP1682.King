import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/shared/components/Button';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { TextField } from '../../src/shared/components/TextField';
import { colors } from '../../src/shared/theme';

// Mật khẩu ngắn nhất, giống luật ở backend (AuthService.ts)
const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();

  // Nội dung hai ô nhập
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Lỗi dưới từng ô, lỗi từ server, và trạng thái đang gửi
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm hai ô nhập, đúng thì gửi đổi mật khẩu
  async function handleChangePassword() {
    let newCurrentPasswordError = '';
    if (currentPassword === '') {
      newCurrentPasswordError = 'Hãy nhập mật khẩu hiện tại';
    }
    let newNewPasswordError = '';
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      newNewPasswordError = `Mật khẩu mới cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
    }
    setCurrentPasswordError(newCurrentPasswordError);
    setNewPasswordError(newNewPasswordError);
    if (newCurrentPasswordError || newNewPasswordError) {
      return;
    }

    // Gửi lên server; thành công thì quay lại màn hồ sơ, lỗi thì hiện khung đỏ
    setServerError('');
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      router.back();
    } catch (error) {
      setServerError((error as Error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <Text style={styles.subtitle}>Các máy khác đang đăng nhập sẽ bị đăng xuất</Text>

        {serverError ? <ErrorBox message={serverError} /> : null}

        <TextField
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          error={currentPasswordError}
          isPassword
        />
        <TextField
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          error={newPasswordError}
          placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
          isPassword
        />

        <Button title="Đổi mật khẩu" loadingTitle="Đang đổi…" isLoading={isSubmitting} onPress={handleChangePassword} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
});
