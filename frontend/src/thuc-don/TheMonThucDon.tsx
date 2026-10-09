import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TEN_BUA } from '../bua-an/TenBua';
import { colors } from '../shared/theme';
import type { MonThucDon } from './ThucDonApi';

type TheMonThucDonProps = {
  mon: MonThucDon;
  daGhi: boolean;
  dangGhi: boolean;
  onDaAn: () => void;
};

// Chữ hiển thị cho cách ăn
const TEN_CACH_AN = { an_ngoai: 'ăn ngoài', tu_nau: 'tự nấu' };

// Thẻ một món trong thực đơn: bữa, cách ăn, tên, khẩu phần, số liệu, nút "Đã ăn"; món tự nấu bấm xem cách nấu
export function TheMonThucDon({ mon, daGhi, dangGhi, onDaAn }: TheMonThucDonProps) {
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
        <Pressable style={[styles.nut, daGhi ? styles.nutDaGhi : null]} disabled={daGhi || dangGhi} onPress={onDaAn}>
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
        <Pressable style={styles.nutCachNau} onPress={() => setMoCachNau(!moCachNau)}>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hangNhan: {
    flexDirection: 'row',
    gap: 6,
  },
  nhanBua: {
    fontSize: 12,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  nhanCachAn: {
    fontSize: 12,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  nut: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  nutDaGhi: {
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chuNut: {
    fontSize: 14,
    color: colors.primary,
  },
  chuNutDaGhi: {
    color: colors.textSecondary,
  },
  tenMon: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutCachNau: {
    minHeight: 36,
    justifyContent: 'center',
  },
  chuCachNau: {
    fontSize: 14,
    color: colors.primary,
  },
  buocNau: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
