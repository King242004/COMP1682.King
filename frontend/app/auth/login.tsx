import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/shared/components/Button';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { TextField } from '../../src/shared/components/TextField';
import { colors } from '../../src/shared/theme';

export default function LoginScreen() {
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
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Theo dõi bữa ăn mỗi ngày</Text>

        {serverError ? <ErrorBox message={serverError} /> : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          placeholder="ten@gmail.com"
          isEmail
        />
        <TextField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          isPassword
        />

        <Button title="Đăng nhập" loadingTitle="Đang đăng nhập…" isLoading={isSubmitting} onPress={handleLogin} />

        <Link href="/auth/register" style={styles.link}>
          Tạo tài khoản mới
        </Link>
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
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    color: colors.primary,
  },
});
