// ═══ FILE NÀY LÀM GÌ ═══
// Giữ phần style mà màn Thêm món và màn Sửa món dùng CHUNG.
//
// Ai gọi tới: AddMealScreen, EditMealScreen
// Nhận vào:   không nhận gì, đây là bảng style khai sẵn
// Trả ra:     các khối style của thẻ form một món
// Khi lỗi:    không có nhánh lỗi
//
// Vì sao tách ra: hai màn có cùng một thẻ form gồm ba ô chữ, bốn ô số, nút Ước
// tính và nút gõ tay. Trước ngày 9/8/2026 mười khối style dưới đây bị chép y hệt
// ở cả hai file, nên sửa bố cục thẻ form một bên là hai màn trông khác nhau.
//
// Nhớ: chỉ để ở đây thứ CẢ HAI màn cùng dùng. Style riêng của từng màn, ví dụ
//      nút Xóa ở màn Sửa hay dải báo nguồn ở màn Thêm, vẫn nằm trong file màn đó.
import { StyleSheet } from "react-native";
import { theme } from "@/ui/theme";

export const mealFormStyles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  actions: { gap: 10 },
  pressed: { opacity: 0.65 },
  formCard: { padding: theme.space.xl },
  formFields: { gap: theme.space.md },
  fieldWrap: { gap: 4 },
  detailsInput: { paddingTop: 6 },
  fieldHint: { fontSize: 12, lineHeight: 18 },
  manualButton: {
    minHeight: 46, borderRadius: theme.radius.button, backgroundColor: theme.colors.tint,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  itemActions: { gap: theme.space.sm },
  actionText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700" },
  error: { fontSize: 12, color: theme.colors.danger },
});
