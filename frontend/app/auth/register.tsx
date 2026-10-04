import { Link, router } from 'expo-router';
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

export default function RegisterScreen() {
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
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Bắt đầu theo dõi bữa ăn của bạn</Text>

        {serverError ? <ErrorBox message={serverError} /> : null}

        <TextField
          label="Tên hiển thị"
          value={displayName}
          onChangeText={setDisplayName}
          error={displayNameError}
          placeholder="Hoàng King"
        />
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
          placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
          isPassword
        />

        <Button title="Tạo tài khoản" loadingTitle="Đang tạo…" isLoading={isSubmitting} onPress={handleRegister} />

        <Link href="/auth/login" style={styles.link}>
          Đã có tài khoản? Đăng nhập
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
