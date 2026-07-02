import { useEffect, useRef } from "react";
import { Animated, type DimensionValue } from "react-native";

// Pulsing placeholder bar shown while async content loads (UX rule: any wait
// over ~300ms needs visible feedback, not a frozen/empty layout).
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
      style={{ width, height, borderRadius: radius, backgroundColor: "rgba(15,23,42,0.08)", opacity }}
    />
  );
}
