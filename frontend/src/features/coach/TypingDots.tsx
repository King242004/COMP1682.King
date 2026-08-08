// ═══ FILE NÀY LÀM GÌ ═══
// Ba chấm chuyển động báo Coach đang soạn câu trả lời.
//
// Ai gọi tới: CoachScreen
// Nhận vào:   không nhận gì
// Trả ra:     hoạt ảnh ba chấm
// Khi lỗi:    không có nhánh lỗi

// Hiện ngay khi bấm gửi, thay bằng câu trả lời thật khi AI trả về.
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";

// ══════════════════════════════════════════════════════════
// BA CHẤM ĐANG GÕ
//
// Đến từ màn Coach, hiện ngay khi bấm gửi và biến mất khi AI trả lời xong.
// Hai bước, không gọi mạng, chỉ nhấp nháy tại chỗ.
// ══════════════════════════════════════════════════════════

// BA CHẤM BƯỚC 1. Ba giá trị độ mờ chạy được, cùng bắt đầu ở 0.3 tức mờ nhất.
// Để trong useRef nên vẽ lại bao nhiêu lần cũng vẫn là ba giá trị đó,
// chứ dựng mới mỗi lần là hiệu ứng nhảy về đầu liên tục.
export function TypingDots() {
  // Ba giá trị riêng, vì ba chấm sáng lệch pha nhau chứ không cùng nhịp.
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  // BA CHẤM BƯỚC 2. Chạy ba vòng lặp mờ tỏ, mỗi chấm trễ hơn chấm trước 160 ms.
  // Nhờ độ trễ đó mà ba chấm sáng nối đuôi nhau thay vì nhấp nháy cùng lúc.
  // Dòng return dọn cả ba vòng lặp khi component biến mất, kẻo chúng chạy nền mãi.
  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);
  return (
    <View style={styles.row}>
      {dots.map((v, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: v }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 5, paddingVertical: 2 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.subtle },
});
