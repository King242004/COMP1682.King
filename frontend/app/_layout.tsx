import { Stack } from 'expo-router';

import { AuthProvider } from '../src/auth/AuthContext';

// Bọc cả app trong trạng thái đăng nhập; ẩn thanh tiêu đề mặc định của mọi màn
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Màn thêm / sửa món trượt từ dưới lên */}
        <Stack.Screen name="bua-an/sua" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
