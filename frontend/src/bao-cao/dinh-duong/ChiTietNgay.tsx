import { StyleSheet, Text, View } from 'react-native';

import { formatDateLabel } from '../../shared/dateKey';
import { colors, fontSizes, radius, spacing } from '../../shared/theme';
import type { NgayBaoCao } from '../BaoCaoApi';

type ChiTietNgayProps = {
  ngay: string;
  duLieu: NgayBaoCao | undefined;
  mucTieuCalo: number;
};

// Khung xanh nhạt dưới vòng / lịch: ngày đang chọn, calo so với mục tiêu, 3 chất và tên các món
export function ChiTietNgay({ ngay, duLieu, mucTieuCalo }: ChiTietNgayProps) {
  // Ngày không ghi món nào
  if (duLieu === undefined) {
    return (
      <View style={styles.khung}>
        <Text style={styles.chuNgay}>{formatDateLabel(ngay)}</Text>
        <Text style={styles.chuPhu}>Không ghi món nào</Text>
      </View>
    );
  }

  // Nhãn bên phải dòng ngày: "2.050 kcal · vượt 150" hoặc "1.850 kcal · đạt"
  const tongHop = duLieu.tong_hop;
  let chuNhan = `${tongHop.tong_calo.toLocaleString('vi-VN')} kcal · đạt`;
  if (duLieu.vuot_calo) {
    chuNhan = `${tongHop.tong_calo.toLocaleString('vi-VN')} kcal · vượt ${(tongHop.tong_calo - mucTieuCalo).toLocaleString('vi-VN')}`;
  }

  return (
    <View style={styles.khung}>
      {/* Dòng ngày và nhãn đạt / vượt */}
      <View style={styles.hangNgay}>
        <Text style={styles.chuNgay}>{formatDateLabel(ngay)}</Text>
        <Text style={[styles.nhan, duLieu.vuot_calo ? styles.nhanVuot : styles.nhanDat]}>{chuNhan}</Text>
      </View>

      {/* Gam 3 chất trong ngày */}
      <Text style={styles.chuPhu}>
        Đạm {Math.round(tongHop.tong_dam_g)} g · Tinh bột {Math.round(tongHop.tong_tinh_bot_g)} g · Béo {Math.round(tongHop.tong_beo_g)} g
      </Text>

      {/* Tên các món đã ăn */}
      <Text style={styles.chuMon}>{duLieu.ten_mon.join(' · ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    padding: spacing.medium,
    gap: 4,
  },
  hangNgay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.small,
  },
  chuNgay: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nhan: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  nhanVuot: {
    backgroundColor: colors.warningBackground,
    color: colors.warningText,
  },
  nhanDat: {
    backgroundColor: colors.surface,
    color: colors.textOnPrimaryLight,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  chuMon: {
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
});
