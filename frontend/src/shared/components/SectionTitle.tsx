import { StyleSheet, Text } from 'react-native';

import { colors, fontSizes, spacing } from '../theme';

type SectionTitleProps = {
  title: string;
};

// Tiêu đề của một khối nội dung trong màn, chữ 18
export function SectionTitle({ title }: SectionTitleProps) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.small,
    marginBottom: spacing.small,
  },
});
