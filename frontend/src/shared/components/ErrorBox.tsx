import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../theme';

type ErrorBoxProps = {
  message: string;
  onRetry?: () => void;
};

// Khung đỏ nhạt báo lỗi từ server; có onRetry thì kèm nút "Thử lại"
export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={12} style={({ pressed }) => (pressed ? styles.retryPressed : null)}>
          <Text style={styles.retry}>Thử lại</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.errorBackground,
    borderRadius: radius.input,
    padding: spacing.medium,
    marginBottom: spacing.large,
  },
  message: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.errorText,
  },
  retryPressed: {
    opacity: pressedOpacity,
  },
  retry: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.errorText,
  },
});
