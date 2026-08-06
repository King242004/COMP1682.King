// ═══ FILE NÀY LÀM GÌ ═══
// Quyết định app hiện tiếng Việt hay tiếng Anh.
//
// Ai gọi tới: i18n/index, ScanScreen, CoachScreen, WeeklyPlanScreen
// Nhận vào:   ngôn ngữ đã lưu trong hồ sơ, nếu có
// Trả ra:     vi hoặc en
// Khi lỗi:    chưa chọn thì lấy theo ngôn ngữ điện thoại, không mặc định cứng
// Thứ tự ưu tiên: ngôn ngữ người dùng chọn trong Cài đặt,
// chưa chọn thì lấy theo ngôn ngữ điện thoại.
// Ngôn ngữ này đi theo mọi lệnh gọi AI, để Coach và Quét ảnh trả đúng tiếng.
export type Lang = "vi" | "en";

// Phát hiện ngôn ngữ thiết bị bằng Intl của Hermes và trả về vi hoặc en.
function deviceLanguage(): Lang {
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
