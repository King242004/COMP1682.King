// ═══ FILE NÀY LÀM GÌ ═══
// Dựng khu vực bốn tab: Trang chủ, Cộng đồng, Coach, Hồ sơ.
//
// Ai gọi tới: expo-router, khi người dùng đã đăng nhập và vào /tabs
// Nhận vào:   không nhận gì
// Trả ra:     khung bốn tab, kèm thanh tab dưới và thanh đầu cho riêng Trang chủ
// Khi lỗi:    không có nhánh lỗi, đây chỉ là khai báo giao diện
//
// Hai mảnh giao diện chung lấy từ src/ui/components:
//   AppHeader  thanh đầu màu xanh kèm streak, CHỈ tab Trang chủ dùng
//   TabBar     thanh bốn tab phía dưới, mọi tab đều dùng
// Ba tab kia không dùng AppHeader vì đã có hàng tiêu đề riêng trong màn.
import { Tabs } from "expo-router";
import { AppHeader } from "@/ui/components/AppHeader";
import { TabBar } from "@/ui/components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ headerShown: true, header: () => <AppHeader /> }} />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="coach" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
