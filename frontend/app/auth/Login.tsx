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

export default function Login() {
  const { login } = useAuth();

  // Nội dung hai ô nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Lỗi dưới từng ô, lỗi từ server, và trạng thái đang gửi
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm hai ô nhập, đúng thì gửi đăng nhập
  async function handleLogin() {
    let newEmailError = '';
    if (!email.includes('@')) {
      newEmailError = 'Email chưa đúng định dạng';
    }
    let newPasswordError = '';
    if (password === '') {
      newPasswordError = 'Hãy nhập mật khẩu';
    }
    setEmailError(newEmailError);
    setPasswordError(newPasswordError);
    if (newEmailError || newPasswordError) {
      return;
    }

    // Gửi lên server; thành công thì về màn đầu để chuyển vào trang chủ, lỗi thì hiện khung đỏ
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
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
      <ScreenTitle title="Đăng nhập" subtitle="Theo dõi bữa ăn mỗi ngày" />

      {serverError ? <ErrorBox message={serverError} /> : null}

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
        isPassword
        isDisabled={isSubmitting}
      />

      <Button title="Đăng nhập" loadingTitle="Đang đăng nhập…" isLoading={isSubmitting} onPress={handleLogin} />

      <Link href="/auth/Register" style={styles.link}>
        Tạo tài khoản mới
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
