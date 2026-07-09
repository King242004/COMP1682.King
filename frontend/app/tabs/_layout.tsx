// Tab shell — thin route file: the chrome lives in src/ui/components
// (AppHeader = blue header + streak, TabBar = bottom tabs + center FAB).
// Single-tier headers: the blue AppHeader belongs to HOME only — the other
// tabs have their own title row, so stacking both wasted ~90px per screen.
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
