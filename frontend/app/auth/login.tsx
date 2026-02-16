import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <Button
        title="Login"
        onPress={() => {
          login();
          router.replace("/tabs");
        }}
      />
    </View>
  );
}
