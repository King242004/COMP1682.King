// File này chọn bộ chữ theo ngôn ngữ đang dùng.
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
