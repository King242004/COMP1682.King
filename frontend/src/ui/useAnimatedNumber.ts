import { useEffect, useRef, useState } from "react";

// Chạy số đang hiển thị dần tới value trong khoảng 450 ms.
// Các chỉ số lớn như kcal nhờ đó đổi mượt thay vì nhảy ngay sang số mới.
// Nếu bị ngắt giữa chừng thì hiệu ứng tiếp tục từ số đang hiển thị.
export function useAnimatedNumber(value: number, duration = 450): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (value - from) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // Đảm bảo luôn chốt đúng giá trị cuối nếu rAF bị tạm dừng khi app chạy nền.
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
