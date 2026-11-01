import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { colors, pressedOpacity, radius, spacing } from '../shared/theme';

type NutThemMonProps = {
  onPress: () => void;
};

// Nút + nổi ở góc; bấm là mở màn thêm món
export function NutThemMon({ onPress }: NutThemMonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.nutNoi, pressed ? styles.dangBam : null]} onPress={onPress}>
      <Ionicons name="add" size={30} color={colors.textOnPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nutNoi: {
    position: 'absolute',
    right: spacing.large,
    bottom: spacing.large,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
