import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "../theme";
import { AppText } from "./AppText";

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  textContentType,
  returnKeyType,
  style,
  inputProps,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  textContentType?: TextInputProps["textContentType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  style?: ViewStyle;
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;
}) {
  const [focused, setFocused] = useState(false);
// Ô mật khẩu có sẵn nút con mắt nên mọi nơi sử dụng đều có thể hiện hoặc ẩn mật khẩu.
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.field, style]}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.subtle}
          secureTextEntry={secureTextEntry ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          style={[
            styles.input,
            focused ? styles.inputFocused : styles.inputIdle,
            secureTextEntry && styles.inputSecure,
          ]}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps?.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps?.onBlur?.(event);
          }}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={10}
            style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.subtle} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: theme.colors.muted },
  inputWrap: { justifyContent: "center" },
  input: {
    height: 54,
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    paddingHorizontal: theme.space.lg,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  inputIdle: {
    borderColor: "transparent",
    backgroundColor: "rgba(8,145,178,0.06)",
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  inputSecure: { paddingRight: 48 },
  eyeButton: { position: "absolute", right: 16 },
  pressed: { opacity: 0.5 },
});
