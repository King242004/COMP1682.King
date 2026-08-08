// ═══ FILE NÀY LÀM GÌ ═══
// Đếm ngược thời gian chờ trước khi được gửi lại mã.
//
// Ai gọi tới: RegisterScreen, ForgotPasswordScreen
// Nhận vào:   lệnh bắt đầu đếm, gọi sau khi gửi mã thành công
// Trả ra:     số giây còn lại, để màn hình khóa nút gửi lại
// Khi lỗi:    rời màn giữa chừng thì đồng hồ tự dừng, không rò bộ nhớ

// Màn gọi start sau khi API gửi mã thành công; hook trả số giây còn lại để khóa nút gửi lại.
import { useEffect, useState } from "react";

export const OTP_RESEND_SECONDS = 60;
export const nextOtpSecond = (seconds: number) => Math.max(0, seconds - 1);

// ══════════════════════════════════════════════════════════
// ĐẾM NGƯỢC NÚT GỬI LẠI
//
// Đến từ màn Đăng ký và màn Quên mật khẩu. Hai bước, không gọi mạng.
// Xong thì màn đọc seconds, còn lớn hơn 0 thì khóa nút Gửi lại.
// ══════════════════════════════════════════════════════════

// ĐẾM NGƯỢC BƯỚC 1. Số giây còn lại. Bằng 0 nghĩa là bấm Gửi lại được rồi.
export function useOtpCooldown() {
  const [seconds, setSeconds] = useState(0);

  // ĐẾM NGƯỢC BƯỚC 2. Mỗi giây trừ một, tới 0 thì tự dừng nhờ dòng thoát ở đầu.
  // Dùng setTimeout hẹn từng giây chứ không dùng setInterval, vì effect này
  // chạy lại sau MỖI lần seconds đổi, nên chỉ cần hẹn đúng một nhịp.
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(nextOtpSecond), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return { seconds, start: () => setSeconds(OTP_RESEND_SECONDS), reset: () => setSeconds(0) };
}
