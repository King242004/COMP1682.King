import { Stack } from 'expo-router';

import { AuthProvider } from '../src/auth/AuthContext';
import { DonViProvider } from '../src/don-vi/DonViContext';

// Bọc cả app trong trạng thái đăng nhập và đơn vị đang chọn; ẩn thanh tiêu đề mặc định của mọi màn
export default function RootLayout() {
  return (
    <AuthProvider>
      <DonViProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Màn thêm / sửa món trượt từ dưới lên, phủ toàn màn để lề trên tính đúng như các màn khác */}
          <Stack.Screen name="bua-an/ThemSuaBuaAn" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </DonViProvider>
    </AuthProvider>
  );
}
