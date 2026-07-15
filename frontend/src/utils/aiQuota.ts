import type { Strings } from "@/i18n";

// Gemini free-tier daily quotas reset at midnight PACIFIC TIME — a fixed
// global mark (about 14:00-15:00 Vietnam time depending on DST), NOT 24 hours
// after the user's first request. Scan hour by hour for the next moment whose
// Pacific hour is 0, then floor to the top of that local hour.
export function nextAiResetLocal(): { date: Date; isToday: boolean } {
  const now = new Date();
  try {
    const ptHour = (d: Date) =>
      Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "2-digit",
          hour12: false,
        }).format(d)
      );
    for (let h = 1; h <= 26; h++) {
      const cand = new Date(now.getTime() + h * 3600e3);
      const hr = ptHour(cand);
      if (hr === 0 || hr === 24) {
        cand.setMinutes(0, 0, 0);
        return {
          date: cand,
          isToday: cand.getDate() === now.getDate() && cand.getMonth() === now.getMonth(),
        };
      }
    }
  } catch {
    // Intl timezone data unavailable → fall through to the fixed-offset guess
  }
  // Fallback: assume PST (UTC-8) → midnight PT = 08:00 UTC ("about" is fine)
  const cand = new Date(now);
  cand.setUTCHours(8, 0, 0, 0);
  if (cand.getTime() <= now.getTime()) cand.setUTCDate(cand.getUTCDate() + 1);
  return {
    date: cand,
    isToday: cand.getDate() === now.getDate() && cand.getMonth() === now.getMonth(),
  };
}

// "khoảng 14:00 hôm nay" / "around 14:00 tomorrow" — ready to drop into the
// quota messages (localized via the catalog).
export function aiResetWhen(t: Strings): string {
  const { date, isToday } = nextAiResetLocal();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return t.common.aiResetAt(time, isToday);
}
