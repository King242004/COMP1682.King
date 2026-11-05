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

// Thẻ "Lộ trình": thời gian ước tính, thanh tiến độ và các mốc theo tháng (giảm cân); tăng cân chỉ có thanh tiến độ
export function CacMocThang({ loTrinh }: CacMocThangProps) {
  const { donVi, heSo } = useDonVi();
  const tienDo = loTrinh.tien_do;
  if (tienDo === null) {
    return null;
  }

  // Dòng thời gian: "Khoảng 3–4 tháng · giảm 2–3 kg mỗi tháng"; hai số tháng bằng nhau thì ghi một số
  let dongThoiGian = '';
  if (loTrinh.so_thang !== null) {
    let soThang = `${loTrinh.so_thang.it_nhat}–${loTrinh.so_thang.nhieu_nhat}`;
    if (loTrinh.so_thang.it_nhat === loTrinh.so_thang.nhieu_nhat) {
      soThang = `${loTrinh.so_thang.it_nhat}`;
    }
    const kgThap = doiKgRaDonVi(loTrinh.kg_moi_thang_thap, donVi, heSo).toLocaleString('vi-VN');
    dongThoiGian = `Khoảng ${soThang} tháng · giảm ${kgThap}–${vietCanNang(loTrinh.kg_moi_thang_cao, donVi, heSo)} mỗi tháng`;
  }

  // Chữ dưới thanh: "Đã giảm 2 / 7 kg" hoặc "Đã tăng 1 / 7 kg"
  let chuDaDi = 'Đã giảm';
  if (loTrinh.muc_tieu === 'tang') {
    chuDaDi = 'Đã tăng';
  }
  const soKgDaDi = doiKgRaDonVi(tienDo.so_kg_da_di, donVi, heSo).toLocaleString('vi-VN');

  return (
    <Card>
      <Text style={styles.tieuDe}>Lộ trình</Text>
      {dongThoiGian !== '' ? <Text style={styles.chuPhu}>{dongThoiGian}</Text> : null}

      {/* Thanh tiến độ */}
      <View style={styles.thanhNen}>
        <View style={[styles.thanhDay, { width: `${tienDo.phan_tram}%` }]} />
      </View>
      <Text style={styles.chuTienDo}>
        {chuDaDi} {soKgDaDi} / {vietCanNang(tienDo.so_kg_can_di, donVi, heSo)}
      </Text>

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
    </Card>
  );
}

type DongMocProps = {
  moc: MocLoTrinh;
  chuCan: string;
  laMocCuoi: boolean;
};

// Một mốc: chấm theo trạng thái (đầy có ✓ / viền / xám), đường nối xuống mốc sau, chữ "Tháng n · cân"
function DongMoc({ moc, chuCan, laMocCuoi }: DongMocProps) {
  let kieuCham: ViewStyle = styles.chamChuaToi;
  let kieuChu: TextStyle = styles.chuChuaToi;
  if (moc.trang_thai === 'da_dat') {
    kieuCham = styles.chamDaDat;
    kieuChu = styles.chuDaDat;
  }
  if (moc.trang_thai === 'dang_toi') {
    kieuCham = styles.chamDangToi;
    kieuChu = styles.chuDangToi;
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
    </View>
  );
}

const styles = StyleSheet.create({
  tieuDe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  thanhNen: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
    marginTop: spacing.medium,
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  chuTienDo: {
    fontSize: fontSizes.secondary,
    color: colors.primary,
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
    flex: 1,
    fontSize: fontSizes.body,
  },
  chuDaDat: {
    color: colors.text,
  },
  chuDangToi: {
    color: colors.primary,
    fontWeight: '600',
  },
  chuChuaToi: {
    color: colors.textSecondary,
  },
});
