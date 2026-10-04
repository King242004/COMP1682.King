import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme';

type ButtonProps = {
  title: string;
  loadingTitle: string;
  isLoading: boolean;
  onPress: () => void;
  // Mỗi màn chỉ có một nút chính màu xanh; các nút khác dùng kiểu viền
  isSecondary?: boolean;
};

// Nút bấm; đang xử lý thì đổi chữ và không nhận bấm thêm
export function Button({ title, loadingTitle, isLoading, onPress, isSecondary }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={[styles.button, isSecondary ? styles.buttonSecondary : null, isLoading ? styles.buttonLoading : null]}
    >
      <Text style={[styles.title, isSecondary ? styles.titleSecondary : null]}>{isLoading ? loadingTitle : title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  titleSecondary: {
    color: colors.text,
  },
});
