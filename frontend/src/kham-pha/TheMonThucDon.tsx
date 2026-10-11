import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TEN_BUA } from '../bua-an/TenBua';
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

// Chữ hiển thị cho cách ăn
const TEN_CACH_AN = { an_ngoai: 'ăn ngoài', tu_nau: 'tự nấu' };

// Thẻ một món trong thực đơn: bữa, cách ăn, tên, khẩu phần, số liệu, nút "Đã ăn"; món tự nấu bấm xem cách nấu
export function TheMonThucDon({ mon, daGhi, dangGhi, khoa, onDaAn }: TheMonThucDonProps) {
  const [moCachNau, setMoCachNau] = useState(false);

  // Chữ trên nút: đã có trong nhật ký, đang ghi, hoặc chưa ghi
  let chuNut = 'Đã ăn';
  if (daGhi) {
    chuNut = 'Đã ghi ✓';
  } else if (dangGhi) {
    chuNut = 'Đang ghi…';
  }

  return (
    <View style={styles.the}>
      {/* Bữa, cách ăn và nút "Đã ăn" */}
      <View style={styles.hangTren}>
        <View style={styles.hangNhan}>
          <Text style={styles.nhanBua}>{TEN_BUA[mon.loai_bua]}</Text>
          <Text style={styles.nhanCachAn}>{TEN_CACH_AN[mon.cach_an]}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.nut,
            daGhi ? styles.nutDaGhi : null,
            khoa && !daGhi ? styles.nutKhoa : null,
            pressed ? styles.dangBam : null,
          ]}
          disabled={daGhi || dangGhi || khoa}
          onPress={onDaAn}
        >
          <Text style={[styles.chuNut, daGhi ? styles.chuNutDaGhi : null]}>{chuNut}</Text>
        </Pressable>
      </View>

      {/* Tên món, khẩu phần và số liệu ước tính */}
      <Text style={styles.tenMon}>{mon.ten_mon}</Text>
      <Text style={styles.chuPhu}>
        {mon.khau_phan} · khoảng {mon.so_calo.toLocaleString('vi-VN')} kcal · đạm {mon.dam_g.toLocaleString('vi-VN')} g
      </Text>

      {/* Món tự nấu: bấm để mở hoặc gập cách nấu */}
      {mon.cach_nau.length > 0 ? (
        <Pressable
          style={({ pressed }) => [styles.nutCachNau, pressed ? styles.dangBam : null]}
          onPress={() => setMoCachNau(!moCachNau)}
        >
          <Text style={styles.chuCachNau}>{moCachNau ? 'Ẩn cách nấu' : 'Xem cách nấu'}</Text>
        </Pressable>
      ) : null}
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
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hangNhan: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  nhanBua: {
    fontSize: fontSizes.label,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  nhanCachAn: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 1,
  },
  nut: {
    minHeight: 36,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  nutKhoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  nutDaGhi: {
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chuNut: {
    fontSize: fontSizes.body,
    color: colors.primary,
  },
  chuNutDaGhi: {
    color: colors.textSecondary,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.small,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutCachNau: {
    minHeight: 36,
    justifyContent: 'center',
  },
  chuCachNau: {
    fontSize: fontSizes.body,
    color: colors.primary,
  },
  buocNau: {
    fontSize: fontSizes.body,
    color: colors.text,
    lineHeight: 20,
  },
});
