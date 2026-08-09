// ═══ FILE NÀY LÀM GÌ ═══
// Tính xem mấy giờ thì Gemini cấp lại lượt gọi miễn phí.
//
// Ai gọi tới: ScanScreen, CoachScreen, WeeklyPlanScreen khi scanController,
// coachController hoặc planController trả mã QUOTA
// Nhận vào:   thời điểm hiện tại
// Trả ra:     một câu nói rõ khi nào dùng lại được
// Khi lỗi:    không có nhánh lỗi
//
// Nhớ: Google cấp lại lượt vào nửa đêm giờ Thái Bình Dương, KHÔNG phải nửa đêm giờ mình.
//      Đó là lý do file này phải đổi múi giờ chứ không cộng trừ một con số cố định.
import type { Strings } from "@/i18n";

// Màn AI gọi thẳng vào đây khi bắt được chữ QUOTA. Chỉ tính tại máy, không gọi mạng.
// isToday để câu nói phân biệt hôm nay lúc 15:00 với ngày mai lúc 15:00
export function aiResetWhen(t: Strings): string {
  const { date, isToday } = nextAiResetLocal();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return t.common.aiResetAt(time, isToday);
}

// Tìm mốc nửa đêm giờ Thái Bình Dương kế tiếp, đổi về giờ máy người dùng
// Nằm dưới chỗ gọi được vì khai báo function được JavaScript kéo lên trước
function nextAiResetLocal(): { date: Date; isToday: boolean } {
  const now = new Date();
  try {
    // Đọc ra giờ của một thời điểm theo múi giờ Los Angeles.
    // Nhờ Intl làm hộ nên tự nó lo luôn chuyện đổi giờ mùa hè.
    const ptHour = (d: Date) =>
      Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "2-digit",
          hour12: false,
        }).format(d)
      );
    // Dò từng giờ một, tối đa 26 lượt, dừng ở giờ số 0
    // Dò 26 chứ không phải 24 để chừa cho ngày đổi giờ mùa hè dài 25 tiếng
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
    // Máy không có bảng múi giờ thì rơi xuống đường dự phòng ngay dưới.
  }
  // Đường dự phòng, lấy cứng 8 giờ sáng UTC, tức nửa đêm Thái Bình Dương mùa đông
  // Mùa hè lệch một tiếng, chấp nhận được vì đây chỉ là câu báo cho biết
  const cand = new Date(now);
  cand.setUTCHours(8, 0, 0, 0);
  if (cand.getTime() <= now.getTime()) cand.setUTCDate(cand.getUTCDate() + 1);
  return {
    date: cand,
    isToday: cand.getDate() === now.getDate() && cand.getMonth() === now.getMonth(),
  };
}
