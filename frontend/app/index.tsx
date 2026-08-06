// Màn chia đường lúc mở app. Không hiện gì cả, chỉ quyết định đi đâu.
// Nhận: user và isLoading lấy từ AuthContext.
// Làm: chờ AuthContext đọc xong phiên cũ trong máy rồi mới chọn đường.
// Ra: đá sang /tabs nếu đã đăng nhập, hoặc /auth/login nếu chưa.
// Hỏng: không có nhánh lỗi. Đọc phiên thất bại thì AuthContext để user rỗng,
//   nên rơi vào nhánh đi tới màn đăng nhập.
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