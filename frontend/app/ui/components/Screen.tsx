import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
  type ViewStyle,
} from "react-native";
import { theme } from "../theme";

export function Screen({
  children,
  padded = true,
  keyboard = false,
  backgroundColor,
  statusBarStyle = "dark-content",
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  keyboard?: boolean;
  backgroundColor?: string;
  statusBarStyle?: "dark-content" | "light-content";
  style?: ViewStyle;
}) {
  const content = (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor ?? theme.colors.bg }}
    >
      <StatusBar barStyle={statusBarStyle} />
      <View
        style={[
          {
            flex: 1,
            paddingHorizontal: padded ? theme.space.lg : 0,
            paddingTop: padded ? theme.space.lg : 0,
            paddingBottom: padded ? theme.space.lg : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );

  if (!keyboard) return content;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

