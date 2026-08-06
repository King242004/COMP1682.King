// ═══ FILE NÀY LÀM GÌ ═══
// Nơi app bắt đầu chạy. Mọi màn hình đều nằm bên trong file này.
//
// Ai gọi tới: expo-router chạy file này đầu tiên, trước mọi màn hình
// Nhận vào:   không nhận gì
// Trả ra:     bộ khung có ba Provider bọc ngoài và danh sách màn hình
// Khi lỗi:    font tải hỏng thì màn hình chờ giữ nguyên, không lóe màn trắng
//
// LUỒNG MỞ APP
// 1. Chạy file này đầu tiên
// 2. Giữ màn hình chờ, tải font Be Vietnam Pro
// 3. Font xong thì tắt màn hình chờ
// 4. Dựng ba Provider bọc ngoài, xem chú thích bên dưới
// 5. AuthProvider tự đọc phiên đăng nhập cũ trong máy
// 6. app/index.tsx xem có phiên không rồi đá sang /tabs hoặc /auth/login
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { BeVietnamPro_800ExtraBold } from "@expo-google-fonts/be-vietnam-pro/800ExtraBold";
import { AuthProvider } from "@/features/auth/AuthContext";
import { HealthDataRefreshProvider } from "@/context/HealthDataRefreshContext";
import { MealsProvider } from "@/features/meals/MealsContext";

// Chặn hệ điều hành tự tắt màn hình chờ, để tự tắt sau khi font tải xong.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });

  // Tắt màn hình chờ ngay khi font tải xong.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hide();
  }, [fontsLoaded]);

  // Giữ splash trong lúc tải font để không lóe màn hình trắng.
  if (!fontsLoaded) return null;

  // Thứ tự bọc quan trọng, ngoài vào trong.
  // AuthProvider giữ tài khoản và thẻ đăng nhập, phải ngoài cùng vì hai cái kia cần thẻ.
  // HealthDataRefreshProvider giữ một con số đếm, tăng lên mỗi khi dữ liệu sức khỏe đổi.
  // MealsProvider giữ danh sách món, và tăng con số kia sau mỗi lần thêm sửa xóa.
  return (
    <AuthProvider>
      <HealthDataRefreshProvider>
        <MealsProvider>
          <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: "minimal", headerBackTitle: "" }}>
            {/* Khai báo hiệu ứng chuyển màn. Màn nào không khai báo thì dùng mặc định. */}
            {/* index và login tắt hiệu ứng để lúc mở app không bị lóe hai lần. */}
            <Stack.Screen name="index" options={{ animation: "none" }} />
            <Stack.Screen name="auth/login" options={{ animation: "none" }} />
            <Stack.Screen name="auth/register" options={{ animation: "none" }} />
            <Stack.Screen name="auth/forgot-password" options={{ animation: "none" }} />
            <Stack.Screen name="onboarding" options={{ animation: "fade_from_bottom" }} />
            {/* Tắt vuốt để quay lại, vì vuốt từ tabs sẽ rơi ngược về màn đăng nhập. */}
            <Stack.Screen name="tabs" options={{ gestureEnabled: false }} />
            <Stack.Screen name="scan" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/goals" />
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
      </HealthDataRefreshProvider>
    </AuthProvider>
  );
}
