import { useMemo } from "react";
import { Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "M";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const name = user?.name ?? "Meal Snap User";
  const email = user?.email ?? "user@example.com";

  const badge = useMemo(() => initials(name), [name]);

  return (
    <Screen padded={false} style={{ paddingTop: theme.space.lg }}>
      <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.lg }}>
        <View style={{ gap: 6 }}>
          <AppText variant="h1">Profile</AppText>
          <AppText variant="muted">Manage your account and settings.</AppText>
        </View>

        <Card style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.md }}>
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 24,
                backgroundColor: theme.colors.tint,
                borderWidth: 1,
                borderColor: "rgba(11, 42, 111, 0.18)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText variant="h2" style={{ color: theme.colors.primary }}>
                {badge}
              </AppText>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="h2">{name}</AppText>
              <AppText variant="muted">{email}</AppText>
            </View>
          </View>

          <View style={{ marginTop: theme.space.lg, gap: 10 }}>
            <Button
              title="Edit profile"
              variant="secondary"
              onPress={() => Alert.alert("Edit profile", "Profile editing UI can be added next.")}
            />
            <Button
              title="Log out"
              variant="danger"
              onPress={() => {
                logout();
                router.replace("/auth/login");
              }}
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}
