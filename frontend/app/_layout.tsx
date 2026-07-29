import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { BeVietnamPro_800ExtraBold } from "@expo-google-fonts/be-vietnam-pro/800ExtraBold";
import { AuthProvider } from "@/context/AuthContext";
import { HealthDataProvider } from "@/context/HealthDataContext";
import { MealsProvider } from "@/context/MealsContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hide();
  }, [fontsLoaded]);

  // Giữ splash trong lúc tải font để không lóe màn hình trắng.
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <HealthDataProvider>
        <MealsProvider>
          <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: "minimal", headerBackTitle: "" }}>
            <Stack.Screen name="index" options={{ animation: "none" }} />
            <Stack.Screen name="auth/login" options={{ animation: "none" }} />
            <Stack.Screen name="auth/register" options={{ animation: "ios_from_right" }} />
            <Stack.Screen name="auth/forgot-password" options={{ animation: "ios_from_right" }} />
            <Stack.Screen name="onboarding" options={{ animation: "fade_from_bottom" }} />
            <Stack.Screen name="tabs" options={{ gestureEnabled: false }} />
            <Stack.Screen name="scan" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/settings" />
            <Stack.Screen name="profile/change-password" />
            <Stack.Screen name="profile/reminders" />
            <Stack.Screen name="profile/progress" />
            <Stack.Screen name="community/notifications" />
            <Stack.Screen name="community/post-create" />
            <Stack.Screen name="community/post-detail" />
            <Stack.Screen name="community/post-edit" />
            <Stack.Screen name="community/user-profile" />
            <Stack.Screen name="community/user-list" />
            <Stack.Screen name="community/discover" />
            <Stack.Screen name="meals/add" />
            <Stack.Screen name="meals/edit" />
            <Stack.Screen name="meals/detail" />
            <Stack.Screen name="meals/history" />
            <Stack.Screen name="plan/weekly" />
            <Stack.Screen name="exercise/log-workout" />
          </Stack>
        </MealsProvider>
      </HealthDataProvider>
    </AuthProvider>
  );
}
