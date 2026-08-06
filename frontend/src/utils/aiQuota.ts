// File này tính giờ Gemini cấp lại lượt gọi miễn phí.
// Nơi dùng: khi backend trả chữ QUOTA, các màn AI hiện câu này
// để người dùng biết khi nào dùng lại được.
import type { Strings } from "@/i18n";

function nextAiResetLocal(): { date: Date; isToday: boolean } {
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
  }
  const cand = new Date(now);
  cand.setUTCHours(8, 0, 0, 0);
  if (cand.getTime() <= now.getTime()) cand.setUTCDate(cand.getUTCDate() + 1);
  return {
    date: cand,
    isToday: cand.getDate() === now.getDate() && cand.getMonth() === now.getMonth(),
  };
}

export function aiResetWhen(t: Strings): string {
  const { date, isToday } = nextAiResetLocal();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return t.common.aiResetAt(time, isToday);
}
