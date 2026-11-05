import { StyleSheet, Text, View } from 'react-native';

import { doiKgRaDonVi, vietCanNang } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { LoTrinh, TrangThaiGiuCan } from './LoTrinhApi';

// Chữ trên viên trạng thái
const TEN_TRANG_THAI: Record<TrangThaiGiuCan, string> = {
  trong_khoang: 'Trong khoảng',
  cao_hon: 'Cao hơn khoảng',
  thap_hon: 'Thấp hơn khoảng',
};

type KhoangGiuCanProps = {
  loTrinh: LoTrinh;
};

// Thẻ "Giữ cân": giữ quanh cân nào, khoảng nên giữ, cân gần đây và viên trạng thái trong / ngoài khoảng
export function KhoangGiuCan({ loTrinh }: KhoangGiuCanProps) {
  const { donVi, heSo } = useDonVi();
  const khoangGiu = loTrinh.khoang_giu;
  if (khoangGiu === null) {
    return null;
  }
  const trongKhoang = khoangGiu.trang_thai === 'trong_khoang';

  // Khoảng nên giữ: "77,6 – 82,4 kg"
  const soThapNhat = doiKgRaDonVi(khoangGiu.thap_nhat_kg, donVi, heSo).toLocaleString('vi-VN');
  const dongKhoang = `Khoảng nên giữ ${soThapNhat} – ${vietCanNang(khoangGiu.cao_nhat_kg, donVi, heSo)}`;

  return (
    <Card>
      {/* Hàng đầu: giữ quanh cân nào; bên phải viên trạng thái, xanh khi trong khoảng, vàng khi ra ngoài */}
      <View style={styles.hangDau}>
        <Text style={styles.tieuDe}>Giữ quanh {vietCanNang(khoangGiu.can_giu_quanh_kg, donVi, heSo)}</Text>
        <View style={[styles.vien, trongKhoang ? styles.vienBinhThuong : styles.vienCanhBao]}>
          <Text style={[styles.chuVien, trongKhoang ? styles.chuBinhThuong : styles.chuCanhBao]}>
            {TEN_TRANG_THAI[khoangGiu.trang_thai]}
          </Text>
        </View>
      </View>

      <Text style={styles.chuPhu}>{dongKhoang}</Text>
      <Text style={styles.chuCanGanDay}>Cân gần đây {vietCanNang(loTrinh.can_gan_nhat_kg, donVi, heSo)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hangDau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.small,
    marginBottom: 4,
  },
  tieuDe: {
    flexShrink: 1,
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  vien: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
  },
  vienBinhThuong: {
    backgroundColor: colors.primaryLight,
  },
  vienCanhBao: {
    backgroundColor: colors.warningBackground,
  },
  chuVien: {
    fontSize: fontSizes.label,
  },
  chuBinhThuong: {
    color: colors.textOnPrimaryLight,
  },
  chuCanhBao: {
    color: colors.warningText,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  chuCanGanDay: {
    fontSize: fontSizes.body,
    color: colors.text,
    marginTop: spacing.small,
  },
});
