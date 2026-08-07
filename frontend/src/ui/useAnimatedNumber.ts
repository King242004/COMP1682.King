// ═══ FILE NÀY LÀM GÌ ═══
// Làm một con số chạy dần lên thay vì nhảy ngay sang giá trị mới.
//
// Ai gọi tới: Trang chủ, ở vòng calo
// Nhận vào:   giá trị đích
// Trả ra:     giá trị trung gian, đổi dần theo từng khung hình
// Khi lỗi:    rời màn giữa chừng thì hoạt ảnh tự dừng, không rò bộ nhớ
//
// Nhớ: app chạy nền là hệ điều hành ngưng cấp khung hình, nên phải có
//      bộ đếm chốt ở BƯỚC 5, kẻo số kẹt giữa đường.
import { useEffect, useRef, useState } from "react";

// ══════════════════════════════════════════════════════════
// CHẠY SỐ
//
// Đến từ vòng calo ở Trang chủ. Năm bước, đọc từ trên xuống là đúng thứ tự.
// Không gọi mạng, chỉ vẽ lại liên tục trong 450 ms rồi thôi.
// Xong thì nơi gọi cứ đọc số trả về mà hiện, số tự nhích dần.
// ══════════════════════════════════════════════════════════

// CHẠY SỐ BƯỚC 1. Nơi gọi đưa số đích vào đây.
// Bị ngắt giữa chừng thì lần chạy sau đi tiếp từ số đang hiện, không giật về đầu.
export function useAnimatedNumber(value: number, duration = 450): number {
  const [display, setDisplay] = useState(value);
  // CHẠY SỐ BƯỚC 2. Hai ref này là bản sao của số đang hiện và của mã khung hình.
  // Cần ref vì hàm vẽ ở dưới chỉ được dựng một lần cho mỗi lượt chạy,
  // nó mà đọc state thường thì mãi thấy giá trị của lúc bắt đầu.
  const displayRef = useRef(value);
  // Giữ mã của khung hình đang hẹn, để lúc dọn còn biết đường mà hủy.
  const rafRef = useRef<number | null>(null);

  // CHẠY SỐ BƯỚC 3. Chạy lại mỗi khi số đích đổi. Dọn cả hiệu ứng lẫn bộ đếm chốt
  // khi component biến mất, để không chạy nền.
  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;
    const start = Date.now();
    // CHẠY SỐ BƯỚC 4. Mỗi khung hình chạy một lần cho tới khi p chạm 1.
    // eased là đường cong chậm dần, nên số lao nhanh lúc đầu rồi hãm lại lúc gần đích.
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      const current = Math.round(from + (value - from) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // CHẠY SỐ BƯỚC 5. Lưới an toàn, chốt đúng số đích sau khi hết giờ.
    // Cần vì app chạy nền thì hệ điều hành ngưng cấp khung hình, BƯỚC 4 đứng giữa chừng
    // và số kẹt ở một giá trị lỡ cỡ. Không có dòng này là vòng calo hiện sai.
    const settle = setTimeout(() => {
      if (displayRef.current !== value) {
        displayRef.current = value;
        setDisplay(value);
      }
    }, duration + 150);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearTimeout(settle);
    };
  }, [value, duration]);

  return display;
}
