import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { doiKgRaDonVi, vietCanNang, vietVongEo } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { LoTrinh } from './LoTrinhApi';

type TenBieuTuong = ComponentProps<typeof MaterialCommunityIcons>['name'];

type UuTienProps = {
  loTrinh: LoTrinh;
};

// Thẻ "Ưu tiên cho bạn": 2–3 việc nên làm, chọn theo mục tiêu và vòng eo
export function UuTien({ loTrinh }: UuTienProps) {
  const { donVi, heSo } = useDonVi();
  const cacDong: { bieuTuong: TenBieuTuong; chu: string }[] = [];

  // Dòng theo mục tiêu: tốc độ giảm cân, ăn đủ calo khi tăng cân, ăn quanh mức calo giữ cân
  if (loTrinh.muc_tieu === 'giam') {
    const kgThap = doiKgRaDonVi(loTrinh.kg_moi_thang_thap, donVi, heSo).toLocaleString('vi-VN');
    cacDong.push({
      bieuTuong: 'scale-bathroom',
      chu: `Giảm ${kgThap}–${vietCanNang(loTrinh.kg_moi_thang_cao, donVi, heSo)} mỗi tháng, không nhanh hơn`,
    });
  }
  if (loTrinh.muc_tieu === 'tang') {
    cacDong.push({ bieuTuong: 'scale-bathroom', chu: `Ăn đủ ${loTrinh.muc_tieu_calo.toLocaleString('vi-VN')} kcal mỗi ngày` });
  }
  if (loTrinh.muc_tieu === 'giu') {
    cacDong.push({ bieuTuong: 'scale-bathroom', chu: `Ăn khoảng ${loTrinh.muc_tieu_calo.toLocaleString('vi-VN')} kcal mỗi ngày` });
  }

  // Dòng vòng eo: chỉ khi mỡ bụng cao hơn khuyến nghị
  if (loTrinh.muc_eo === 'cao' || loTrinh.muc_eo === 'rat_cao') {
    cacDong.push({
      bieuTuong: 'tape-measure',
      chu: `Giữ vòng eo dưới nửa chiều cao (${vietVongEo(loTrinh.vong_eo_dich_cm, donVi, heSo)})`,
    });
  }

  // Dòng vận động cho mọi người
  cacDong.push({ bieuTuong: 'run', chu: `Vận động ít nhất ${loTrinh.phut_van_dong_moi_ngay} phút mỗi ngày` });

  return (
    <Card>
      <Text style={styles.tieuDe}>Ưu tiên cho bạn</Text>
      {cacDong.map((dong) => (
        <View key={dong.chu} style={styles.dong}>
          <View style={styles.vongBieuTuong}>
            <MaterialCommunityIcons name={dong.bieuTuong} size={16} color={colors.primary} />
          </View>
          <Text style={styles.chu}>{dong.chu}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingVertical: 6,
  },
  vongBieuTuong: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chu: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
});
