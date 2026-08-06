// ═══ FILE NÀY LÀM GÌ ═══
// Chọn bộ chữ tiếng Việt hay tiếng Anh theo ngôn ngữ đang dùng.
//
// Ai gọi tới: mọi màn hình, qua hook useT
// Nhận vào:   ngôn ngữ đang chọn
// Trả ra:     bộ chữ tương ứng, dùng bằng cách gọi t.nhom.khoa
// Khi lỗi:    chưa chọn ngôn ngữ thì lấy theo ngôn ngữ điện thoại
import { useAuth } from "@/features/auth/AuthContext";
import { resolveLanguage, type Lang } from "@/utils/languageUtils";
import { en, type Strings } from "./en";
import { vi } from "./vi";

export type { Strings, Lang };

const catalog: Record<Lang, Strings> = { en, vi };

// Chọn danh mục chuỗi theo ngôn ngữ đã lưu trong Settings.
// Nếu người dùng chưa chọn thì dùng ngôn ngữ thiết bị.
export function useT(): Strings {
  const { user, languagePreference } = useAuth();
  const lang = resolveLanguage(languagePreference ?? user?.language);
  return catalog[lang];
}
