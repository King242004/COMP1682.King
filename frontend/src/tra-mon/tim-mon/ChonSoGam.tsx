import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MonDaChon } from '../../quet-mon/MonDaChon';
import { Button } from '../../shared/components/Button';
import { TextField } from '../../shared/components/TextField';
import { colors, fontSizes, radius, spacing } from '../../shared/theme';
import type { ThucPham } from '../TraMonApi';

// Số gam lớn nhất cho một lần ăn, để chặn gõ nhầm; là lựa chọn giao diện, giống ô Gram ở thẻ Nhập số
const SO_GAM_LON_NHAT = 5000;

type ChonSoGamProps = {
  thucPham: ThucPham;
  onChon: (mon: MonDaChon) => void;
  onChonKhac: () => void;
};

// Nhân số liệu trên 100 g theo số gam đã ăn, làm tròn 1 số lẻ; chất Viện chưa có số thì giữ null
function nhanTheoGam(soLieu100g: number | null, soGam: number): number | null {
  if (soLieu100g === null) {
    return null;
  }
  return Math.round(((soLieu100g * soGam) / 100) * 10) / 10;
}

// Đã bấm một thực phẩm ở màn tìm: gõ số gam đã ăn rồi trả món về thẻ Nhập số
export function ChonSoGam({ thucPham, onChon, onChonKhac }: ChonSoGamProps) {
  const [soGam, setSoGam] = useState('');
  const [loiSoGam, setLoiSoGam] = useState('');

  // Số gam đúng là số nguyên từ 1 đến 5.000
  const soGamSo = Number(soGam.replace(',', '.'));
  const soGamDung = Number.isInteger(soGamSo) && soGamSo >= 1 && soGamSo <= SO_GAM_LON_NHAT;

  // Kiểm số gam rồi trả món về, số liệu đã nhân theo số gam
  function chonMon() {
    if (!soGamDung) {
      setLoiSoGam(`Số gam từ 1 đến ${SO_GAM_LON_NHAT.toLocaleString('vi-VN')}`);
      return;
    }
    onChon({
      ten_mon: thucPham.ten_thuc_pham,
      khau_phan: `${soGamSo} g`,
      so_calo: Math.round((thucPham.kcal_100g * soGamSo) / 100),
      dam_g: nhanTheoGam(thucPham.dam_100g, soGamSo),
      tinh_bot_g: nhanTheoGam(thucPham.tinh_bot_100g, soGamSo),
      beo_g: nhanTheoGam(thucPham.beo_100g, soGamSo),
      muoi_g: nhanTheoGam(thucPham.muoi_100g, soGamSo),
      duong_g: nhanTheoGam(thucPham.duong_100g, soGamSo),
      beo_no_g: nhanTheoGam(thucPham.beo_no_100g, soGamSo),
      nguon_so_lieu: 'thuc_pham',
    });
  }

  return (
    <View>
      <Text style={styles.ten}>{thucPham.ten_thuc_pham}</Text>
      <Text style={styles.chuPhu}>Kho thực phẩm Viện Dinh dưỡng · 100 g {Math.round(thucPham.kcal_100g).toLocaleString('vi-VN')} kcal</Text>

      <TextField label="Số gam đã ăn" value={soGam} onChangeText={setSoGam} error={loiSoGam} placeholder="Ví dụ: 150" isNumber />
      {soGamDung ? (
        <Text style={styles.tong}>Tổng: {Math.round((thucPham.kcal_100g * soGamSo) / 100).toLocaleString('vi-VN')} kcal</Text>
      ) : null}

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
