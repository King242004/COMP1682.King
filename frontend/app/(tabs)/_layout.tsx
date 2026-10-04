import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '../../src/auth/AuthContext';
import { colors } from '../../src/shared/theme';

// Thanh tab dưới cùng; chưa đăng nhập (hoặc vừa đăng xuất) thì về màn đăng nhập
export default function TabsLayout() {
  const { user } = useAuth();
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ho-so"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
