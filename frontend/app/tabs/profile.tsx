import { useCallback, useState } from "react";
import { Alert, ScrollView, View, Pressable, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "H";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

const GOALS = [
  { key: "lose_weight", label: "Lose Weight" },
  { key: "gain_muscle", label: "Gain Muscle" },
  { key: "eat_healthy", label: "Eat Healthy" },
];

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary" },
  { key: "moderate", label: "Moderate" },
  { key: "active", label: "Active" },
];

// Settings-style row: tinted icon square + label + value on the right
function SettingRow({ icon, label, value, last }: {
  icon: string; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 0.5,
      borderBottomColor: theme.colors.border,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 11,
        backgroundColor: "rgba(37,99,235,0.08)",
        alignItems: "center", justifyContent: "center",
      }}>
        <AppText style={{ fontSize: 15 }}>{icon}</AppText>
      </View>
      <AppText variant="body2" style={{ flex: 1, color: theme.colors.muted }}>{label}</AppText>
      <AppText variant="body2" style={{ fontWeight: "700", textTransform: "capitalize" }}>{value}</AppText>
    </View>
  );
}

// Small uppercase section label above each settings card
function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="subtle" style={{
      fontSize: 12, fontWeight: "700",
      textTransform: "uppercase", letterSpacing: 0.6,
      marginBottom: -6, marginLeft: 4,
    }}>
      {children}
    </AppText>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, stats, logout, fetchProfile, uploadAvatar } = useAuth();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Refresh on focus so changes made in the Edit screen show up on return
  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  // Tap on avatar → open image picker → upload to Cloudinary via backend
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to change avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert("Upload failed", e.message || "Could not upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const displayName = user?.name ?? "HealthySnap User";
  const badge = initials(displayName);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingTop: theme.space.lg,
          paddingBottom: 40,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 4 }}>
          <AppText variant="h1">Profile</AppText>
          <AppText variant="muted">Your account and app settings.</AppText>
        </View>

        {/* User card — avatar (tap to change) + name + edit button */}
        <Card style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.md }}>
            <Pressable onPress={handlePickAvatar} disabled={isUploadingAvatar}>
              <View style={{
                width: 68, height: 68, borderRadius: 24,
                backgroundColor: theme.colors.tint,
                alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                opacity: isUploadingAvatar ? 0.5 : 1,
              }}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <AppText variant="h2" style={{ color: theme.colors.primary }}>{badge}</AppText>
                )}
              </View>
              <View style={{
                position: "absolute", bottom: -2, right: -2,
                backgroundColor: theme.colors.primary,
                width: 22, height: 22, borderRadius: 11,
                alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: theme.colors.surface,
              }}>
                <AppText style={{ fontSize: 11, color: "#fff" }}>📷</AppText>
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="h2">{displayName}</AppText>
              <AppText variant="muted" style={{ fontSize: 13 }}>{user?.email}</AppText>
              {isUploadingAvatar && (
                <AppText variant="muted" style={{ fontSize: 11 }}>Uploading...</AppText>
              )}
            </View>
            <Pressable
              onPress={() => router.push("/profile/edit" as any)}
              style={({ pressed }) => ({
                width: 40, height: 40, borderRadius: 14,
                backgroundColor: pressed ? "rgba(37,99,235,0.18)" : theme.colors.tint,
                alignItems: "center", justifyContent: "center",
              })}
            >
              <Ionicons name="pencil" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        </Card>

        {/* Health stats strip */}
        {stats && (
          <View style={{ flexDirection: "row", gap: theme.space.md }}>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 24, color: theme.colors.primary }}>
                {stats.bmi ?? "—"}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>BMI</AppText>
              {stats.bmiCategory && (
                <AppText variant="subtle" style={{ fontSize: 11 }}>{stats.bmiCategory}</AppText>
              )}
            </Card>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 24, color: theme.colors.primary }}>
                {stats.tdee ?? "—"}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>TDEE (kcal)</AppText>
            </Card>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 24, color: theme.colors.primary }}>
                {user?.calorieGoal ?? 2000}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>Goal (kcal)</AppText>
            </Card>
          </View>
        )}

        {/* Health details — settings-row style */}
        <SectionLabel>Health details</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          <SettingRow icon="👤" label="Gender" value={user?.gender ?? "—"} />
          <SettingRow icon="🎂" label="Age" value={user?.age ? `${user.age} years` : "—"} />
          <SettingRow icon="⚖️" label="Weight" value={user?.weight ? `${user.weight} kg` : "—"} />
          <SettingRow icon="📏" label="Height" value={user?.height ? `${user.height} cm` : "—"} />
          <SettingRow icon="🎯" label="Goal" value={GOALS.find((g) => g.key === user?.goal)?.label ?? "—"} />
          <SettingRow icon="🏃" label="Activity" value={ACTIVITY_LEVELS.find((a) => a.key === user?.activityLevel)?.label ?? "—"} />
          <SettingRow icon="❤️" label="Conditions" value={user?.conditions?.length ? user.conditions.join(", ") : "None"} last />
        </Card>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <Card style={{ paddingVertical: 4, paddingHorizontal: theme.space.lg }}>
          {/* Settings entry — app preferences live in their own screen */}
          <Pressable
            onPress={() => router.push("/profile/settings" as any)}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: theme.colors.border,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{
              width: 34, height: 34, borderRadius: 11,
              backgroundColor: "rgba(37,99,235,0.08)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="settings-outline" size={17} color={theme.colors.primary} />
            </View>
            <AppText variant="body2" style={{ flex: 1, fontWeight: "600" }}>
              Settings
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{
              width: 34, height: 34, borderRadius: 11,
              backgroundColor: "rgba(229,72,77,0.10)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="log-out-outline" size={17} color={theme.colors.danger} />
            </View>
            <AppText variant="body2" style={{ flex: 1, fontWeight: "700", color: theme.colors.danger }}>
              Log out
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
          </Pressable>
        </Card>

        <AppText variant="subtle" style={{ textAlign: "center", fontSize: 11, marginTop: 4 }}>
          HealthySnap · v1.0.0
        </AppText>
      </ScrollView>
    </Screen>
  );
}
