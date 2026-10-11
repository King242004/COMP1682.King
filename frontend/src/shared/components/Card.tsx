import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

type CardProps = {
  children: ReactNode;
};

// Thẻ trắng bo tròn có bóng mềm, dùng để nhóm nội dung trên nền kem
export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.large,
    marginBottom: spacing.medium,
    ...shadows.card,
  },
});
