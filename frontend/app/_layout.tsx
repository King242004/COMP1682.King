import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { MealsProvider } from "@/context/MealsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MealsProvider>
        <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: "minimal", headerBackTitle: "" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="tabs" />
          {/* Sub-flows pushed OVER the tabs — back() pops here naturally */}
          <Stack.Screen name="scan" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/settings" />
          <Stack.Screen name="profile/progress" />
          <Stack.Screen name="community/post-create" />
          <Stack.Screen name="community/user-profile" />
          <Stack.Screen name="community/discover" />
          <Stack.Screen name="meals/add" />
          <Stack.Screen name="meals/edit" />
          <Stack.Screen name="meals/detail" />
          <Stack.Screen name="meals/history" />
          <Stack.Screen name="plan/weekly" />
          <Stack.Screen name="exercise/log-workout" />
        </Stack>
      </MealsProvider>
    </AuthProvider>
  );
}