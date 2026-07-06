import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolveLanguage, type Lang } from "@/utils/language";
import { en, type Strings } from "./en";
import { vi } from "./vi";

export type { Strings, Lang };

const catalog: Record<Lang, Strings> = { en, vi };

// Active-language string catalog. Reacts to the user's saved language
// (Settings) and falls back to the device language when unset.
export function useT(): Strings {
  const { user } = useAuth();
  const lang = resolveLanguage(user?.language);
  return useMemo(() => catalog[lang], [lang]);
}

// Non-hook accessor for the rare place outside React (defaults to device lang).
export function getStrings(lang: Lang): Strings {
  return catalog[lang];
}
