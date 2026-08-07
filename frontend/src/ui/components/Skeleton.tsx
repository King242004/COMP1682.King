// ═══ FILE NÀY LÀM GÌ ═══
// Khối xám nhấp nháy hiện trong lúc chờ dữ liệu về.
//
// Ai gọi tới: Trang chủ, Tiến trình, Cộng đồng, Kế hoạch tuần
// Nhận vào:   kích thước khối cần chiếm chỗ
// Trả ra:     một khối xám nhấp nháy
// Khi lỗi:    không có nhánh lỗi
//
// Nhớ: truyền đúng cỡ của nội dung thật, kẻo dữ liệu về là bố cục giật một nhịp.
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type DimensionValue } from "react-native";

// ══════════════════════════════════════════════════════════
// NHẤP NHÁY
//
// Đến từ mấy màn có chờ dữ liệu. Ba bước, đọc từ trên xuống là đúng thứ tự.
// Không gọi mạng, chỉ nhấp nháy tại chỗ cho tới khi nơi gọi bỏ nó đi.
// Dùng thay vòng xoay để bố cục không nhảy một cái khi dữ liệu về.
// ══════════════════════════════════════════════════════════

// NHẤP NHÁY BƯỚC 1. Nơi gọi đưa vào kích thước khối cần giữ chỗ.
// Nên truyền đúng cỡ của nội dung thật, kẻo dữ liệu về là bố cục giật một nhịp.
export function Skeleton({
  width = "100%",
  height = 12,
  radius = 6,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}) {
  // NHẤP NHÁY BƯỚC 2. Độ mờ chạy được, bắt đầu ở 0.35 tức mờ nhất.
  // Để trong useRef nên vẽ lại bao nhiêu lần cũng vẫn là một giá trị đó,
  // chứ dựng mới mỗi lần là hiệu ứng nhảy về đầu liên tục.
  const opacity = useRef(new Animated.Value(0.35)).current;
  // NHẤP NHÁY BƯỚC 3. Chạy vòng lặp mờ rồi tỏ, mỗi chiều 650 ms, lặp mãi.
  // Dòng return ở cuối dừng vòng lặp khi component biến mất, kẻo nó chạy nền hoài.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.placeholder, { width, height, borderRadius: radius, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: "rgba(15,23,42,0.08)" },
});
