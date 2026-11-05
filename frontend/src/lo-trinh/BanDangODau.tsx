import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { Card } from '../shared/components/Card';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { LoTrinh, MucEo } from './LoTrinhApi';

// Chữ trên viên phân loại của ô vòng eo
const TEN_MUC_EO: Record<MucEo, string> = {
  trong_khuyen_nghi: 'Trong khuyến nghị',
  cao: 'Mỡ bụng cao',
  rat_cao: 'Mỡ bụng rất cao',
};

// Kiểu chữ dưới số: viên xanh (trong khuyến nghị), viên vàng (cảnh báo), hoặc chữ xám (không có số)
type KieuChuDuoi = 'binh_thuong' | 'canh_bao' | 'xam';

type OChiSoProps = {
  nhan: string;
  so: string;
  chuDuoi: string;
  kieuChuDuoi: KieuChuDuoi;
};

// Một ô chỉ số: nhãn nhỏ, số to, phân loại ở dưới
function OChiSo({ nhan, so, chuDuoi, kieuChuDuoi }: OChiSoProps) {
  let kieuVien: ViewStyle | null = null;
  let kieuChu: TextStyle = styles.chuXam;
  if (kieuChuDuoi === 'binh_thuong') {
    kieuVien = styles.vienBinhThuong;
    kieuChu = styles.chuBinhThuong;
  }
  if (kieuChuDuoi === 'canh_bao') {
    kieuVien = styles.vienCanhBao;
    kieuChu = styles.chuCanhBao;
  }

  return (
    <View style={styles.oChiSo}>
      <Text style={styles.nhanO}>{nhan}</Text>
      <Text style={styles.soTo}>{so}</Text>
      <View style={[styles.vien, kieuVien]}>
        <Text style={[styles.chuVien, kieuChu]}>{chuDuoi}</Text>
      </View>
    </View>
  );
}

type BanDangODauProps = {
  loTrinh: LoTrinh;
};

// Thẻ "Bạn đang ở đâu": ô BMI, ô vòng eo / chiều cao, câu nhận xét và dòng nguồn
export function BanDangODau({ loTrinh }: BanDangODauProps) {
  // Ô vòng eo: có tỉ lệ thì hiện số và mức; không có thì nói vì sao
  let soEo = '—';
  let chuDuoiEo = 'Chưa nhập vòng eo';
  let kieuChuDuoiEo: KieuChuDuoi = 'xam';
  if (loTrinh.ti_le_eo !== null && loTrinh.muc_eo !== null) {
    soEo = loTrinh.ti_le_eo.toLocaleString('vi-VN', { minimumFractionDigits: 2 });
    chuDuoiEo = TEN_MUC_EO[loTrinh.muc_eo];
    kieuChuDuoiEo = loTrinh.muc_eo === 'trong_khuyen_nghi' ? 'binh_thuong' : 'canh_bao';
  } else if (loTrinh.vong_eo_cm !== null) {
    chuDuoiEo = `Chỉ dùng khi BMI dưới ${loTrinh.bmi_toi_da_dung_eo.toLocaleString('vi-VN')}`;
  }

  return (
    <Card>
      <Text style={styles.tieuDe}>Bạn đang ở đâu</Text>

      {/* Hai ô chỉ số cạnh nhau */}
      <View style={styles.hangO}>
        <OChiSo
          nhan="BMI"
          so={loTrinh.bmi.toLocaleString('vi-VN')}
          chuDuoi={loTrinh.phan_loai_bmi}
          kieuChuDuoi={loTrinh.bmi_binh_thuong ? 'binh_thuong' : 'canh_bao'}
        />
        <OChiSo nhan="Eo / chiều cao" so={soEo} chuDuoi={chuDuoiEo} kieuChuDuoi={kieuChuDuoiEo} />
      </View>

      {/* Câu nhận xét: vàng khi cần chú ý, xanh khi trong khuyến nghị */}
      <View style={[styles.khungNhanXet, loTrinh.can_canh_bao ? styles.khungCanhBao : styles.khungBinhThuong]}>
        <Ionicons name="information-circle-outline" size={18} color={loTrinh.can_canh_bao ? colors.warningText : colors.textOnPrimaryLight} />
        <Text style={[styles.chuNhanXet, loTrinh.can_canh_bao ? styles.chuCanhBao : styles.chuBinhThuong]}>{loTrinh.cau_nhan_xet}</Text>
      </View>

      {/* Dòng nguồn */}
      <Text style={styles.chuNguon}>
        Ước tính theo chuẩn BMI người châu Á (Bộ Y tế 2022) và tỉ lệ vòng eo / chiều cao (NICE 2025). Không thay cho khám bác sĩ.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  hangO: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginBottom: spacing.medium,
  },
  oChiSo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.input,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.small,
    gap: 4,
  },
  nhanO: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  soTo: {
    fontSize: fontSizes.bigNumber,
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
    textAlign: 'center',
  },
  chuBinhThuong: {
    color: colors.textOnPrimaryLight,
  },
  chuCanhBao: {
    color: colors.warningText,
  },
  chuXam: {
    color: colors.textSecondary,
  },
  khungNhanXet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    borderRadius: radius.input,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  khungBinhThuong: {
    backgroundColor: colors.primaryLight,
  },
  khungCanhBao: {
    backgroundColor: colors.warningBackground,
  },
  chuNhanXet: {
    flex: 1,
    fontSize: fontSizes.secondary,
  },
  chuNguon: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
});
