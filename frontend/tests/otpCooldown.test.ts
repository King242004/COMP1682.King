// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra đồng hồ xin lại OTP giảm từng giây và không chạy xuống số âm.
// Test helper thuần, không cần dựng màn xác thực.
import { nextOtpSecond } from "@/features/auth/useOtpCooldown";

test("OTP cooldown counts down without becoming negative", () => {
  expect(nextOtpSecond(60)).toBe(59);
  expect(nextOtpSecond(0)).toBe(0);
});
