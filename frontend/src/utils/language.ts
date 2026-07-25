export type Lang = "vi" | "en";

// Detect device language via Intl (available in Hermes). Returns 'vi' or 'en'.
export function deviceLanguage(): Lang {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || "";
    return loc.toLowerCase().startsWith("vi") ? "vi" : "en";
  } catch {
    return "en";
  }
}

// Effective language: the user's saved choice if set, else the device language.
export function resolveLanguage(userLang?: string | null): Lang {
  if (userLang === "vi" || userLang === "en") return userLang;
  return deviceLanguage();
}

// BCP-47 locale tag for date/number formatting so dates follow the APP language
// (Settings), not the phone's locale (which showed English weekdays under a
// Vietnamese app).
export function localeTag(lang: Lang): string {
  return lang === "vi" ? "vi-VN" : "en-US";
}
