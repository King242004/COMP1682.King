// ═══ FILE NÀY LÀM GÌ ═══
// Thẻ chữ dùng chung cho toàn app, thay cho Text của React Native.
//
// Ai gọi tới: mọi màn hình và mọi component có chữ
// Nhận vào:   nội dung chữ và kiểu muốn dùng
// Trả ra:     một dòng chữ đã đúng font Be Vietnam Pro và đúng màu
// Khi lỗi:    không có nhánh lỗi
//
// Nhờ file này mà đổi kiểu chữ một chỗ là cả app đổi theo.
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { theme } from "../theme";

type Variant =
  | "h0"
  | "h1"
  | "h2"
  | "body"
  | "body2"
  | "caption"
  | "muted"
  | "subtle";

// ══════════════════════════════════════════════════════════
// HAI HÀM DỊCH ĐỘ ĐẬM
//
// Không phải luồng, chỉ là hai hàm nhỏ, cả hai đều được gọi
// ở khối DỰNG CHỮ bên dưới. Sinh ra vì Be Vietnam Pro không phải
// một file font đổi được độ đậm, mà là NĂM file font riêng biệt.
// Ghi fontWeight suông thì Android bỏ qua, nên phải tự dịch ra đúng tên file.
// ══════════════════════════════════════════════════════════

// Đưa mọi cách ghi độ đậm về một con số.
// React Native cho ghi "bold", "normal", số, hoặc bỏ trống, nên phải gom hết lại.
function resolveWeight(w: TextStyle["fontWeight"]): number {
  if (w === "bold") return 700;
  if (w === "normal" || w == null) return 400;
  return Number(w) || 400;
}

// Số đậm ra tên file font. So từ đậm nhất xuống, nên số lẻ như 750 rơi vào 700.
function fontFamilyForWeight(w: number) {
  if (w >= 800) return "BeVietnamPro_800ExtraBold";
  if (w >= 700) return "BeVietnamPro_700Bold";
  if (w >= 600) return "BeVietnamPro_600SemiBold";
  if (w >= 500) return "BeVietnamPro_500Medium";
  return "BeVietnamPro_400Regular";
}

// ══════════════════════════════════════════════════════════
// DỰNG CHỮ
//
// Đến từ mọi chỗ có chữ trong app. Ba bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì trả về Text của React Native đã gắn sẵn tên file font đúng.
// ══════════════════════════════════════════════════════════

// DỰNG CHỮ BƯỚC 1. Lấy kiểu chữ nền theo variant.
// muted với subtle không có sẵn trong theme.type nên phải ghép tay,
// mượn cỡ chữ của body2 và caption rồi đổi màu.
export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const base: TextStyle = {
    color: theme.colors.text,
    ...(variant === "muted"
      ? { ...theme.type.body2, color: theme.colors.muted }
      : variant === "subtle"
        ? { ...theme.type.caption, color: theme.colors.subtle }
        : theme.type[variant]),
  };

  // DỰNG CHỮ BƯỚC 2. Ép hai lớp style thành một rồi RÚT fontWeight ra khỏi đó.
  // Nhớ: bắt buộc phải rút ra. Để fontWeight lại là nó đè lên fontFamily,
  // Android quay về font hệ thống và chữ trông khác hẳn phần còn lại của app.
  const { fontWeight, ...flat } = StyleSheet.flatten([base, style]) as TextStyle;
  const w = resolveWeight(fontWeight);
  const fontFamily = fontFamilyForWeight(w);

  // DỰNG CHỮ BƯỚC 3. Trả chữ ra, gắn tên file font vào sau cùng.
  return <Text {...props} style={[flat, { fontFamily }]} />;
}
