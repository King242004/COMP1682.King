export type Lang = "vi" | "en";

// Phát hiện ngôn ngữ thiết bị bằng Intl của Hermes và trả về vi hoặc en.
export function deviceLanguage(): Lang {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || "";
    return loc.toLowerCase().startsWith("vi") ? "vi" : "en";
  } catch {
    return "en";
  }
}

// Ưu tiên ngôn ngữ người dùng đã lưu, nếu chưa có thì dùng ngôn ngữ thiết bị.
export function resolveLanguage(userLang?: string | null): Lang {
  if (userLang === "vi" || userLang === "en") return userLang;
  return deviceLanguage();
}

// Tạo mã locale BCP-47 để ngày và số đi theo ngôn ngữ trong Settings.
// Không dùng locale điện thoại vì có thể làm app tiếng Việt hiện thứ bằng tiếng Anh.
export function localeTag(lang: Lang): string {
  return lang === "vi" ? "vi-VN" : "en-US";
}
