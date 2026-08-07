// ═══ FILE NÀY LÀM GÌ ═══
// Thanh tab dưới cùng, gồm bốn tab và nút quét nổi ở giữa.
//
// Ai gọi tới: app/tabs/_layout
// Nhận vào:   tab nào đang được chọn
// Trả ra:     thanh tab đã vẽ, kèm menu quét khi bấm nút giữa
// Khi lỗi:    không có nhánh lỗi
import { useState, type ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "./AppText";
import { ActionSheet } from "./ActionSheet";

type IconName = ComponentProps<typeof Ionicons>["name"];
type TabItem = {
  name: string;
  icon: IconName;
  activeIcon: IconName;
  labelKey: "home" | "community" | "coach" | "profile";
};

// Hai bảng tab, tách trái phải để chừa chỗ giữa cho nút quét nổi.
// Thứ tự trong mảng chính là thứ tự hiện trên thanh.
// Nhớ: name phải trùng tên file route trong app/tabs, sai một chữ là bấm không đi đâu cả.
const LEFT_TABS: TabItem[] = [
  { name: "index", icon: "home-outline", activeIcon: "home", labelKey: "home" as const },
  { name: "community", icon: "people-outline", activeIcon: "people", labelKey: "community" as const },
];
const RIGHT_TABS: TabItem[] = [
  { name: "coach", icon: "sparkles-outline", activeIcon: "sparkles", labelKey: "coach" as const },
  { name: "profile", icon: "person-outline", activeIcon: "person", labelKey: "profile" as const },
];

// ══════════════════════════════════════════════════════════
// VẼ THANH TAB
//
// Đến từ app/tabs/_layout, thay hẳn thanh tab mặc định của thư viện.
// Ba bước, đọc từ trên xuống là đúng thứ tự. Không gọi mạng.
// Xong thì bấm tab nào là navigation đưa sang màn đó.
// ══════════════════════════════════════════════════════════

// VẼ THANH TAB BƯỚC 1. Thư viện đưa state với navigation vào đây.
// state.routes[state.index] là tab đang mở, lấy tên nó để biết tô sáng cái nào.
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const t = useT();
  const current = state.routes[state.index]?.name;
  const [modalVisible, setModalVisible] = useState(false);

  // VẼ THANH TAB BƯỚC 2. Vẽ một tab. Viết một lần rồi map cho cả bốn tab ở dưới.
  // Đang mở thì đổi sang icon đặc và tô màu chính, còn lại thì icon rỗng màu xám.
  const renderTab = (tab: TabItem) => {
    const active = current === tab.name;
    return (
      <Pressable
        key={tab.name}
        onPress={() => navigation.navigate(tab.name)}
        style={({ pressed }) => [styles.tab, pressed && styles.dim]}
      >
        <Ionicons
          name={active ? tab.activeIcon : tab.icon}
          size={22}
          color={active ? theme.colors.primary : theme.colors.subtle}
        />
        <AppText style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.nav[tab.labelKey]}</AppText>
      </Pressable>
    );
  };

  // VẼ THANH TAB BƯỚC 3. Ghép thanh: hai tab trái, nút quét giữa, hai tab phải.
  // Nút giữa không đi màn nào cả, nó mở ActionSheet cho chọn Quét ảnh hay Nhập tay.
  return (
    <>
      <ActionSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        items={[
          { label: t.nav.scanMeal, icon: "scan", onPress: () => router.push("/scan") },
          { label: t.nav.addManually, icon: "pencil", onPress: () => router.push("/meals/add") },
        ]}
      />

      <View style={styles.barWrap}>
        <View style={styles.bar}>
          {LEFT_TABS.map(renderTab)}

          <View style={styles.fabSlot}>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={({ pressed }) => pressed && styles.fabPressed}
            >
              <View style={styles.fab}>
                <Ionicons name="scan" size={26} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {RIGHT_TABS.map(renderTab)}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.6 },
  barWrap: { backgroundColor: theme.colors.bg },
  bar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 86 : 72,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  tabLabel: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  tabLabelActive: { color: theme.colors.primary },
  fabSlot: { width: 72, alignItems: "center", justifyContent: "center" },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.94 }] },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
});
