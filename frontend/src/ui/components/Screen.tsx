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

// ══════════════════════════════════════════════════════════
// DỰNG KHUNG MÀN
//
// Đến từ gần như mọi màn. Ba bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì nội dung của màn nằm gọn trong khung này.
// ══════════════════════════════════════════════════════════

// DỰNG KHUNG MÀN BƯỚC 1. Nhận nội dung màn với mấy công tắc.
// padded bật sẵn nên màn nào cũng có lề hai bên, màn nào cần tràn viền thì tắt đi.
// keyboard tắt sẵn, chỉ màn nào có ô nhập mới bật.
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
  // DỰNG KHUNG MÀN BƯỚC 2. Phần ruột: nền, thanh trạng thái, rồi tới lề.
  // Dựng sẵn ra biến chứ chưa trả về, vì BƯỚC 3 còn bọc thêm mấy lớp nữa.
  const body = (
    <View style={[styles.root, { backgroundColor: backgroundColor ?? theme.colors.bg }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[styles.content, padded && styles.padded, style]}>
        {children}
      </View>
    </View>
  );

  // DỰNG KHUNG MÀN BƯỚC 3. Màn không có ô nhập thì trả luôn, hết.
  // Bọc thừa KeyboardAvoidingView cho màn không cần chỉ tổ tốn một lớp view.
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
