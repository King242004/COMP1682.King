import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

type ProgressRingProps = {
  size: number;
  thickness: number;
  percent: number;
  color: string;
  // Màu vòng nền (không bắt buộc); mặc định xám, trên nền xanh thì dùng trắng mờ
  trackColor?: string;
  // Chữ hoặc số đặt ở giữa vòng (không bắt buộc)
  children?: ReactNode;
};

// Vòng tròn tiến độ: vòng nền, cung màu dài theo phần trăm (tối đa 100%), bắt đầu từ đỉnh
export function ProgressRing({ size, thickness, percent, color, trackColor, children }: ProgressRingProps) {
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Giữ phần trăm trong khoảng 0 tới 100 rồi đổi ra độ dài cung
  let validPercent = percent;
  if (validPercent < 0) {
    validPercent = 0;
  }
  if (validPercent > 100) {
    validPercent = 100;
  }
  const arcLength = (circumference * validPercent) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor ?? colors.border} strokeWidth={thickness} fill="none" />
        {/* Chưa có gì thì không vẽ cung, tránh hiện một chấm tròn */}
        {arcLength > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        ) : null}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
