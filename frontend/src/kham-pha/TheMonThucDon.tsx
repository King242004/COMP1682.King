import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NhanDiUng } from '../di-ung/NhanDiUng';
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

// Thẻ mâm cơm nhà AI ghép trong thực đơn: "Cơm nhà" và nhãn "AI ước tính"; các món trong mâm; calo và ba chất; nút 📖 mở nguyên liệu và cách nấu; nút "Đã ăn". Món đã ghi thì cả thẻ mờ
export function TheMonThucDon({ mon, daGhi, dangGhi, khoa, onDaAn }: TheMonThucDonProps) {
  const [moCachNau, setMoCachNau] = useState(false);

  return (
    <View style={[styles.the, daGhi ? styles.theDaGhi : null]}>
      <View style={styles.hangNgang}>
        {/* Tên (gạch ngang khi đã ghi) và nhãn "AI ước tính"; các món trong mâm; calo, đạm, tinh bột, béo ước tính; nhãn ⚠ nếu có thứ người dùng dị ứng */}
        <View style={styles.cotGiua}>
          <View style={styles.hangTen}>
            <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
            <Text style={styles.nhanAi}>AI ước tính</Text>
          </View>
          <Text style={styles.chuPhu}>{mon.khau_phan}</Text>
          <Text style={styles.chuPhu}>
            khoảng {mon.so_calo.toLocaleString('vi-VN')} kcal · đạm {mon.dam_g.toLocaleString('vi-VN')} g · tinh bột{' '}
            {mon.tinh_bot_g.toLocaleString('vi-VN')} g · béo {mon.beo_g.toLocaleString('vi-VN')} g
          </Text>
          <NhanDiUng danhSachNhom={mon.nhom_di_ung} chiTiet={mon.thu_bi_bat.join(', ')} />
        </View>

        {/* Có cách nấu thì có nút 📖 mở hoặc gập nguyên liệu và cách nấu */}
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

      {/* Khi đã mở: nguyên liệu cho 1 người, rồi các bước nấu */}
      {moCachNau ? (
        <View style={styles.phanCachNau}>
          <Text style={styles.chuNho}>Nguyên liệu (1 người)</Text>
          {mon.nguyen_lieu.map((nguyenLieu, thuTu) => (
            <Text key={thuTu} style={styles.dongCachNau}>
              • {nguyenLieu}
            </Text>
          ))}
          <Text style={[styles.chuNho, styles.khoangTren]}>Cách nấu do AI gợi ý</Text>
          {mon.cach_nau.map((buoc, thuTu) => (
            <Text key={thuTu} style={styles.dongCachNau}>
              {thuTu + 1}. {buoc}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
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
  hangNgang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
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
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  // Nhãn vàng nhỏ báo số liệu là AI ước tính
  nhanAi: {
    fontSize: fontSizes.label,
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    borderRadius: radius.input,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
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
    fontWeight: '600',
    color: colors.protein,
  },
  // Phần mở ra dưới thẻ, ngăn với phần trên bằng một đường mảnh
  phanCachNau: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.medium,
    paddingTop: spacing.small,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  khoangTren: {
    marginTop: spacing.medium,
  },
  dongCachNau: {
    fontSize: fontSizes.body,
    color: colors.text,
    lineHeight: 22,
  },
});
