// Shared helpers for the Community screens (feed, discover, user-profile)
import type { Strings } from "@/i18n";
import { dateKey } from "@/utils/date";

// initials lives in a shared util — re-exported so Community imports stay local
export { initials } from "@/utils/name";

// Relative-time parts — the LABEL comes from the i18n catalog
// (t.community.timeAgoText) so "3d trước" mixed-language strings can't happen.
export type TimeAgoUnit = "now" | "m" | "h" | "d";
export function timeAgoParts(iso: string): { n: number; unit: TimeAgoUnit } {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return { n: 0, unit: "now" };
  if (s < 3600) return { n: Math.floor(s / 60), unit: "m" };
  if (s < 86400) return { n: Math.floor(s / 3600), unit: "h" };
  return { n: Math.floor(s / 86400), unit: "d" };
}

// Single time formatter for every community surface (feed tiles, post detail,
// notifications). Matches the app's own date style used by Coach and meal
// history: granular for recent, then "Yesterday", then a real date. A date in
// a different year carries the year so it can't be misread (Facebook / X style).
export function communityTime(iso: string, t: Strings): string {
  const parts = timeAgoParts(iso);
  if (parts.unit !== "d") return t.community.timeAgoText(parts.n, parts.unit);

  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (dateKey(d) === dateKey(yesterday)) return t.meals.yesterday;

  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, sameYear
    ? { month: "short", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric" });
}
