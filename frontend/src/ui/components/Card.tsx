// ═══ FILE NÀY LÀM GÌ ═══
// Khung thẻ bo góc có đổ bóng nhẹ, dùng để nhóm nội dung lại với nhau.
//
// Ai gọi tới: hầu hết các màn có chia khối nội dung
// Nhận vào:   nội dung muốn bọc bên trong
// Trả ra:     một khung thẻ đã đúng bo góc và bóng của app
// Khi lỗi:    không có nhánh lỗi
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { shadow, theme } from "../theme";

export function Card({
  style,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          // Viền mặc định trong suốt, thẻ nhấn mạnh vẫn có thể truyền borderColor riêng.
          borderWidth: 1,
          borderColor: "transparent",
          padding: theme.space.lg,
          ...shadow(1),
        },
        style,
      ]}
    />
  );
}
