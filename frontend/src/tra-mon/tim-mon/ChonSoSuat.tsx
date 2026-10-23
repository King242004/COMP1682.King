import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MonDaChon } from '../../quet-mon/MonDaChon';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { SectionTitle } from '../../shared/components/SectionTitle';
import { colors, fontSizes, radius, spacing } from '../../shared/theme';
import type { MonTraCuu } from '../TraMonApi';

// Người dùng ăn bao nhiêu so với 1 suất của Viện; là lựa chọn giao diện, giống màn chi tiết món ở Khám phá
const LUA_CHON_PHAN_AN = [
  { giaTri: 0.5, nhan: '½' },
  { giaTri: 1, nhan: '1' },
  { giaTri: 1.5, nhan: '1½' },
  { giaTri: 2, nhan: '2' },
];

type ChonSoSuatProps = {
  mon: MonTraCuu;
  onChon: (mon: MonDaChon) => void;
  onChonKhac: () => void;
};

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Đã bấm một món của Viện ở màn tìm: chọn ăn bao nhiêu suất rồi trả món về thẻ Nhập số
export function ChonSoSuat({ mon, onChon, onChonKhac }: ChonSoSuatProps) {
  const [phanAn, setPhanAn] = useState(1);

  // Nhân số liệu 1 suất theo phần đã ăn rồi trả món về; Viện không có số đường, béo no nên để trống
  function chonMon() {
    const luaChonPhan = LUA_CHON_PHAN_AN.find((luaChon) => luaChon.giaTri === phanAn);
    let khauPhan = '1 suất';
    if (phanAn !== 1 && luaChonPhan) {
      khauPhan = `${luaChonPhan.nhan} suất`;
    }
    onChon({
      ten_mon: mon.ten_mon,
      khau_phan: khauPhan,
      so_calo: Math.round(mon.so_calo * phanAn),
      dam_g: lamTronMotSoLe(mon.dam_g * phanAn),
      tinh_bot_g: lamTronMotSoLe(mon.tinh_bot_g * phanAn),
      beo_g: lamTronMotSoLe(mon.beo_g * phanAn),
      muoi_g: lamTronMotSoLe(mon.muoi_g * phanAn),
      duong_g: null,
      beo_no_g: null,
      nguon_so_lieu: 'vien_dinh_duong',
    });
  }

  return (
    <View>
      <Text style={styles.ten}>{mon.ten_mon}</Text>
      <Text style={styles.chuPhu}>Món Viện Dinh dưỡng đã cân · 1 suất {Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal</Text>

      {/* Chọn phần đã ăn so với 1 suất */}
      <SectionTitle title="Bạn ăn bao nhiêu suất?" />
      <View style={styles.hangChip}>
        {LUA_CHON_PHAN_AN.map((luaChon) => (
          <Chip key={luaChon.nhan} label={luaChon.nhan} isSelected={phanAn === luaChon.giaTri} onPress={() => setPhanAn(luaChon.giaTri)} />
        ))}
      </View>
      <Text style={styles.tong}>Tổng: {Math.round(mon.so_calo * phanAn).toLocaleString('vi-VN')} kcal</Text>

      <View style={styles.khoangNut}>
        <Button title="Chọn món này" loadingTitle="" isLoading={false} onPress={chonMon} />
      </View>
      <View style={styles.khoangNut}>
        <Button title="Chọn món khác" loadingTitle="" isLoading={false} onPress={onChonKhac} isSecondary />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ten: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.small,
  },
  hangChip: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  tong: {
    fontSize: fontSizes.body,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    padding: spacing.medium,
    overflow: 'hidden',
  },
  khoangNut: {
    marginTop: spacing.medium,
  },
});
