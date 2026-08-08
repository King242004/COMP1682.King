// ═══ FILE NÀY LÀM GÌ ═══
// Vẽ biểu đồ đường cân nặng theo thời gian.
//
// Ai gọi tới: WeightSection và ProgressScreen
// Nhận vào:   danh sách lần ghi cân nặng
// Trả ra:     một biểu đồ đường
// Khi lỗi:    dưới hai điểm thì không vẽ đường, chỉ hiện lời nhắc ghi thêm
//
// Nhớ: tự vẽ bằng SVG chứ KHÔNG dùng thư viện biểu đồ, để khỏi thêm phụ thuộc.
//      Cũng vì vậy mà phải tự đổi số kg ra tọa độ, xem BƯỚC 3 bên dưới.
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

// ══════════════════════════════════════════════════════════
// VẼ BIỂU ĐỒ CÂN
//
// Đến từ WeightSection và màn Tiến trình. Bốn bước, đọc từ trên xuống
// là đúng thứ tự. Không gọi mạng, chỉ tính tọa độ rồi vẽ.
// Xong thì ra một đường gấp khúc, kèm hai vạch mốc và một vạch mục tiêu.
// ══════════════════════════════════════════════════════════

// VẼ BIỂU ĐỒ BƯỚC 1. Nơi gọi đưa danh sách lần cân vào, đã xếp từ cũ tới mới.
// Nơi gọi cũng đã lo chuyện dưới hai điểm thì đừng gọi tới đây.
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

  // VẼ BIỂU ĐỒ BƯỚC 2. Tìm khoảng kg cần vẽ, tức số nhỏ nhất và lớn nhất.
  // Nhét cả cân mục tiêu vào rồi mới tìm, kẻo mục tiêu nằm ngoài khoảng
  // thì vạch mục tiêu bị vẽ tràn ra khỏi khung.
  const values = logs.map((l) => l.weightKg);
  const all = targetWeight ? [...values, targetWeight] : values;
  let min = Math.min(...all);
  let max = Math.max(...all);
  // Nới phạm vi khi dữ liệu quá phẳng để đường biểu đồ vẫn dễ nhìn.
  if (max - min < 2) { min -= 1; max += 1; }

  // VẼ BIỂU ĐỒ BƯỚC 3. Hai hàm đổi dữ liệu ra tọa độ điểm ảnh.
  // plotW với plotH là vùng vẽ thật, đã trừ lề trái dành cho nhãn kg.
  const plotW = width - PAD_X - 8;
  const plotH = H - PAD_Y * 2;
  // Trục ngang chia đều theo THỨ TỰ điểm, không theo ngày.
  // Nghĩa là cân cách nhau một ngày hay một tháng đều dãn bằng nhau.
  // Chỉ có một điểm thì đặt giữa, tránh chia cho 0 khi logs.length - 1 bằng 0.
  const x = (i: number) => PAD_X + (logs.length === 1 ? plotW / 2 : (i / (logs.length - 1)) * plotW);
  // Trục dọc phải LẬT NGƯỢC, vì trong SVG tọa độ 0 nằm ở trên cùng,
  // không lật thì cân nặng hơn lại vẽ thấp hơn, nhìn ngược hẳn.
  const y = (v: number) => PAD_Y + (1 - (v - min) / (max - min)) * plotH;

  // VẼ BIỂU ĐỒ BƯỚC 4. Ghép tọa độ thành chuỗi cho Polyline, kiểu "x1,y1 x2,y2 ...".
  const points = logs.map((l, i) => `${x(i)},${y(l.weightKg)}`).join(" ");
  // Điểm cuối được vẽ đậm hơn, vì đó là cân hiện tại.
  const last = logs[logs.length - 1];

  // Nhãn ngày dưới trục ngang, chỉ hiện ngày đầu với ngày cuối cho đỡ chật.
  const dLabel = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      {width > 0 && (
        <Svg width={width} height={H + 16}>
          {/* Hai vạch mốc trên dưới, kèm số kg ghi ở lề trái. */}
          {[max, min].map((v) => (
            <Line key={v} x1={PAD_X} y1={y(v)} x2={width - 8} y2={y(v)} stroke={theme.colors.border} strokeWidth={1} />
          ))}
          <SvgText x={4} y={y(max) + 4} fontSize={10} fill={theme.colors.subtle}>{Math.round(max)}</SvgText>
          <SvgText x={4} y={y(min) + 4} fontSize={10} fill={theme.colors.subtle}>{Math.round(min)}</SvgText>

          {/* Vạch cân mục tiêu, kẻ nét đứt màu xanh lá cho khác hẳn hai vạch mốc.
              Chưa đặt mục tiêu thì không vẽ gì cả. */}
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

          {/* Đường cân nặng, rồi chấm tròn ở từng lần cân.
              Chấm cuối to hơn và tô đặc, vì đó là cân hiện tại. */}
          <Polyline points={points} fill="none" stroke={theme.colors.primary} strokeWidth={2.5} strokeLinejoin="round" />
          {logs.map((l, i) => (
            <Circle key={l.id} cx={x(i)} cy={y(l.weightKg)} r={i === logs.length - 1 ? 5 : 3}
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
