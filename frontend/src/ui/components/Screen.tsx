import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
  type ViewStyle,
} from "react-native";
import { theme } from "../theme";

export function Screen({
  children,
  padded = true,
  keyboard = false,
  keyboardOffset = 0,
  backgroundColor,
  statusBarStyle = "dark-content",
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  keyboard?: boolean;
  keyboardOffset?: number; // chiều cao header phía trên (vd tab có AppHeader) để KAV bù đúng
  backgroundColor?: string;
  statusBarStyle?: "dark-content" | "light-content";
  style?: ViewStyle;
}) {
  const content = (
    <View style={{ flex: 1, backgroundColor: backgroundColor ?? theme.colors.bg }}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[{
        flex: 1,
        paddingHorizontal: padded ? theme.space.lg : 0,
        paddingTop: 0,
        paddingBottom: padded ? theme.space.lg : 0,
      }, style]}>
        {children}
      </View>
    </View>
  );

  if (!keyboard) return content;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      {content}
    </KeyboardAvoidingView>
  );
}