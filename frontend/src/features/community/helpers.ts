// Shared helpers for the Community screens (feed, discover, user-profile)

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
