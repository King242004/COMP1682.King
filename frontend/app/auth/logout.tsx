import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

export default function Profile() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
