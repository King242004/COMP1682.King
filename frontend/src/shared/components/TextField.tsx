import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSizes, radius, spacing } from '../theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error: string;
  placeholder?: string;
  isPassword?: boolean;
  isEmail?: boolean;
  isNumber?: boolean;
  maxLength?: number;
  // Khóa ô khi màn đang chạy việc khác (đang lưu, AI đang ước tính…)
  isDisabled?: boolean;
};

// Chọn bàn phím hợp với loại ô: số, email, hay chữ thường
function chooseKeyboard(isEmail?: boolean, isNumber?: boolean): 'email-address' | 'decimal-pad' | 'default' {
  if (isEmail) {
    return 'email-address';
  }
  if (isNumber) {
    return 'decimal-pad';
  }
  return 'default';
}

// Ô nhập có nhãn ở trên, có lỗi thì viền đỏ và hiện chữ đỏ ở dưới, bị khóa thì mờ đi
export function TextField({ label, value, onChangeText, error, placeholder, isPassword, isEmail, isNumber, maxLength, isDisabled }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, isDisabled ? styles.inputDisabled : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={isPassword}
        keyboardType={chooseKeyboard(isEmail, isNumber)}
        autoCapitalize={isEmail || isPassword ? 'none' : 'words'}
        maxLength={maxLength}
        editable={!isDisabled}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.medium,
  },
  label: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
});
