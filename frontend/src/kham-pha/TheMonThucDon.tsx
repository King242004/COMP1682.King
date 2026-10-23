import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BIEU_TUONG_BUA, MAU_BUA, TEN_BUA } from '../bua-an/TenBua';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { MonThucDon } from '../thuc-don/ThucDonApi';

type TheMonThucDonProps = {
  mon: MonThucDon;
  daGhi: boolean;
  dangGhi: boolean;
  // Đang ghi món khác hoặc đang tạo thực đơn mới thì khóa nút "Đã ăn"
  khoa: boolean;
  onDaAn: () => void;
};

// Thẻ một món trong thực đơn, 2 dòng: tên món; bữa, calo, đạm. Món tự nấu có nút 📖 mở cách nấu; bên phải là nút "Đã ăn"
export function TheMonThucDon({ mon, daGhi, dangGhi, khoa, onDaAn }: TheMonThucDonProps) {
  const [moCachNau, setMoCachNau] = useState(false);
  const mauBua = MAU_BUA[mon.loai_bua];

  return (
    <View style={styles.the}>
      <View style={styles.hangNgang}>
        {/* Ô biểu tượng màu của bữa, giống hộp bữa ở trang chủ */}
        <View style={[styles.oBieuTuong, { backgroundColor: mauBua.nen }]}>
          <Ionicons name={BIEU_TUONG_BUA[mon.loai_bua]} size={18} color={mauBua.mau} />
        </View>

        {/* Tên món (gạch ngang khi đã ghi); bữa, calo, đạm */}
        <View style={styles.cotGiua}>
          <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
          <Text style={styles.chuPhu}>
            {TEN_BUA[mon.loai_bua]} · {mon.so_calo.toLocaleString('vi-VN')} kcal · đạm {mon.dam_g.toLocaleString('vi-VN')} g
          </Text>
        </View>

        {/* Món tự nấu: nút 📖 mở hoặc gập cách nấu */}
        {mon.cach_nau.length > 0 ? (
          <Pressable style={({ pressed }) => [styles.nutSach, pressed ? styles.dangBam : null]} hitSlop={6} onPress={() => setMoCachNau(!moCachNau)}>
            <Ionicons name={moCachNau ? 'book' : 'book-outline'} size={20} color={colors.primary} />
          </Pressable>
        ) : null}

        {/* Đã ghi thì hiện dấu tick tròn; chưa ghi thì nút "✓ Đã ăn" ghi món vào nhật ký hôm nay */}
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
      </View>

      {/* Các bước nấu khi đã mở */}
      {moCachNau
        ? mon.cach_nau.map((buoc, thuTu) => (
            <Text key={thuTu} style={styles.buocNau}>
              {thuTu + 1}. {buoc}
            </Text>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.surface,
    ...shadows.card,
    borderRadius: radius.card,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  hangNgang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  oBieuTuong: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textSecondary,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutSach: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  dangBam: {
    opacity: pressedOpacity,
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
    color: colors.textSecondary,
  },
  buocNau: {
    fontSize: fontSizes.body,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.small,
  },
});
