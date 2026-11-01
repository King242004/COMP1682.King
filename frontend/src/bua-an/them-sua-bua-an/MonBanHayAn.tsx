import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../shared/components/Card';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';
import type { MonHayAn } from '../BuaAnApi';

type MonBanHayAnProps = {
  monHayAn: MonHayAn[];
  isDisabled: boolean;
  onChon: (mon: MonHayAn) => void;
};

// Thẻ các món người dùng hay ăn, bấm là điền sẵn; người mới chưa có món nào thì không hiện
export function MonBanHayAn({ monHayAn, isDisabled, onChon }: MonBanHayAnProps) {
  if (monHayAn.length === 0) {
    return null;
  }
  return (
    <Card>
      <Text style={styles.tieuDeThe}>Món bạn hay ăn</Text>
      <View style={styles.hangChip}>
        {monHayAn.map((mon) => (
          <Pressable
            key={mon.ten_mon}
            style={({ pressed }) => [styles.vien, isDisabled ? styles.khoa : null, pressed ? styles.dangBam : null]}
            disabled={isDisabled}
            onPress={() => onChon(mon)}
          >
            <Text style={styles.tenMon}>
              {mon.ten_mon} <Text style={styles.soCalo}>· {mon.so_calo.toLocaleString('vi-VN')} kcal</Text>
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDeThe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  vien: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    backgroundColor: colors.card,
  },
  khoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  tenMon: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  soCalo: {
    color: colors.textSecondary,
  },
});
