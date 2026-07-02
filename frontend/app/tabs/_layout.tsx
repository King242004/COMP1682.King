// Tab shell — thin route file: the chrome lives in src/ui/components
// (AppHeader = blue header + streak, TabBar = bottom tabs + center FAB).
import { Tabs } from "expo-router";
import { AppHeader } from "@/ui/components/AppHeader";
import { TabBar } from "@/ui/components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="coach" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
