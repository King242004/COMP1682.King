import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { MealsProvider } from "./context/MealsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MealsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="tabs" />
        </Stack>
      </MealsProvider>
    </AuthProvider>
  );
}
