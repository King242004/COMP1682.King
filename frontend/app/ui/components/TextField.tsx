import { useMemo } from "react";
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
  const inputStyle = useMemo(
    () => ({
      height: 52,
      borderRadius: theme.radius.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.space.lg,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600" as const,
    }),
    [],
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
      />
    </View>
  );
}

