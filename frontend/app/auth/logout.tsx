import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Screen } from "../ui/components/Screen";

export default function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/auth/login");
  }, [logout]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText variant="muted">Logging out…</AppText>
      </View>
    </Screen>
  );
}
