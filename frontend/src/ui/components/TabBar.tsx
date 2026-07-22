// Custom bottom tab bar (Home · Community · [+] · Coach · Profile) with the
// center FAB opening the add-meal sheet (Scan / Add manually).
import { useState, type ComponentProps } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "./AppText";

function FABModal({ visible, onClose, onScan, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onScan: () => void;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <AppText style={styles.sheetTitle}>{t.nav.addMealTitle}</AppText>

          <Pressable onPress={onScan} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
            <View style={[styles.optionIcon, styles.optionIconScan]}>
              <Ionicons name="scan" size={22} color="#fff" />
            </View>
            <View style={styles.flex1}>
              <AppText style={styles.optionTitle}>{t.nav.scanMeal}</AppText>
              <AppText style={styles.optionSub}>{t.nav.scanMealSub}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
          </Pressable>

          <Pressable onPress={onAdd} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
            <View style={[styles.optionIcon, styles.optionIconAdd]}>
              <Ionicons name="pencil" size={22} color="#fff" />
            </View>
            <View style={styles.flex1}>
              <AppText style={styles.optionTitle}>{t.nav.addManually}</AppText>
              <AppText style={styles.optionSub}>{t.nav.addManuallySub}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// Tab metadata; labels resolve from the i18n catalog by key
type IconName = ComponentProps<typeof Ionicons>["name"];
type TabItem = {
  name: string;
  icon: IconName;
  activeIcon: IconName;
  labelKey: "home" | "community" | "coach" | "profile";
};

const LEFT_TABS: TabItem[] = [
  { name: "index", icon: "home-outline", activeIcon: "home", labelKey: "home" as const },
  { name: "community", icon: "people-outline", activeIcon: "people", labelKey: "community" as const },
];
const RIGHT_TABS: TabItem[] = [
  { name: "coach", icon: "sparkles-outline", activeIcon: "sparkles", labelKey: "coach" as const },
  { name: "profile", icon: "person-outline", activeIcon: "person", labelKey: "profile" as const },
];

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const t = useT();
  const current = state.routes[state.index]?.name;
  const [modalVisible, setModalVisible] = useState(false);

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

  return (
    <>
      <FABModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScan={() => { setModalVisible(false); router.push("/scan"); }}
        onAdd={() => { setModalVisible(false); router.push("/meals/add"); }}
      />

      <View style={styles.bar}>
        {LEFT_TABS.map(renderTab)}

        <View style={styles.fabSlot}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => pressed && styles.fabPressed}
          >
            {/* Scan glyph, not a plain +, so the flagship food-scan entry is
                not visually identical to the community new-post + button */}
            <View style={styles.fab}>
              <Ionicons name="scan" size={26} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {RIGHT_TABS.map(renderTab)}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },

  // FAB sheet
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.text, marginBottom: 4 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16,
    backgroundColor: "rgba(8,145,178,0.06)",
  },
  optionPressed: { backgroundColor: theme.colors.tint },
  optionIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  optionIconScan: { backgroundColor: theme.colors.primary },
  optionIconAdd: { backgroundColor: theme.colors.accent },
  optionTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.text },
  optionSub: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },

  // Bar
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
