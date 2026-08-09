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

// Hai hàm dưới đây sinh ra vì Be Vietnam Pro không phải một file font đổi được
// độ đậm, mà là NĂM file font riêng biệt. Ghi fontWeight suông thì Android bỏ qua,
// nên phải tự dịch ra đúng tên file.

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

// Lấy kiểu chữ nền theo variant
// muted và subtle không có sẵn trong theme.type nên mượn cỡ chữ body2
// với caption rồi đổi màu
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

  // Ép hai lớp style thành một rồi RÚT fontWeight ra khỏi đó
  // Bắt buộc phải rút, để lại là nó đè lên fontFamily và Android quay về
  // font hệ thống, chữ trông khác hẳn phần còn lại của app
  const { fontWeight, ...flat } = StyleSheet.flatten([base, style]) as TextStyle;
  const w = resolveWeight(fontWeight);
  const fontFamily = fontFamilyForWeight(w);

  // Gắn tên file font vào sau cùng để không bị lớp nào đè lên
  return <Text {...props} style={[flat, { fontFamily }]} />;
}
