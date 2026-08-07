// ═══ FILE NÀY LÀM GÌ ═══
// Vẽ vòng tròn tiến độ.
//
// Ai gọi tới: Trang chủ (vòng calo), Coach (vòng điểm sức khỏe)
// Nhận vào:   giá trị hiện tại và giá trị đích
// Trả ra:     một vòng tròn đã tô theo đúng tỷ lệ
// Khi lỗi:    vượt quá đích thì vòng dừng ở đầy, không vẽ tràn
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../theme";
import { AppText } from "./AppText";

// ══════════════════════════════════════════════════════════
// VẼ VÒNG
//
// Đến từ vòng calo ở Trang chủ và vòng điểm sức khỏe ở Coach.
// Ba bước, đọc từ trên xuống là đúng thứ tự. Không gọi mạng.
// Xong thì trả về một vòng SVG đã tô đúng tỷ lệ, kèm số phần trăm ở giữa.
// ══════════════════════════════════════════════════════════

// VẼ VÒNG BƯỚC 1. Nơi gọi đưa vào số đã ăn với số mục tiêu.
// size và stroke có sẵn giá trị mặc định nên chỗ nào cần vòng nhỏ mới phải truyền.
export function ProgressRing({
  eaten,
  goal,
  size = 116,
  stroke = 11,
  caption,
}: {
  eaten: number;
  goal: number;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  // VẼ VÒNG BƯỚC 2. Tính mấy số để vẽ.
  // Trừ stroke đi rồi mới chia đôi, vì nét vẽ ăn ra hai bên tâm đường tròn,
  // không trừ là vòng bị cắt cụt ở mép.
  const r = (size - stroke) / 2;
  // Chu vi. Cần vì SVG tô vòng bằng cách chia nét thành đoạn liền rồi đoạn hở,
  // muốn tô 40% thì đoạn liền phải dài đúng 40% chu vi.
  const circ = 2 * Math.PI * r;
  // Chặn trên ở 1, nên ăn vượt mục tiêu thì vòng dừng ở đầy chứ không vẽ đè vòng thứ hai.
  // Mục tiêu bằng 0 thì trả 0, tránh chia cho 0.
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const over = eaten > goal;
  // Vượt mục tiêu thì đổi đỏ. Đây là cách duy nhất báo vượt, vì vòng đã đầy sẵn rồi.
  const color = over ? theme.colors.danger : theme.colors.primary;
  // Cỡ chữ phần trăm thay đổi theo kích thước vòng tròn.
  const pctSize = Math.max(11, Math.round(size * 0.19));

  // VẼ VÒNG BƯỚC 3. Vẽ hai vòng chồng nhau: vòng nền mờ, rồi vòng tô đè lên.
  // rotation -90 để vạch bắt đầu nằm ở đỉnh chứ không nằm bên phải.
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(8,145,178,0.10)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText style={[styles.pct, { fontSize: pctSize, color }]}>
        {Math.round(progress * 100)}%
      </AppText>
      {caption ? <AppText variant="subtle" style={styles.caption}>{caption}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  pct: { fontWeight: "800" },
  caption: { fontSize: 10 },
});
