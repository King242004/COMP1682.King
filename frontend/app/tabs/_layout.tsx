// Route mỏng cho khu vực tab. Giao diện chung nằm trong src/ui/components.
// AppHeader gồm thanh đầu màu xanh và streak. TabBar là thanh tab phía dưới.
// Chỉ Home dùng AppHeader vì các tab khác đã có hàng tiêu đề riêng.
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
