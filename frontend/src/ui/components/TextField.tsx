import { useMemo, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  // Secure fields get a built-in eye toggle — every password input in the app
  // inherits it without changes at the call site.
  const [hidden, setHidden] = useState(true);

  // Filled style: soft tinted background, border only lights up on focus
  const inputStyle = useMemo(
    () => ({
      height: 54,
      borderRadius: theme.radius.input,
      borderWidth: 1.5,
      borderColor: focused ? theme.colors.primary : "transparent",
      paddingHorizontal: theme.space.lg,
      backgroundColor: focused ? theme.colors.surface : "rgba(8,145,178,0.06)",
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
      <View style={{ justifyContent: "center" }}>
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
          style={[inputStyle, secureTextEntry ? { paddingRight: 48 } : null]}
          {...inputProps}
          onFocus={(e) => { setFocused(true); inputProps?.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); inputProps?.onBlur?.(e); }}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={10}
            style={({ pressed }) => ({ position: "absolute", right: 16, opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.subtle} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
