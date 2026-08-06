// Khối xám nhấp nháy hiện trong lúc chờ dữ liệu về.
// Dùng thay vòng xoay để bố cục không nhảy khi dữ liệu về.
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type DimensionValue } from "react-native";

// Thanh giữ chỗ nhấp nháy để người dùng biết nội dung vẫn đang được tải.
export function Skeleton({
  width = "100%",
  height = 12,
  radius = 6,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;
  // Chạy hiệu ứng mờ tỏ lặp lại, và dừng khi component biến mất.
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
