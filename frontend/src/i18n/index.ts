import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolveLanguage, type Lang } from "@/utils/language";
import { en, type Strings } from "./en";
import { vi } from "./vi";

export type { Strings, Lang };

const catalog: Record<Lang, Strings> = { en, vi };

// Chọn danh mục chuỗi theo ngôn ngữ đã lưu trong Settings.
// Nếu người dùng chưa chọn thì dùng ngôn ngữ thiết bị.
export function useT(): Strings {
  const { user } = useAuth();
  const lang = resolveLanguage(user?.language);
  return useMemo(() => catalog[lang], [lang]);
}

// Hàm lấy bản dịch bên ngoài React, mặc định theo ngôn ngữ thiết bị.
export function getStrings(lang: Lang): Strings {
  return catalog[lang];
}
