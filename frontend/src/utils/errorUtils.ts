// ═══ FILE NÀY LÀM GÌ ═══
// Đổi message do apiClient ném khi route trả lỗi thành câu người dùng đọc hiểu được.
//
// Ai gọi tới: gần như mọi màn hình, ở chỗ bắt lỗi khi gọi mạng
// Nhận vào:   lỗi bắt được, danh mục ngôn ngữ, và câu dự phòng của màn hình
// Trả ra:     một câu tiếng Việt hoặc tiếng Anh để hiện lên màn hình
// Khi lỗi:    lỗi lạ không có trong danh sách thì dùng câu dự phòng,
//             nhờ vậy chi tiết kỹ thuật không bao giờ lọt ra giao diện
import type { Strings } from "@/i18n";

// Moi câu chữ ra khỏi lỗi. Lỗi không phải kiểu Error thì ép về chuỗi.
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

// Message trong response lỗi của các controller luôn bằng tiếng Anh, hữu ích cho log và test nhưng không
// hợp để hiện cho người dùng. Chỉ những câu ĐÃ BIẾT mới được dịch sang danh mục
// ngôn ngữ, còn lại đều dùng câu dự phòng của màn hình. Nhờ vậy lỗi kỹ thuật như
// tên bảng hay chuỗi kết nối database không bao giờ lọt ra giao diện.
export function getUserErrorMessage(error: unknown, t: Strings, fallback: string): string {
  const message = getErrorMessage(error);
  const known: Record<string, string> = {
    "Invalid email or password.": t.auth.invalidCredentials,
    "Please provide a valid email address.": t.auth.invalidEmail,
    "Invalid verification code.": t.auth.invalidOtp,
    "Invalid OTP.": t.auth.invalidOtp,
    "Verification code has expired. Please request a new one.": t.auth.otpExpired,
    "OTP has expired. Please request a new one.": t.auth.otpExpired,
    "Too many wrong attempts. Please request a new code.": t.auth.otpAttemptsExceeded,
    "Unable to create an account with this email.": t.auth.accountUnavailable,
    "Email already in use.": t.auth.accountUnavailable,
    "Could not send the code. Please try again shortly.": t.auth.failedSendOtp,
    "Current password is incorrect.": t.settings.currentPasswordIncorrect,
    "Password is incorrect.": t.settings.passwordIncorrect,
    "Invalid goal.": t.settings.invalidGoal,
  };
  return known[message] ?? fallback;
}
