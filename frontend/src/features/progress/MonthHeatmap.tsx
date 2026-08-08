// ═══ FILE NÀY LÀM GÌ ═══
// Lưới ô vuông cả tháng, ô càng đậm là ngày đó ăn càng nhiều calo.
//
// Ai gọi tới: ProgressScreen, ở chế độ xem Tháng
// Nhận vào:   calo từng ngày trong tháng
// Trả ra:     một lưới ô vuông đã tô màu theo mức calo
// Khi lỗi:    ngày chưa ghi món thì để ô trống, không tô màu 0

import { Pressable, StyleSheet, View } from "react-native";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export type HeatCell = { key: string; value: number; isFuture: boolean; isToday: boolean };

// Đổi mã màu dạng #RRGGBB sang dạng rgba có thêm độ mờ.
// Cần vì cả lưới chỉ dùng MỘT màu, ngày ăn nhiều thì đậm, ăn ít thì nhạt,
// mà muốn chỉnh độ nhạt thì phải tách được ba thành phần đỏ, lục, lam ra.
// slice(1) cắt dấu thăng, rồi dịch bit để lấy từng byte một.
function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ══════════════════════════════════════════════════════════
// VẼ LƯỚI THÁNG
//
// Đến từ màn Tiến trình ở chế độ xem Tháng. Ba bước, đọc từ trên xuống
// là đúng thứ tự. Không gọi mạng, dữ liệu do nơi gọi đưa xuống.
// Xong thì chạm một ô là nơi gọi hiện chi tiết ngày đó.
// ══════════════════════════════════════════════════════════

// VẼ LƯỚI BƯỚC 1. Nơi gọi đưa xuống các ô ngày, đã xếp từ ngày 1 tới cuối tháng.
// shade là màu nền của lưới, để tab Calo với tab Hoạt động dùng hai màu khác nhau.
export function MonthHeatmap({ cells: data, maxValue, selectedKey, onSelect, shade = theme.colors.primary }: {
  cells: HeatCell[];
  maxValue: number;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  shade?: string;
}) {
  const t = useT();
  // VẼ LƯỚI BƯỚC 2. Tìm xem ngày 1 rơi vào cột thứ mấy.
  // JavaScript đánh Chủ nhật là 0, Thứ hai là 1, mà lưới bắt đầu từ Thứ hai,
  // nên phải xoay bằng (thứ + 6) % 7 thì Thứ hai mới ra 0 còn Chủ nhật ra 6.
  const firstDow = data.length ? (new Date(data[0].key + "T00:00:00").getDay() + 6) % 7 : 0;
  // VẼ LƯỚI BƯỚC 3. Chèn bấy nhiêu ô null vào đầu để đẩy ngày 1 sang đúng cột.
  // Nơi vẽ thấy null thì chừa chỗ trống chứ không vẽ ô nào.
  const cells: (HeatCell | null)[] = [...Array(firstDow).fill(null), ...data];
  return (
    <View style={styles.wrap}>
      <View style={styles.weekHead}>
        {t.labels.daysShort.map((d, i) => (
          <AppText key={i} variant="subtle" style={styles.weekHeadCell}>{d}</AppText>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((s, i) => {
          if (!s) return <View key={`b${i}`} style={styles.cell} />;
          const dayNum = new Date(s.key + "T00:00:00").getDate();
          const hasData = s.value > 0;
          const intensity = hasData ? 0.18 + 0.62 * Math.min(s.value / maxValue, 1) : 0;
          const isSel = s.key === selectedKey;
          return (
            <Pressable key={s.key} onPress={() => onSelect(s.key)} disabled={s.isFuture} style={styles.cell}>
              <View style={[
                styles.cellBox,
                hasData && { backgroundColor: rgba(shade, intensity) },
                s.isFuture && styles.cellFuture,
                isSel && styles.cellSelected,
              ]}>
                <AppText style={[styles.cellNum, s.isFuture && styles.cellNumFuture, s.isToday && styles.cellNumToday]}>{dayNum}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  weekHead: { flexDirection: "row" },
  weekHeadCell: { width: "14.2857%", textAlign: "center", fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", padding: 2 },
  cellBox: {
    aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tintSoft,
  },
  cellFuture: { backgroundColor: "transparent" },
  cellSelected: { borderWidth: 2, borderColor: theme.colors.primary },
  cellNum: { fontSize: 11, color: theme.colors.text },
  cellNumFuture: { color: theme.colors.border },
  cellNumToday: { fontWeight: "800" },
});
