// Custom bottom tab bar (Home · Community · [+] · Coach · Profile) with the
// center FAB opening the add-meal sheet (Scan / Add manually).
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/ui/theme";

function FABModal({ visible, onClose, onScan, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onScan: () => void;
  onAdd: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <View style={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          gap: 12,
        }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.text, marginBottom: 4 }}>
            Add a meal
          </Text>

          <Pressable
            onPress={onScan}
            style={({ pressed }: { pressed: boolean }) => ({
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 16,
              backgroundColor: pressed ? theme.colors.tint : "rgba(8,145,178,0.06)",
            })}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: theme.colors.primary,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="scan" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.text }}>Scan meal</Text>
              <Text style={{ fontSize: 13, color: theme.colors.muted, marginTop: 2 }}>Take a photo to auto-detect food</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
          </Pressable>

          <Pressable
            onPress={onAdd}
            style={({ pressed }: { pressed: boolean }) => ({
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 16,
              backgroundColor: pressed ? theme.colors.tint : "rgba(8,145,178,0.06)",
            })}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: theme.colors.accent,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="pencil" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.text }}>Add manually</Text>
              <Text style={{ fontSize: 13, color: theme.colors.muted, marginTop: 2 }}>Enter meal name and calories</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export function TabBar({ state, navigation }: any) {
  const router = useRouter();
  const current = state.routes[state.index]?.name;
  const [modalVisible, setModalVisible] = useState(false);

  const leftTabs = [
    { name: "index", icon: "home-outline", activeIcon: "home", label: "Home" },
    { name: "community", icon: "people-outline", activeIcon: "people", label: "Community" },
  ];
  const rightTabs = [
    { name: "coach", icon: "sparkles-outline", activeIcon: "sparkles", label: "Coach" },
    { name: "profile", icon: "person-outline", activeIcon: "person", label: "Profile" },
  ];

  return (
    <>
      <FABModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScan={() => { setModalVisible(false); router.push("/scan"); }}
        onAdd={() => { setModalVisible(false); router.push("/meals/add"); }}
      />

      <View style={{
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
      }}>
        {leftTabs.map((tab) => {
          const active = current === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={({ pressed }: { pressed: boolean }) => ({
                flex: 1, alignItems: "center", justifyContent: "center",
                gap: 3, opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={(active ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={active ? theme.colors.primary : theme.colors.subtle}
              />
              <Text style={{
                fontSize: 10, fontWeight: "700",
                color: active ? theme.colors.primary : theme.colors.subtle,
              }}>{tab.label}</Text>
            </Pressable>
          );
        })}

        <View style={{ width: 72, alignItems: "center", justifyContent: "center" }}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }: { pressed: boolean }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: theme.colors.primary,
              alignItems: "center", justifyContent: "center",
              shadowColor: theme.colors.primary,
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 8,
            }}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {rightTabs.map((tab) => {
          const active = current === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={({ pressed }: { pressed: boolean }) => ({
                flex: 1, alignItems: "center", justifyContent: "center",
                gap: 3, opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={(active ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={active ? theme.colors.primary : theme.colors.subtle}
              />
              <Text style={{
                fontSize: 10, fontWeight: "700",
                color: active ? theme.colors.primary : theme.colors.subtle,
              }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
