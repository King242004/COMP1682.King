// Hook đếm thời gian chờ gửi lại OTP cho màn Đăng ký và Quên mật khẩu.
// Màn gọi start sau khi API gửi mã thành công; hook trả số giây còn lại để khóa nút gửi lại.
import { useEffect, useState } from "react";

export const OTP_RESEND_SECONDS = 60;
export const nextOtpSecond = (seconds: number) => Math.max(0, seconds - 1);

export function useOtpCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(nextOtpSecond), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return { seconds, start: () => setSeconds(OTP_RESEND_SECONDS), reset: () => setSeconds(0) };
}
