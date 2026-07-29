import type { Strings } from "@/i18n";
import { dateKey } from "@/utils/date";

export { initials } from "@/utils/name";

export type TimeAgoUnit = "now" | "m" | "h" | "d";
export function timeAgoParts(iso: string): { n: number; unit: TimeAgoUnit } {
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
