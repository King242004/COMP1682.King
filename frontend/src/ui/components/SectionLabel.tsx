// ═══ FILE NÀY LÀM GÌ ═══
// Nhãn nhỏ in hoa đứng trên mỗi nhóm nội dung.
//
// Ai gọi tới: các màn có nhiều nhóm nội dung
// Nhận vào:   chữ của nhãn
// Trả ra:     một dòng nhãn đã đúng cỡ và màu
// Khi lỗi:    không có nhánh lỗi
import { StyleSheet } from "react-native";
import { AppText } from "./AppText";

export function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="subtle" style={styles.label}>{children}</AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.6,
    marginBottom: -6, marginLeft: 4,
  },
});
