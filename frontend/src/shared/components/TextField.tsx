import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../theme';

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
  // Ô cao nhiều dòng để viết cả câu
  isMultiline?: boolean;
  // Nút tròn nhỏ bên phải trong ô (ví dụ kính lúp); iconLabel để trình đọc màn hình đọc lên
  iconName?: ComponentProps<typeof Ionicons>['name'];
  iconLabel?: string;
  onPressIcon?: () => void;
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

// Chọn cách viết hoa: email và mật khẩu không viết hoa, ô viết câu chỉ hoa đầu câu, ô tên hoa mỗi chữ
function chooseCapitalize(isEmail?: boolean, isPassword?: boolean, isMultiline?: boolean): 'none' | 'sentences' | 'words' {
  if (isEmail || isPassword) {
    return 'none';
  }
  if (isMultiline) {
    return 'sentences';
  }
  return 'words';
}

// Ô nhập có nhãn ở trên, có lỗi thì viền đỏ và hiện chữ đỏ ở dưới, bị khóa thì mờ đi
export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  isPassword,
  isEmail,
  isNumber,
  maxLength,
  isDisabled,
  isMultiline,
  iconName,
  iconLabel,
  onPressIcon,
}: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[
            styles.input,
            isMultiline ? styles.inputMultiline : null,
            iconName ? styles.inputWithIcon : null,
            error ? styles.inputError : null,
            isDisabled ? styles.inputDisabled : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword}
          keyboardType={chooseKeyboard(isEmail, isNumber)}
          autoCapitalize={chooseCapitalize(isEmail, isPassword, isMultiline)}
          maxLength={maxLength}
          editable={!isDisabled}
          multiline={isMultiline}
        />

        {/* Nút biểu tượng nằm bên phải trong ô; vùng bấm rộng hơn hình để dễ chạm */}
        {iconName ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, isDisabled ? styles.inputDisabled : null, pressed ? styles.iconPressed : null]}
            onPress={onPressIcon}
            disabled={isDisabled}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={iconLabel}
          >
            <Ionicons name={iconName} size={20} color={colors.textOnPrimaryLight} />
          </Pressable>
        ) : null}
      </View>
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
  inputMultiline: {
    height: 96,
    paddingTop: spacing.medium,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    paddingRight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    opacity: pressedOpacity,
  },
  errorText: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
});
