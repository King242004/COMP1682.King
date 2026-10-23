import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '../../src/auth/AuthContext';
import { colors } from '../../src/shared/theme';

// Thanh tab dưới cùng; chưa đăng nhập (hoặc vừa đăng xuất) thì về màn đăng nhập
export default function TabsLayout() {
  const { user } = useAuth();
  if (!user) {
    return <Redirect href="/auth/Login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused, size }) => <Ionicons name="home-outline" color={focused ? colors.primary : colors.textSecondary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="KhamPha"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ focused, size }) => <Ionicons name="compass-outline" color={focused ? colors.primary : colors.textSecondary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="TuVan"
        options={{
          title: 'Coach',
          tabBarIcon: ({ focused, size }) => <Ionicons name="chatbubble-ellipses-outline" color={focused ? colors.primary : colors.textSecondary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="HoSo"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused, size }) => <Ionicons name="person-outline" color={focused ? colors.primary : colors.textSecondary} size={size} />,
        }}
      />
    </Tabs>
  );
}
