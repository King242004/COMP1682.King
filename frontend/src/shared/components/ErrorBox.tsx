import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

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
        <Pressable onPress={onRetry}>
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
    gap: 8,
    backgroundColor: colors.errorBackground,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: colors.errorText,
  },
  retry: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.errorText,
  },
});
