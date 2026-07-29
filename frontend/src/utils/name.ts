export function initials(name: string) {
  const p = (name || "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
