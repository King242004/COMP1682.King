import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../theme';

type ButtonProps = {
  title: string;
  loadingTitle: string;
  isLoading: boolean;
  onPress: () => void;
  // Mỗi màn chỉ có một nút chính màu xanh; các nút khác dùng kiểu viền
  isSecondary?: boolean;
  // Khóa nút khi màn đang chạy việc khác (ví dụ AI đang ước tính thì khóa nút Lưu)
  isDisabled?: boolean;
};

// Nút bấm; đang xử lý thì đổi chữ và không nhận bấm thêm; đang chạm thì mờ đi
export function Button({ title, loadingTitle, isLoading, onPress, isSecondary, isDisabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading || isDisabled}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.buttonSecondary : null,
        isLoading || isDisabled ? styles.buttonLocked : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.title, isSecondary ? styles.titleSecondary : null]}>{isLoading ? loadingTitle : title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.medium,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonLocked: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: pressedOpacity,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  titleSecondary: {
    color: colors.text,
  },
});
