// ═══ FILE NÀY LÀM GÌ ═══
// Nơi app bắt đầu chạy. Mọi màn hình đều nằm bên trong file này.
//
// Ai gọi tới: expo-router chạy file này đầu tiên, trước mọi màn hình
// Nhận vào:   không nhận gì
// Trả ra:     bộ khung có ba Provider bọc ngoài, cộng phần khai hiệu ứng chuyển màn
// Khi lỗi:    font tải hỏng thì màn hình chờ giữ nguyên, không lóe màn trắng
//
// Mở app thì chạy theo thứ tự này:
//   File này chạy đầu tiên, giữ màn hình chờ và tải font Be Vietnam Pro
//   Font xong thì tắt màn hình chờ, rồi dựng ba Provider bọc ngoài
//   AuthProvider tự đọc phiên đăng nhập cũ trong máy
//   app/index.tsx xem có phiên không rồi đá sang /tabs hoặc /auth/login
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
// Bắt lỗi vì đây là promise không ai chờ: chặn hụt thì màn hình chờ tắt sớm,
// khó chịu một nhịp chứ không hỏng app, nên không được để nó thành lỗi văng ra.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
          <Stack screenOptions={{ headerShown: false }}>
            {/* CHỈ khai màn nào cần đổi hiệu ứng chuyển cảnh. Expo Router tự đăng ký
                mọi route theo tên file trong app/, nên khai tên suông không kèm
                option là không làm gì cả. Trước ngày 9/8/2026 chỗ này có 20 dòng
                như vậy, và chính hai màn KHÔNG được khai là exercise/guided với
                profile/help vẫn chạy bình thường, đó là bằng chứng. */}
            {/* index cùng ba màn auth tắt hiệu ứng để lúc mở app không lóe hai lần. */}
            <Stack.Screen name="index" options={{ animation: "none" }} />
            <Stack.Screen name="auth/login" options={{ animation: "none" }} />
            <Stack.Screen name="auth/register" options={{ animation: "none" }} />
            <Stack.Screen name="auth/forgot-password" options={{ animation: "none" }} />
            <Stack.Screen name="onboarding" options={{ animation: "fade_from_bottom" }} />
            {/* Tắt vuốt để quay lại, vì vuốt từ tabs sẽ rơi ngược về màn đăng nhập. */}
            <Stack.Screen name="tabs" options={{ gestureEnabled: false }} />
          </Stack>
        </MealsProvider>
      </HealthDataRefreshProvider>
    </AuthProvider>
  );
}
