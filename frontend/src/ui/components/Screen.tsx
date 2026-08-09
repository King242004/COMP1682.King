// ═══ FILE NÀY LÀM GÌ ═══
// Khung nền chung của mọi màn hình, lo màu nền, lề an toàn và tránh bàn phím.
//
// Ai gọi tới: gần như mọi màn hình
// Nhận vào:   nội dung màn hình
// Trả ra:     màn đã có nền, đã tránh tai thỏ và tránh bàn phím che ô nhập
// Khi lỗi:    không có nhánh lỗi
import { ReactNode } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, TouchableWithoutFeedback, View, type ViewStyle } from "react-native";
import { theme } from "../theme";

// padded bật sẵn nên màn nào cũng có lề, màn cần tràn viền thì tắt đi
// keyboard tắt sẵn, chỉ màn nào có ô nhập mới bật
export function Screen({
  children,
  padded = true,
  keyboard = false,
  keyboardOffset = 0,
  dismissKeyboardOnTap = true,
  backgroundColor,
  statusBarStyle = "dark-content",
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  keyboard?: boolean;
  dismissKeyboardOnTap?: boolean;
  keyboardOffset?: number;
  backgroundColor?: string;
  statusBarStyle?: "dark-content" | "light-content";
  style?: ViewStyle;
}) {
  // Phần ruột gồm nền, thanh trạng thái rồi tới lề
  // Dựng ra biến chứ chưa trả về, vì đoạn dưới còn bọc thêm mấy lớp nữa
  const body = (
    <View style={[styles.root, { backgroundColor: backgroundColor ?? theme.colors.bg }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[styles.content, padded && styles.padded, style]}>
        {children}
      </View>
    </View>
  );

  // Màn không có ô nhập thì trả luôn, khỏi tốn thêm một lớp view thừa
  if (!keyboard) return body;

  // Còn màn có ô nhập thì bọc hai lớp: lớp trong bắt chạm ra ngoài để đóng bàn phím,
  // lớp ngoài đẩy nội dung lên cho bàn phím khỏi che ô đang gõ.
  // Nhớ: chỉ iOS mới cần behavior="padding". Android tự lo, ép vào là bố cục nhảy.
  const keyboardContent = dismissKeyboardOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {body}
    </TouchableWithoutFeedback>
  ) : body;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      {keyboardContent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  padded: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.lg,
  },
});
