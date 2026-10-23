import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '../../shared/components/Chip';
import { colors, fontSizes, spacing } from '../../shared/theme';
import type { MonHayAn } from '../BuaAnApi';

type MonBanHayAnProps = {
  monHayAn: MonHayAn[];
  isDisabled: boolean;
  onChon: (mon: MonHayAn) => void;
};

// Các món người dùng hay ăn, bấm là điền sẵn; người mới chưa có món nào thì không hiện
export function MonBanHayAn({ monHayAn, isDisabled, onChon }: MonBanHayAnProps) {
  if (monHayAn.length === 0) {
    return null;
  }
  return (
    <View style={styles.khoi}>
      <Text style={styles.nhanNhom}>Món bạn hay ăn</Text>
      <View style={styles.hangChip}>
        {monHayAn.map((mon) => (
          <Chip
            key={mon.ten_mon}
            label={`${mon.ten_mon} · ${mon.so_calo.toLocaleString('vi-VN')}`}
            isSelected={false}
            isDisabled={isDisabled}
            onPress={() => onChon(mon)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  khoi: {
    marginBottom: spacing.large,
  },
  nhanNhom: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
});
