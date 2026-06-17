import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMeals } from "../context/MealsContext";
import { theme } from "../ui/theme";


function greetingForHour(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function AppHeader() {
  const { user } = useAuth();
  // Streak reads from historyMeals (all logged days), matched on meal.date with a
  // local date key — `meals` only holds one day so it gave a wrong streak before.
  const { historyMeals } = useMeals();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const localKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const streak = (() => {
    const loggedDays = new Set(historyMeals.map((m) => m.date));
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (loggedDays.has(localKey(d))) count++;
      else break;
    }
    return count;
  })();

  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.space.lg,
      paddingTop: Platform.OS === "ios" ? 52 : 16,
      paddingBottom: 16,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.15)",
          borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
            {(user?.name ?? "U")[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            {greetingForHour(new Date().getHours())}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
            {user?.name ?? "there"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {streak > 0 && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: "rgba(255,138,61,0.25)",
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFB347" }}>{streak}</Text>
            <Text style={{ fontSize: 14 }}>⚡</Text>
          </View>
        )}
        <Pressable style={({ pressed }: { pressed: boolean }) => ({
          width: 38, height: 38, borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.15)",
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

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
              backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.06)",
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
              backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.06)",
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

function TabBar({ state, navigation }: any) {
  const router = useRouter();
  const current = state.routes[state.index]?.name;
  const [modalVisible, setModalVisible] = useState(false);

  // Full-screen sub-flows hide the bottom nav (scan camera, post composer, public profile)
  if (current === "scan" || current === "community/post-create" || current === "community/user-profile" || current === "community/discover") return null;

  const leftTabs = [
    { name: "index", icon: "home-outline", activeIcon: "home", label: "Home" },
    { name: "community/index", icon: "people-outline", activeIcon: "people", label: "Community" },
  ];
  const rightTabs = [
    { name: "progress", icon: "bar-chart-outline", activeIcon: "bar-chart", label: "Progress" },
    { name: "profile", icon: "person-outline", activeIcon: "person", label: "Profile" },
  ];

  return (
    <>
      <FABModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScan={() => { setModalVisible(false); router.push("/tabs/scan"); }}
        onAdd={() => { setModalVisible(false); router.push("/tabs/meals/add"); }}
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
      <Tabs.Screen name="community/index" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="meals/add" options={{ headerShown: true }} />
      <Tabs.Screen name="meals/edit" options={{ headerShown: true }} />
      <Tabs.Screen name="scan" options={{ headerShown: false }} />
      <Tabs.Screen name="meals/detail" options={{ headerShown: true }} />
      <Tabs.Screen name="meals/history" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" options={{ headerShown: true }} />
      <Tabs.Screen name="community/post-create" options={{ headerShown: false }} />
      <Tabs.Screen name="community/user-profile" options={{ headerShown: false }} />
      <Tabs.Screen name="community/discover" options={{ headerShown: false }} />
    </Tabs>
  );
}