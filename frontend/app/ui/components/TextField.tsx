import { useMemo, useState } from "react";
import {
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
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

  // Filled style: soft tinted background, border only lights up on focus
  const inputStyle = useMemo(
    () => ({
      height: 54,
      borderRadius: theme.radius.input,
      borderWidth: 1.5,
      borderColor: focused ? theme.colors.primary : "transparent",
      paddingHorizontal: theme.space.lg,
      backgroundColor: focused ? theme.colors.surface : "rgba(37,99,235,0.06)",
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600" as const,
    }),
    [focused],
  );

  return (
    <View style={[{ gap: 8 }, style]}>
      <AppText variant="caption" style={{ color: theme.colors.muted }}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.subtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        style={inputStyle}
        {...inputProps}
        onFocus={(e) => { setFocused(true); inputProps?.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); inputProps?.onBlur?.(e); }}
      />
    </View>
  );
}
