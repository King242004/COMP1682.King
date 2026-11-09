import { Pressable, StyleSheet, Text } from 'react-native';

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
      {/* Mỗi món một dòng rộng hết thẻ: tên bên trái, kcal bên phải (giống dòng trong thẻ Tìm món) */}
      {monHayAn.map((mon) => (
        <Pressable
          key={mon.ten_mon}
          style={({ pressed }) => [styles.dong, isDisabled ? styles.khoa : null, pressed ? styles.dangBam : null]}
          disabled={isDisabled}
          onPress={() => onChon(mon)}
        >
          <Text style={styles.tenMon}>{mon.ten_mon}</Text>
          <Text style={styles.soCalo}>{mon.so_calo.toLocaleString('vi-VN')} kcal</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDeThe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.medium,
    minHeight: 44,
    padding: spacing.medium,
    borderRadius: radius.input,
    backgroundColor: colors.card,
    marginBottom: spacing.small,
  },
  khoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  tenMon: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  soCalo: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
});
