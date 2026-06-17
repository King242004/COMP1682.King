import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { MealsProvider } from "./context/MealsContext";

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
          <Stack.Screen name="settings" />
          <Stack.Screen name="community/post-create" />
          <Stack.Screen name="community/user-profile" />
          <Stack.Screen name="community/discover" />
          {/* Meal screens use a native header for a clean back arrow */}
          <Stack.Screen name="meals/add" options={{ headerShown: true, headerTitle: "Add meal" }} />
          <Stack.Screen name="meals/edit" options={{ headerShown: true, headerTitle: "Edit meal" }} />
          <Stack.Screen name="meals/detail" options={{ headerShown: true, headerTitle: "" }} />
          <Stack.Screen name="meals/history" options={{ headerShown: true, headerTitle: "" }} />
        </Stack>
      </MealsProvider>
    </AuthProvider>
  );
}