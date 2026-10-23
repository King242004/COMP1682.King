import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/shared/components/Button';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { TextField } from '../../src/shared/components/TextField';

// Mật khẩu ngắn nhất, giống luật ở backend (AuthService.ts)
const MIN_PASSWORD_LENGTH = 8;

export default function ChangePassword() {
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
    <Screen>
      <ScreenTitle title="Đổi mật khẩu" subtitle="Các máy khác đang đăng nhập sẽ bị đăng xuất" onBack={() => router.back()} />

      {serverError ? <ErrorBox message={serverError} /> : null}

      <TextField
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        error={currentPasswordError}
        isPassword
        isDisabled={isSubmitting}
      />
      <TextField
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        error={newPasswordError}
        placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
        isPassword
        isDisabled={isSubmitting}
      />

      <Button title="Đổi mật khẩu" loadingTitle="Đang đổi…" isLoading={isSubmitting} onPress={handleChangePassword} />
    </Screen>
  );
}
