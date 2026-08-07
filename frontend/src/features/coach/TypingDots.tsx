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

export function TypingDots() {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  // Chạy hiệu ứng ba chấm khi component xuất hiện.
  // Dọn hiệu ứng khi biến mất để không chạy nền vô ích.
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
