import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { UongNuocNgay } from '../uong-nuoc/UongNuocApi';

type TheUongNuocProps = {
  uongNuoc: UongNuocNgay;
  onPress: () => void;
};

// Thẻ "Uống nước" trên trang chủ, chỉ để xem: số ml của ngày đang xem so với mục tiêu và thanh dài theo ml; bấm cả thẻ mở màn Uống nước
export function TheUongNuoc({ uongNuoc, onPress }: TheUongNuocProps) {
  // Thanh dài theo % đã uống, đầy thì thôi
  let phanTram = (uongNuoc.so_ml / uongNuoc.muc_tieu_ml) * 100;
  if (phanTram > 100) {
    phanTram = 100;
  }

  return (
    <Pressable style={({ pressed }) => [styles.the, pressed ? styles.dangBam : null]} onPress={onPress}>
      {/* Hàng trên: giọt nước, tên thẻ, mục tiêu và dấu › */}
      <View style={styles.hangTren}>
        <Ionicons name="water-outline" size={18} color={colors.primary} />
        <Text style={styles.tieuDe}>Uống nước</Text>
        <Text style={styles.chuNho}>mục tiêu {uongNuoc.muc_tieu_ml.toLocaleString('vi-VN')} ml</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>

      {/* Số ml đã uống */}
      <Text style={styles.soTo}>
        {uongNuoc.so_ml.toLocaleString('vi-VN')} <Text style={styles.chuNho}>/ {uongNuoc.muc_tieu_ml.toLocaleString('vi-VN')} ml</Text>
      </Text>

      {/* Thanh dài theo ml */}
      <View style={styles.thanhNen}>
        <View style={[styles.thanhDay, { width: `${phanTram}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.large,
    marginBottom: spacing.medium,
    gap: spacing.small,
    ...shadows.card,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tieuDe: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  soTo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.text,
  },
  thanhNen: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
