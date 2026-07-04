// Shared helpers for the Community screens (feed, discover, user-profile)

// Compact relative time, e.g. "5m", "3h", "2d"
export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function initials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

export const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose weight",
  gain_muscle: "Gain muscle",
  eat_healthy: "Eat healthy",
};
