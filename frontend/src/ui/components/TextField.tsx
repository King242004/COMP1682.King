// Ô nhập dùng chung cho toàn app.
// Bộ đếm nằm CÙNG HÀNG với nhãn chứ không nằm dưới ô, để bật hay tắt nó
// đều không làm ô cao lên, tức là không màn nào bị xô lệch bố cục.
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type KeyboardTypeOptions, type TextInputProps, type ViewStyle } from "react-native";
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
  maxLength,
  showCounter,
  style,
  inputStyle,
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
  maxLength?: number;
  showCounter?: boolean;
  style?: ViewStyle;
  inputStyle?: TextInputProps["style"];
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;
}) {
  const [focused, setFocused] = useState(false);
  // Ô mật khẩu có sẵn nút con mắt nên mọi nơi sử dụng đều có thể hiện hoặc ẩn mật khẩu.
  const [hidden, setHidden] = useState(true);

  // Nơi gọi có thể đặt giới hạn bằng prop mới, hoặc bằng inputProps như các màn cũ.
  // Lấy đúng cái đang có hiệu lực để bộ đếm không hiện sai con số.
  const limit = inputProps?.maxLength ?? maxLength;

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
        {showCounter && limit != null && (
          <AppText variant="caption" style={styles.counter}>
            {value.length}/{limit}
          </AppText>
        )}
      </View>
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
          maxLength={maxLength}
          style={[
            styles.input,
            inputProps?.multiline && styles.inputMultiline,
            focused ? styles.inputFocused : styles.inputIdle,
            secureTextEntry && styles.inputSecure,
            inputStyle,
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
  // Nhãn nằm trái, bộ đếm nằm phải. Ô không bật bộ đếm thì hàng chỉ có một con
  // nên vẫn canh trái y hệt bản cũ, không tốn thêm chiều cao nào.
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  // React Native mặc định KHÔNG cho con của hàng ngang co lại, nên nhãn dài sẽ
  // tràn ra ngoài thay vì xuống dòng như bản cũ. flexShrink trả lại đúng hành vi đó.
  label: { color: theme.colors.muted, flexShrink: 1 },
  // Con số thì ngược lại, không được phép co hay bị ngắt làm hai dòng.
  counter: { color: theme.colors.subtle, flexShrink: 0 },
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
  inputMultiline: { height: 116, paddingTop: 14, paddingBottom: 14, lineHeight: 23, textAlignVertical: "top" },
  eyeButton: { position: "absolute", right: 16 },
  pressed: { opacity: 0.5 },
});
