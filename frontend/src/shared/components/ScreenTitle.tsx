import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, spacing } from '../theme';

type ScreenTitleProps = {
  title: string;
  subtitle?: string;
  // Màn mở chồng lên màn khác thì có nút ‹ quay lại
  onBack?: () => void;
  // Chữ hoặc nút nhỏ nằm bên phải tiêu đề, ví dụ "Xóa trò chuyện"
  right?: ReactNode;
};

// Tiêu đề đầu màn: chữ 24, dòng phụ bên dưới, có thể có nút quay lại
export function ScreenTitle({ title, subtitle, onBack, right }: ScreenTitleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => (pressed ? styles.backPressed : null)}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.large,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.screenTitle,
    fontWeight: '600',
    color: colors.text,
  },
  backPressed: {
    opacity: pressedOpacity,
  },
  subtitle: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
