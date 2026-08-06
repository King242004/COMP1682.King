// ═══ FILE NÀY LÀM GÌ ═══
// Chốt chia đường lúc mở app. Không hiện gì cả, chỉ quyết định đi đâu.
//
// Ai gọi tới: expo-router, đây là màn đầu tiên ứng với địa chỉ gốc "/"
// Nhận vào:   user và isLoading lấy từ AuthContext
// Trả ra:     không vẽ gì, chỉ đá sang /tabs hoặc /auth/login
// Khi lỗi:    không có nhánh lỗi. Đọc phiên thất bại thì AuthContext để user
//             rỗng, nên tự rơi vào nhánh đi tới màn đăng nhập.
import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Chưa đọc xong phiên thì không hiện gì, tránh lóe màn đăng nhập
  // rồi lại nhảy ngay sang trang chủ.
  if (isLoading) return null;

  if (user) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/auth/login" />;
}