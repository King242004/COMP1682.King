import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../../src/auth/AuthContext';
import { todayKey } from '../../src/shared/dateKey';
import { colors } from '../../src/shared/theme';
import { henLaiNhacUongNuoc, huyHetNhacUongNuoc } from '../../src/uong-nuoc/NhacUongNuoc';
import { layUongNuocNgay } from '../../src/uong-nuoc/UongNuocApi';

// Thanh tab dưới cùng; chưa đăng nhập (hoặc vừa đăng xuất) thì về màn đăng nhập
export default function TabsLayout() {
  const { user } = useAuth();

  // Đăng nhập (hoặc mở app khi đã đăng nhập) thì hẹn lại lời nhắc uống nước theo cài đặt trên server; đăng xuất thì hủy hết
  useEffect(() => {
    if (user) {
      henLaiGioNhacUongNuoc();
    } else {
      huyHetNhacUongNuoc();
    }
  }, [user]);

  // Đọc cài đặt nhắc trên server rồi hẹn lại; không tải được (chưa có hồ sơ, mất mạng) thì thôi, lần mở app sau hẹn lại
  async function henLaiGioNhacUongNuoc() {
    try {
      const uongNuoc = await layUongNuocNgay(todayKey());
      await henLaiNhacUongNuoc(uongNuoc.nhac_uong_nuoc, uongNuoc.gio_nhac);
    } catch {
      return;
    }
  }

  if (!user) {
    return <Redirect href="/auth/Login" />;
  }

  return (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary }}>
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
          // Coach là màn riêng phủ toàn màn: ẩn thanh tab, nút ‹ trong màn quay về tab trước đó (nhờ backBehavior="history")
          tabBarStyle: { display: 'none' },
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
