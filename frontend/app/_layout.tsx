import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { BeVietnamPro_800ExtraBold } from "@expo-google-fonts/be-vietnam-pro/800ExtraBold";
import { AuthProvider } from "@/context/AuthContext";
import { HealthDataProvider } from "@/context/HealthDataContext";
import { MealsProvider } from "@/context/MealsContext";

export default function RootLayout() {
  // Be Vietnam Pro across the whole app: a modern geometric sans designed for
  // full Vietnamese diacritics plus Latin, so headings and body render cleanly
  // in both languages. AppText maps weight to the matching file.
  const [fontsLoaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });
  if (!fontsLoaded) return null; // brief blank on first launch instead of font swap flash

  return (
    <AuthProvider>
      <HealthDataProvider>
        <MealsProvider>
          <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: "minimal", headerBackTitle: "" }}>
            <Stack.Screen name="index" />
            {/* Fade for the logout replace (tabs → login); a slide here reads as
                a janky push since the whole app is being swapped out */}
            <Stack.Screen name="auth/login" options={{ animation: "fade" }} />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/forgot-password" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="tabs" />
            {/* Sub-flows pushed OVER the tabs — back() pops here naturally */}
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
