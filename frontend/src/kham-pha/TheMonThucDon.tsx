import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

// Thẻ mâm cơm nhà AI ghép trong thực đơn: "Cơm nhà" và nhãn "AI ước tính"; mỗi món một hàng; tổng calo và ba chất; nút "Xem cách nấu" và "Đã ăn". Món đã ghi thì cả thẻ mờ
export function TheMonThucDon({ mon, daGhi, dangGhi, khoa, onDaAn }: TheMonThucDonProps) {
  const [moCachNau, setMoCachNau] = useState(false);

  // Các món trong mâm nằm trong khẩu phần, cách nhau bằng dấu phẩy
  const cacMonTrongMam = mon.khau_phan.split(',').map((tenMon) => tenMon.trim()).filter((tenMon) => tenMon !== '');

  return (
    <View style={[styles.the, daGhi ? styles.theDaGhi : null]}>
      {/* Tên (gạch ngang khi đã ghi) và nhãn "AI ước tính" */}
      <View style={styles.hangTen}>
        <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
        <Text style={styles.nhanAi}>AI ước tính</Text>
      </View>

      {/* Mỗi món trong mâm một hàng, đầu hàng là biểu tượng trong vòng tròn xanh nhạt */}
      <View style={styles.danhSachMon}>
        {cacMonTrongMam.map((tenMon, thuTu) => (
          <View key={thuTu} style={styles.hangMon}>
            <View style={styles.vongBieuTuong}>
              <Ionicons name="restaurant-outline" size={14} color={colors.primary} />
            </View>
            <Text style={styles.chuMon}>{tenMon}</Text>
          </View>
        ))}
      </View>

      {/* Nhãn ⚠ nếu có thứ người dùng dị ứng */}
      <NhanDiUng danhSachNhom={mon.nhom_di_ung} chiTiet={mon.thu_bi_bat.join(', ')} />

      {/* Tổng calo cả mâm */}
      <View style={styles.hangTong}>
        <Text style={styles.chuPhu}>Tổng cả mâm</Text>
        <Text style={styles.soTong}>khoảng {mon.so_calo.toLocaleString('vi-VN')} kcal</Text>
      </View>

      {/* Ba ô đạm, tinh bột, béo cùng màu với thẻ tổng */}
      <View style={styles.hangBaChat}>
        <View style={[styles.oChat, { backgroundColor: colors.proteinLight }]}>
          <Text style={[styles.tenChat, { color: colors.protein }]}>Đạm</Text>
          <Text style={[styles.soChat, { color: colors.protein }]}>{mon.dam_g.toLocaleString('vi-VN')} g</Text>
        </View>
        <View style={[styles.oChat, { backgroundColor: colors.carbsLight }]}>
          <Text style={[styles.tenChat, { color: colors.carbs }]}>Tinh bột</Text>
          <Text style={[styles.soChat, { color: colors.carbs }]}>{mon.tinh_bot_g.toLocaleString('vi-VN')} g</Text>
        </View>
        <View style={[styles.oChat, { backgroundColor: colors.fatLight }]}>
          <Text style={[styles.tenChat, { color: colors.fat }]}>Béo</Text>
          <Text style={[styles.soChat, { color: colors.fat }]}>{mon.beo_g.toLocaleString('vi-VN')} g</Text>
        </View>
      </View>

      {/* Hàng 2 nút chia đôi: mở hoặc gập cách nấu; đã ghi thì dấu tick tròn, chưa ghi thì nút "✓ Đã ăn" ghi món vào nhật ký hôm nay */}
      <View style={styles.hangNut}>
        <Pressable style={({ pressed }) => [styles.nutCachNau, pressed ? styles.dangBam : null]} onPress={() => setMoCachNau(!moCachNau)}>
          <MaterialCommunityIcons name="chef-hat" size={16} color={colors.text} />
          <Text style={styles.chuNutCachNau}>{moCachNau ? 'Ẩn cách nấu' : 'Xem cách nấu'}</Text>
        </Pressable>
        {daGhi ? (
          <View style={styles.daGhi}>
            <Ionicons name="checkmark-circle" size={18} color={colors.protein} />
            <Text style={styles.chuNut}>Đã ghi</Text>
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

      {/* Khi đã mở: nguyên liệu cho 1 người của mâm này, rồi các bước nấu */}
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
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenMonDaGhi: {
    textDecorationLine: 'line-through',
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
  danhSachMon: {
    gap: 6,
    marginTop: spacing.small,
  },
  // Một hàng món nền xám nhạt
  hangMon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.card,
    borderRadius: radius.input,
    paddingVertical: 6,
    paddingHorizontal: spacing.small,
  },
  vongBieuTuong: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuMon: {
    flex: 1,
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  hangTong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.medium,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  soTong: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  hangBaChat: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.small,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.small,
  },
  tenChat: {
    fontSize: fontSizes.label,
  },
  soChat: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
  },
  hangNut: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  // Nút "Xem cách nấu" viền xám, nửa trái
  nutCachNau: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chuNutCachNau: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  // Nút "Đã ăn" nền xanh lá nhạt, nửa phải
  nut: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
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
