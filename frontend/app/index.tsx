import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../src/auth/AuthContext';
import { ErrorBox } from '../src/shared/components/ErrorBox';
import { colors } from '../src/shared/theme';

export default function StartScreen() {
  const { user, isLoading, connectionError, loadSavedSession } = useAuth();

  // Đang kiểm tra phiên đăng nhập đã lưu
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Không hỏi được server thì cho thử lại
  if (connectionError) {
    return (
      <View style={styles.center}>
        <ErrorBox message={connectionError} onRetry={loadSavedSession} />
      </View>
    );
  }

  // Chưa đăng nhập thì sang màn đăng nhập, chưa có hồ sơ thì thiết lập, còn lại vào trang chủ
  if (!user) {
    return <Redirect href="/auth/login" />;
  }
  if (!user.da_co_ho_so) {
    return <Redirect href="/ho-so/sua" />;
  }
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
});
