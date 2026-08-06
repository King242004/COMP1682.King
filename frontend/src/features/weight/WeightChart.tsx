// Biểu đồ đường cân nặng theo thời gian.
// Vẽ bằng View thường chứ không dùng thư viện biểu đồ, để không thêm phụ thuộc.
import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { theme } from "@/ui/theme";
import type { WeightEntry } from "./weightApi";

// Chiều cao của biểu đồ SVG.
const H = 160;
// Khoảng bên trái dành cho nhãn kg.
const PAD_X = 34;
// Khoảng trống phía trên và dưới đường biểu đồ.
const PAD_Y = 18;

export function WeightChart({ logs, targetWeight, locale }: {
  // Dữ liệu từ cũ đến mới. Component cha đảm bảo có ít nhất hai điểm.
  logs: WeightEntry[];
  targetWeight: number | null;
  // Ngôn ngữ dùng để định dạng nhãn ngày.
  locale?: string;
}) {
  const [width, setWidth] = useState(0);
  // Đo bề rộng thật của khung sau khi vẽ xong,
  // để tính tỷ lệ các điểm trên biểu đồ cho khớp mọi cỡ màn hình.
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const values = logs.map((l) => l.weightKg);
  const all = targetWeight ? [...values, targetWeight] : values;
  let min = Math.min(...all);
  let max = Math.max(...all);
  // Nới phạm vi khi dữ liệu quá phẳng để đường biểu đồ vẫn dễ nhìn.
  if (max - min < 2) { min -= 1; max += 1; }

  const plotW = width - PAD_X - 8;
  const plotH = H - PAD_Y * 2;
  const x = (i: number) => PAD_X + (logs.length === 1 ? plotW / 2 : (i / (logs.length - 1)) * plotW);
  const y = (v: number) => PAD_Y + (1 - (v - min) / (max - min)) * plotH;

  const points = logs.map((l, i) => `${x(i)},${y(l.weightKg)}`).join(" ");
  const last = logs[logs.length - 1];

  const dLabel = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      {width > 0 && (
        <Svg width={width} height={H + 16}>
          {/* min/max gridlines + kg labels */}
          {[max, min].map((v) => (
            <Line key={v} x1={PAD_X} y1={y(v)} x2={width - 8} y2={y(v)} stroke={theme.colors.border} strokeWidth={1} />
          ))}
          <SvgText x={4} y={y(max) + 4} fontSize={10} fill={theme.colors.subtle}>{Math.round(max)}</SvgText>
          <SvgText x={4} y={y(min) + 4} fontSize={10} fill={theme.colors.subtle}>{Math.round(min)}</SvgText>

          {/* Target — dashed green line */}
          {targetWeight != null && (
            <>
              <Line
                x1={PAD_X} y1={y(targetWeight)} x2={width - 8} y2={y(targetWeight)}
                stroke={theme.colors.accent} strokeWidth={1.5} strokeDasharray="5,4"
              />
              <SvgText x={4} y={y(targetWeight) + 4} fontSize={10} fill={theme.colors.accent}>
                {Math.round(targetWeight)}
              </SvgText>
            </>
          )}

          {/* Journey line + latest point highlighted */}
          <Polyline points={points} fill="none" stroke={theme.colors.primary} strokeWidth={2.5} strokeLinejoin="round" />
          {logs.map((l, i) => (
            <Circle key={l._id} cx={x(i)} cy={y(l.weightKg)} r={i === logs.length - 1 ? 5 : 3}
              fill={i === logs.length - 1 ? theme.colors.primary : theme.colors.surface}
              stroke={theme.colors.primary} strokeWidth={2}
            />
          ))}

          <SvgText x={PAD_X} y={H + 10} fontSize={10} fill={theme.colors.subtle}>{dLabel(logs[0].date)}</SvgText>
          <SvgText x={width - 8} y={H + 10} fontSize={10} fill={theme.colors.subtle} textAnchor="end">
            {dLabel(last.date)}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
});
