import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/shared/components/Button';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { TextField } from '../../src/shared/components/TextField';
import { colors, fontSizes, radius, spacing } from '../../src/shared/theme';

// Mật khẩu ngắn nhất, giống luật ở backend (AuthService.ts)
const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const { register } = useAuth();

  // Nội dung ba ô nhập
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Lỗi dưới từng ô, lỗi từ server, và trạng thái đang gửi
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm ba ô nhập, đúng thì gửi đăng ký
  async function handleRegister() {
    let newDisplayNameError = '';
    if (displayName.trim() === '') {
      newDisplayNameError = 'Hãy nhập tên hiển thị';
    }
    let newEmailError = '';
    if (!email.includes('@')) {
      newEmailError = 'Email chưa đúng định dạng';
    }
    let newPasswordError = '';
    if (password.length < MIN_PASSWORD_LENGTH) {
      newPasswordError = `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
    }
    setDisplayNameError(newDisplayNameError);
    setEmailError(newEmailError);
    setPasswordError(newPasswordError);
    if (newDisplayNameError || newEmailError || newPasswordError) {
      return;
    }

    // Gửi lên server; thành công thì về màn đầu để chuyển vào trang chủ, lỗi thì hiện khung đỏ
    setServerError('');
    setIsSubmitting(true);
    try {
      await register(displayName, email, password);
      router.replace('/');
    } catch (error) {
      setServerError((error as Error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      {/* Dòng logo nhỏ: ô vuông có biểu tượng món ăn, bên cạnh chữ MealMate */}
      <View style={styles.logoRow}>
        <View style={styles.logoBox}>
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.logoText}>MealMate</Text>
      </View>
      <ScreenTitle title="Tạo tài khoản" subtitle="Bắt đầu theo dõi bữa ăn của bạn" />

      {serverError ? <ErrorBox message={serverError} /> : null}

      <TextField
        label="Tên hiển thị"
        value={displayName}
        onChangeText={setDisplayName}
        error={displayNameError}
        placeholder="Hoàng King"
        isDisabled={isSubmitting}
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        placeholder="ten@gmail.com"
        isEmail
        isDisabled={isSubmitting}
      />
      <TextField
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
        isPassword
        isDisabled={isSubmitting}
      />

      <Button title="Tạo tài khoản" loadingTitle="Đang tạo…" isLoading={isSubmitting} onPress={handleRegister} />

      <Link href="/auth/Login" style={styles.link}>
        Đã có tài khoản? Đăng nhập
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  link: {
    marginTop: spacing.large,
    textAlign: 'center',
    fontSize: fontSizes.body,
    color: colors.primary,
  },
});
