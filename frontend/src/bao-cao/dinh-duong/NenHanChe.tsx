import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../shared/components/Card';
import { todayKey } from '../../shared/dateKey';
import { colors, fontSizes, spacing } from '../../shared/theme';
import type { BaoCaoDinhDuong, NgayBaoCao } from '../BaoCaoApi';

type NenHanCheProps = {
  baoCao: BaoCaoDinhDuong;
  cacNgay: string[];
  coHangCham: boolean;
};

type DongHanCheProps = {
  ten: string;
  soNgayVuot: number;
  soNgayCoGhi: number;
  // Trường cho biết một ngày có vượt chất này không
  loaiVuot: 'vuot_muoi' | 'vuot_duong' | 'vuot_beo_no';
  cacNgay: string[];
  duLieuCacNgay: NgayBaoCao[];
  coHangCham: boolean;
};

// Một dòng muối, đường hoặc béo no: "Muối vượt 4/6 ngày" (chữ vàng khi có ngày vượt, ✓ khi không ngày nào); bản Tuần có thêm hàng 7 chấm
function DongHanChe({ ten, soNgayVuot, soNgayCoGhi, loaiVuot, cacNgay, duLieuCacNgay, coHangCham }: DongHanCheProps) {
  const homNay = todayKey();
  const coVuot = soNgayVuot > 0;

  return (
    <View style={styles.dong}>
      {/* Chữ đếm ngày vượt */}
      <View style={styles.hangChu}>
        <Text style={[styles.chuDong, coVuot ? styles.chuVuot : null]}>
          {ten} vượt {soNgayVuot}/{soNgayCoGhi} ngày
        </Text>
        {!coVuot ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
      </View>

      {/* Hàng chấm, mỗi ngày một chấm: vàng là vượt, xám là không vượt, viền đứt là không ghi, ngày chưa tới để trống */}
      {coHangCham ? (
        <View style={styles.hangCham}>
          {cacNgay.map((ngay) => {
            const duLieu = duLieuCacNgay.find((motNgay) => motNgay.ngay === ngay);
            if (ngay > homNay) {
              return <View key={ngay} style={styles.cham} />;
            }
            if (duLieu === undefined) {
              return <View key={ngay} style={[styles.cham, styles.chamKhongGhi]} />;
            }
            if (duLieu[loaiVuot]) {
              return <View key={ngay} style={[styles.cham, styles.chamVuot]} />;
            }
            return <View key={ngay} style={[styles.cham, styles.chamKhongVuot]} />;
          })}
        </View>
      ) : null}
    </View>
  );
}

// Thẻ "Nên hạn chế": mỗi chất đếm bao nhiêu ngày vượt giới hạn mỗi ngày, trên số ngày có ghi
export function NenHanChe({ baoCao, cacNgay, coHangCham }: NenHanCheProps) {
  const tomTat = baoCao.tom_tat;

  return (
    <Card>
      {/* Tiêu đề và ghi chú */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Nên hạn chế</Text>
        <Text style={styles.chuNho}>(số ngày vượt giới hạn)</Text>
      </View>

      <DongHanChe
        ten="Muối"
        soNgayVuot={tomTat.so_ngay_vuot_muoi}
        soNgayCoGhi={tomTat.so_ngay_co_ghi}
        loaiVuot="vuot_muoi"
        cacNgay={cacNgay}
        duLieuCacNgay={baoCao.cac_ngay}
        coHangCham={coHangCham}
      />
      <DongHanChe
        ten="Đường"
        soNgayVuot={tomTat.so_ngay_vuot_duong}
        soNgayCoGhi={tomTat.so_ngay_co_ghi}
        loaiVuot="vuot_duong"
        cacNgay={cacNgay}
        duLieuCacNgay={baoCao.cac_ngay}
        coHangCham={coHangCham}
      />
      <DongHanChe
        ten="Béo no"
        soNgayVuot={tomTat.so_ngay_vuot_beo_no}
        soNgayCoGhi={tomTat.so_ngay_co_ghi}
        loaiVuot="vuot_beo_no"
        cacNgay={cacNgay}
        duLieuCacNgay={baoCao.cac_ngay}
        coHangCham={coHangCham}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.small,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  dong: {
    paddingVertical: spacing.small,
    gap: 6,
  },
  hangChu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chuDong: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuVuot: {
    color: colors.warningText,
  },
  hangCham: {
    flexDirection: 'row',
    gap: 6,
  },
  cham: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chamVuot: {
    backgroundColor: colors.warning,
  },
  chamKhongVuot: {
    backgroundColor: colors.border,
  },
  chamKhongGhi: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
  },
});
