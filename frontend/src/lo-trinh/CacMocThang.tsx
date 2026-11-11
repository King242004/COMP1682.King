import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { doiKgRaDonVi, vietCanNang } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { LoTrinh, MocLoTrinh } from './LoTrinhApi';

type CacMocThangProps = {
  loTrinh: LoTrinh;
};

// Thẻ "Lộ trình": đích, thời gian ước tính, thanh tiến độ và các mốc theo tháng (giảm cân); tăng cân chỉ có thanh tiến độ
export function CacMocThang({ loTrinh }: CacMocThangProps) {
  const { donVi, heSo } = useDonVi();
  const tienDo = loTrinh.tien_do;
  if (tienDo === null) {
    return null;
  }

  // Dòng thời gian: "Khoảng 4 tháng · giảm khoảng 2 kg mỗi tháng"
  let dongThoiGian = '';
  if (loTrinh.so_thang !== null) {
    dongThoiGian = `Khoảng ${loTrinh.so_thang} tháng · giảm khoảng ${vietCanNang(loTrinh.kg_moi_thang, donVi, heSo)} mỗi tháng`;
  }

  // Chữ dưới thanh: "Đã giảm 2 / 7 kg" hoặc "Đã tăng 1 / 7 kg"
  let chuDaDi = 'Đã giảm';
  if (loTrinh.muc_tieu === 'tang') {
    chuDaDi = 'Đã tăng';
  }
  const soKgDaDi = doiKgRaDonVi(tienDo.so_kg_da_di, donVi, heSo).toLocaleString('vi-VN');

  // Dòng đích: cân lúc bắt đầu → cân mục tiêu, ví dụ "72 kg → 65 kg"
  let dongDich = '';
  if (loTrinh.can_bat_dau_kg !== null && loTrinh.can_muc_tieu_kg !== null) {
    dongDich = `${vietCanNang(loTrinh.can_bat_dau_kg, donVi, heSo)} → ${vietCanNang(loTrinh.can_muc_tieu_kg, donVi, heSo)}`;
  }

  return (
    <Card>
      {dongDich !== '' ? <Text style={styles.dongDich}>{dongDich}</Text> : null}
      {dongThoiGian !== '' ? <Text style={styles.chuPhu}>{dongThoiGian}</Text> : null}

      {/* Thanh tiến độ */}
      <View style={styles.thanhNen}>
        <View style={[styles.thanhDay, { width: `${tienDo.phan_tram}%` }]} />
      </View>
      <Text style={styles.chuTienDo}>
        {chuDaDi} {soKgDaDi} / {vietCanNang(tienDo.so_kg_can_di, donVi, heSo)}
      </Text>

      {/* Cân theo xu hướng, giống dòng ở thẻ Giữ cân */}
      <Text style={styles.chuCanGanDay}>Cân gần đây {vietCanNang(loTrinh.can_gan_nhat_kg, donVi, heSo)}</Text>

      {/* Các mốc theo tháng nối bằng đường mảnh; mốc cuối (cân mục tiêu) có cờ */}
      {loTrinh.cac_moc.length > 0 ? (
        <View style={styles.danhSachMoc}>
          {loTrinh.cac_moc.map((moc, viTri) => (
            <DongMoc
              key={moc.thang}
              moc={moc}
              chuCan={vietCanNang(moc.can_kg, donVi, heSo)}
              laMocCuoi={viTri === loTrinh.cac_moc.length - 1}
            />
          ))}
        </View>
      ) : null}

      {/* Dòng nguồn (chỉ khi giảm cân): tốc độ lấy theo đâu, và đây chỉ là ước tính */}
      {loTrinh.muc_tieu === 'giam' ? (
        <Text style={styles.chuNguon}>Ước tính theo mức giảm cân từ từ của Bộ Y tế (2022). Cân thật có thể nhanh hoặc chậm hơn.</Text>
      ) : null}
    </Card>
  );
}

type DongMocProps = {
  moc: MocLoTrinh;
  chuCan: string;
  laMocCuoi: boolean;
};

// Một mốc: chấm theo trạng thái (đầy có ✓ / viền / xám), đường nối xuống mốc sau, chữ "Tháng n · cân", viên chữ trạng thái bên phải
function DongMoc({ moc, chuCan, laMocCuoi }: DongMocProps) {
  let kieuCham: ViewStyle = styles.chamChuaToi;
  let kieuChu: TextStyle = styles.chuChuaToi;
  let chuVien = 'Dự kiến';
  let kieuVien: ViewStyle | null = null;
  let kieuChuVien: TextStyle = styles.chuVienChuaToi;
  if (moc.trang_thai === 'da_dat') {
    kieuCham = styles.chamDaDat;
    kieuChu = styles.chuDaDat;
    chuVien = 'Đạt';
    kieuVien = styles.vienDaDat;
    kieuChuVien = styles.chuVienDaDat;
  }
  if (moc.trang_thai === 'dang_toi') {
    kieuCham = styles.chamDangToi;
    kieuChu = styles.chuDangToi;
    chuVien = 'Hiện tại';
    kieuVien = styles.vienDangToi;
    kieuChuVien = styles.chuVienDangToi;
  }

  return (
    <View style={styles.dongMoc}>
      <View style={styles.cotCham}>
        <View style={[styles.cham, kieuCham]}>
          {moc.trang_thai === 'da_dat' ? <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} /> : null}
        </View>
        {!laMocCuoi ? <View style={styles.duongNoi} /> : null}
      </View>
      <Text style={[styles.chuMoc, kieuChu]}>
        Tháng {moc.thang} · {chuCan}
      </Text>
      {laMocCuoi ? <MaterialCommunityIcons name="flag-outline" size={16} color={colors.primary} /> : null}
      <View style={[styles.vien, kieuVien]}>
        <Text style={[styles.chuVien, kieuChuVien]}>{chuVien}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dongDich: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  thanhNen: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.medium,
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  chuTienDo: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
    marginTop: 4,
  },
  chuCanGanDay: {
    fontSize: fontSizes.secondary,
    color: colors.text,
    marginTop: 4,
  },
  danhSachMoc: {
    marginTop: spacing.medium,
  },
  dongMoc: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
  },
  cotCham: {
    width: 18,
    alignItems: 'center',
  },
  cham: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chamDaDat: {
    backgroundColor: colors.primary,
  },
  chamDangToi: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chamChuaToi: {
    backgroundColor: colors.border,
  },
  duongNoi: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
  },
  chuMoc: {
    fontSize: fontSizes.body,
  },
  chuDaDat: {
    color: colors.text,
    fontWeight: '600',
  },
  chuDangToi: {
    color: colors.primary,
    fontWeight: '600',
  },
  chuChuaToi: {
    color: colors.textSecondary,
  },
  chuNguon: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: spacing.medium,
  },
  vien: {
    marginLeft: 'auto',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
  },
  vienDaDat: {
    backgroundColor: colors.proteinLight,
  },
  vienDangToi: {
    backgroundColor: colors.primaryLight,
  },
  chuVien: {
    fontSize: fontSizes.label,
  },
  chuVienDaDat: {
    color: colors.protein,
  },
  chuVienDangToi: {
    color: colors.textOnPrimaryLight,
  },
  chuVienChuaToi: {
    color: colors.textSecondary,
  },
});
