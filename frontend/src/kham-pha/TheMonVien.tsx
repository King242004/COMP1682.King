import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { NhanDiUng } from '../di-ung/NhanDiUng';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { MonThucDon } from '../thuc-don/ThucDonApi';

type TheMonVienProps = {
  mon: MonThucDon;
  daGhi: boolean;
  dangGhi: boolean;
  // Đang ghi món khác hoặc đang tạo thực đơn mới thì khóa nút "Đã ăn"
  khoa: boolean;
  onDaAn: () => void;
  onXemChiTiet: () => void;
};

// Thẻ một món Viện Dinh dưỡng đã cân trong thực đơn: ảnh suất nhỏ, tên, số của 1 suất, nút "Đã ăn"; bấm thẻ mở chi tiết món. Món đã ghi thì cả thẻ mờ
export function TheMonVien({ mon, daGhi, dangGhi, khoa, onDaAn, onXemChiTiet }: TheMonVienProps) {
  return (
    <Pressable style={({ pressed }) => [styles.the, daGhi ? styles.theDaGhi : null, pressed ? styles.dangBam : null]} onPress={onXemChiTiet}>
      {/* Ảnh suất của Viện, hiện trọn cả ảnh */}
      {mon.anh_url !== null ? <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" /> : null}

      {/* Tên món (gạch ngang khi đã ghi); calo, đạm, tinh bột, béo của 1 suất; nhãn ⚠ nếu có thứ người dùng dị ứng */}
      <View style={styles.cotGiua}>
        <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
        <Text style={styles.chuPhu}>
          {mon.so_calo.toLocaleString('vi-VN')} kcal · đạm {mon.dam_g.toLocaleString('vi-VN')} g · tinh bột{' '}
          {mon.tinh_bot_g.toLocaleString('vi-VN')} g · béo {mon.beo_g.toLocaleString('vi-VN')} g
        </Text>
        <NhanDiUng danhSachNhom={mon.nhom_di_ung} chiTiet={mon.thu_bi_bat.join(', ')} />
      </View>

      {/* Đã ghi thì hiện dấu tick tròn; chưa ghi thì nút "✓ Đã ăn" ghi 1 suất vào nhật ký hôm nay */}
      {daGhi ? (
        <View style={styles.daGhi}>
          <Ionicons name="checkmark-circle" size={18} color={colors.protein} />
          <Text style={styles.chuDaGhi}>Đã ghi</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.nut, khoa ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
          disabled={dangGhi || khoa}
          onPress={onDaAn}
        >
          {!dangGhi ? <Ionicons name="checkmark" size={16} color={colors.protein} /> : null}
          <Text style={styles.chuNut}>{dangGhi ? 'Đang ghi…' : 'Đã ăn'}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  the: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
    borderRadius: radius.card,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  theDaGhi: {
    opacity: 0.55,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  anh: {
    width: 72,
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  cotGiua: {
    flex: 1,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenMonDaGhi: {
    textDecorationLine: 'line-through',
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: spacing.small,
    borderRadius: radius.input,
    backgroundColor: colors.proteinLight,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  chuNut: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.protein,
  },
  daGhi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chuDaGhi: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.protein,
  },
});
