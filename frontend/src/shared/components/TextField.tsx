import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';

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

// Ô nhập có nhãn ở trên, có lỗi thì viền đỏ và hiện chữ đỏ ở dưới
export function TextField({ label, value, onChangeText, error, placeholder, isPassword, isEmail, isNumber, maxLength }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={isPassword}
        keyboardType={chooseKeyboard(isEmail, isNumber)}
        autoCapitalize={isEmail || isPassword ? 'none' : 'words'}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 4,
  },
});
