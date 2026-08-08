// ═══ FILE NÀY LÀM GÌ ═══
// Các hàm nhỏ dùng chung cho màn Cộng đồng, chính là đổi thời gian đăng thành chữ dễ đọc.
//
// Ai gọi tới: PostTile, PostDetailScreen, NotificationsScreen
// Nhận vào:   mốc thời gian đăng bài
// Trả ra:     chữ kiểu 3 phút trước, 2 giờ trước
// Khi lỗi:    không có nhánh lỗi

// Việc chính là đổi thời gian đăng bài thành chữ dễ đọc.
import type { Strings } from "@/i18n";
import { dateKey } from "@/utils/dateUtils";

export { initials } from "@/utils/nameUtils";

export type TimeAgoUnit = "now" | "m" | "h" | "d";

export function resolvedFollowState(
  overrides: Record<string, boolean>,
  user: { id: string; isFollowing?: boolean },
): boolean {
  return overrides[user.id] ?? user.isFollowing ?? false;
}

export function mealPortionLabel(meal: {
  portionAmount?: number | null;
  portionUnit?: string;
  portionText?: string;
}): string | null {
  const text = meal.portionText?.trim();
  if (text) return text;
  const amount = meal.portionAmount;
  const unit = meal.portionUnit?.trim();
  if (amount != null && unit) return `${amount} ${unit}`;
  if (amount != null) return String(amount);
  return unit || null;
}

// ══════════════════════════════════════════════════════════
// ĐỔI DỮ LIỆU RA CHỮ ĐỂ HIỆN
//
// Không phải luồng. Mấy hàm nhỏ đổi dữ liệu thô thành chữ cho người đọc.
// Gọi cái nào cũng được, không cái nào gọi mạng.
// ══════════════════════════════════════════════════════════

// Đổi mốc thời gian thành cặp số với đơn vị, kiểu 5 với "m".
// Chỉ trả số thô, KHÔNG ghép chữ, vì việc ghép chữ tùy ngôn ngữ nên để hàm dưới lo.
// Bốn mốc: dưới 1 phút là "vừa xong", rồi tới phút, giờ, ngày. Không có tuần hay tháng,
// bài cũ hơn một tháng vẫn hiện kiểu "45d".
function timeAgoParts(iso: string): { n: number; unit: TimeAgoUnit } {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return { n: 0, unit: "now" };
  if (s < 3600) return { n: Math.floor(s / 60), unit: "m" };
  if (s < 86400) return { n: Math.floor(s / 3600), unit: "h" };
  return { n: Math.floor(s / 86400), unit: "d" };
}

export function communityTime(iso: string, t: Strings, locale?: string): string {
  const parts = timeAgoParts(iso);
  if (parts.unit !== "d") return t.community.timeAgoText(parts.n, parts.unit);

  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (dateKey(d) === dateKey(yesterday)) return t.meals.yesterday;

  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(locale, sameYear
    ? { month: "short", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric" });
}
