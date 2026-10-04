import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme';

type ChipProps = {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onPress: () => void;
};

// Nút lựa chọn nhỏ: đang chọn thì nền xanh nhạt, bị làm mờ thì không bấm được
export function Chip({ label, isSelected, isDisabled, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.chip, isSelected ? styles.chipSelected : null, isDisabled ? styles.chipDisabled : null]}
    >
      <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 15,
    color: colors.text,
  },
  labelSelected: {
    color: colors.textOnPrimaryLight,
    fontWeight: '600',
  },
});
