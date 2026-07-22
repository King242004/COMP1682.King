import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  View,
  type ViewStyle,
} from "react-native";
import { theme } from "../theme";

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
  keyboardOffset?: number; // chiều cao header phía trên (vd tab có AppHeader) để KAV bù đúng
  backgroundColor?: string;
  statusBarStyle?: "dark-content" | "light-content";
  style?: ViewStyle;
}) {
  const body = (
    <View style={[styles.root, { backgroundColor: backgroundColor ?? theme.colors.bg }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[styles.content, padded && styles.padded, style]}>
        {children}
      </View>
    </View>
  );

  if (!keyboard) return body;

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
