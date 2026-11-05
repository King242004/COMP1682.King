import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vietCanNang, vietVongEo } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { LoTrinh } from './LoTrinhApi';

type DongDichProps = {
  bieuTuong: ComponentProps<typeof MaterialCommunityIcons>['name'];
  nhan: string;
  giaTri: string;
  chuNho: string;
};

// Một dòng đích: biểu tượng trong ô vuông nhỏ, nhãn bên trái, giá trị đậm bên phải kèm chữ nhỏ xám
function DongDich({ bieuTuong, nhan, giaTri, chuNho }: DongDichProps) {
  return (
    <View style={styles.dong}>
      <View style={styles.oBieuTuong}>
        <MaterialCommunityIcons name={bieuTuong} size={18} color={colors.primary} />
      </View>
      <Text style={styles.nhan}>{nhan}</Text>
      <Text style={styles.giaTri}>{giaTri}</Text>
      {chuNho !== '' ? <Text style={styles.chuNho}>{chuNho}</Text> : null}
    </View>
  );
}

type DichProps = {
  loTrinh: LoTrinh;
};

// Thẻ "Đích": cân mục tiêu (hoặc giữ quanh cân hiện tại) và vòng eo nên giữ
export function Dich({ loTrinh }: DichProps) {
  const { donVi, heSo } = useDonVi();

  // Dòng cân: có cân mục tiêu, giữ cân, hoặc tài khoản cũ chưa đặt cân mục tiêu
  let nhanCan = 'Cân mục tiêu';
  let giaTriCan = 'Chưa đặt';
  let chuNhoCan = '';
  if (loTrinh.can_muc_tieu_kg !== null && loTrinh.bmi_muc_tieu !== null) {
    giaTriCan = vietCanNang(loTrinh.can_muc_tieu_kg, donVi, heSo);
    chuNhoCan = `BMI ${loTrinh.bmi_muc_tieu.toLocaleString('vi-VN')}`;
  } else if (loTrinh.muc_tieu === 'giu') {
    nhanCan = 'Giữ quanh';
    giaTriCan = vietCanNang(loTrinh.can_nang_kg, donVi, heSo);
  }

  return (
    <Card>
      <Text style={styles.tieuDe}>Đích</Text>
      <DongDich bieuTuong="scale-bathroom" nhan={nhanCan} giaTri={giaTriCan} chuNho={chuNhoCan} />

      {/* Dòng vòng eo: chỉ khi đã nhập vòng eo */}
      {loTrinh.vong_eo_cm !== null ? (
        <DongDich
          bieuTuong="tape-measure"
          nhan="Vòng eo"
          giaTri={`dưới ${vietVongEo(loTrinh.vong_eo_dich_cm, donVi, heSo)}`}
          chuNho="dưới nửa chiều cao"
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingVertical: spacing.small,
  },
  oBieuTuong: {
    width: 32,
    height: 32,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nhan: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  giaTri: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
});
