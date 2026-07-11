// Parse a user-typed number accepting BOTH decimal separators ("12.5" and
// "12,5") — Vietnamese keyboards give a comma on the iOS decimal pad.
export function parseDecimal(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}
