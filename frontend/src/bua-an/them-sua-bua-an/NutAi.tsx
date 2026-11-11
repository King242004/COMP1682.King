import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

type NutAiProps = {
  isLoading: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Nút "AI ước tính" nền xanh nhạt chữ xanh, cao bằng ô nhập đứng cạnh nó; dùng cạnh ô Calo
export function NutAi({ isLoading, biKhoa, onPress }: NutAiProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nut, isLoading || biKhoa ? styles.khoa : null, pressed ? styles.dangBam : null]}
      disabled={isLoading || biKhoa}
      onPress={onPress}
    >
      {!isLoading ? <Ionicons name="sparkles-outline" size={16} color={colors.textOnPrimaryLight} /> : null}
      <Text style={styles.chu}>{isLoading ? 'Đang ước tính…' : 'AI ước tính'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nut: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
  },
  khoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chu: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
});
