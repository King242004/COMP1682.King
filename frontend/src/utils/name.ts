// Two-letter initials from a display name, e.g. "John Doe" → "JD".
// Shared by Profile and every Community avatar fallback.
export function initials(name: string) {
  const p = (name || "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
