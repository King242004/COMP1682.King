import { nextOtpSecond } from "@/features/auth/useOtpCooldown";

test("OTP cooldown counts down without becoming negative", () => {
  expect(nextOtpSecond(60)).toBe(59);
  expect(nextOtpSecond(0)).toBe(0);
});
