// ═══ FILE NÀY LÀM GÌ ═══
// Làm một con số chạy dần lên thay vì nhảy ngay sang giá trị mới.
//
// Ai gọi tới: Trang chủ, ở vòng calo
// Nhận vào:   giá trị đích
// Trả ra:     giá trị trung gian, đổi dần theo từng khung hình
// Khi lỗi:    rời màn giữa chừng thì hoạt ảnh tự dừng, không rò bộ nhớ
//
// Nhớ: app chạy nền là hệ điều hành ngưng cấp khung hình, nên phải có
//      bộ đếm chốt ở cuối file, kẻo số kẹt giữa đường.
import { useEffect, useRef, useState } from "react";

// Con số tự nhích dần từ giá trị cũ tới giá trị mới trong 450 ms.
// Bị ngắt giữa chừng thì lần sau đi tiếp từ số đang hiện, không giật về đầu
export function useAnimatedNumber(value: number, duration = 450): number {
  const [display, setDisplay] = useState(value);
  // Hai ref là bản sao của số đang hiện và của mã khung hình
  // Cần ref vì hàm vẽ ở dưới chỉ dựng một lần cho mỗi lượt chạy,
  // nó mà đọc state thường thì mãi thấy giá trị của lúc bắt đầu
  const displayRef = useRef(value);
  // Giữ mã của khung hình đang hẹn, để lúc dọn còn biết đường mà hủy.
  const rafRef = useRef<number | null>(null);

  // Chạy lại mỗi khi số đích đổi
  // Dọn cả hiệu ứng lẫn bộ đếm chốt khi component biến mất, để không chạy nền
  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;
    const start = Date.now();
    // Mỗi khung hình chạy một lần cho tới khi p chạm 1
    // eased là đường cong chậm dần, số lao nhanh lúc đầu rồi hãm lúc gần đích
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      const current = Math.round(from + (value - from) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // Lưới an toàn, chốt đúng số đích sau khi hết giờ
    // Cần vì app chạy nền thì hệ điều hành ngưng cấp khung hình, vòng lặp trên
    // đứng giữa chừng và số kẹt lỡ cỡ, vòng calo sẽ hiện sai
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
