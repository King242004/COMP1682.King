import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../theme';

type ChipProps = {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onPress: () => void;
};

// Nút lựa chọn nhỏ: chưa chọn thì nền trắng viền xám mảnh, đang chọn thì nền xanh đặc chữ trắng, bị làm mờ thì không bấm được
export function Chip({ label, isSelected, isDisabled, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.chip,
        isSelected ? styles.chipSelected : null,
        isDisabled ? styles.chipDisabled : null,
        pressed ? styles.chipPressed : null,
      ]}
    >
      <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipPressed: {
    opacity: pressedOpacity,
  },
  label: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  labelSelected: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});
