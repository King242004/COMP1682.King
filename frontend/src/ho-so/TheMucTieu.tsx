import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { vietCanNang } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import type { LoTrinh } from '../lo-trinh/LoTrinhApi';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { HoSo } from './HoSoApi';

type TheMucTieuProps = {
  hoSo: HoSo;
  // Lộ trình đang tải thì chưa có, thẻ chỉ hiện phần calo
  loTrinh: LoTrinh | null;
  onPress: () => void;
};

// Thẻ "Mục tiêu" ở tab Hồ sơ, chỉ để xem: phần cân nặng (nhận xét, đích, thanh tiến độ) và phần calo (kcal, BMI · BMR · TDEE); bấm cả thẻ mở màn Lộ trình
export function TheMucTieu({ hoSo, loTrinh, onPress }: TheMucTieuProps) {
  const { donVi, heSo } = useDonVi();

  // Dòng đích: "72 kg → 65 kg · khoảng 4 tháng" (tăng cân không có số tháng), "Giữ quanh 52 kg", hoặc chưa đặt
  let dongDich = 'Chưa đặt cân mục tiêu';
  if (loTrinh !== null && loTrinh.can_muc_tieu_kg !== null && loTrinh.can_bat_dau_kg !== null) {
    dongDich = `${vietCanNang(loTrinh.can_bat_dau_kg, donVi, heSo)} → ${vietCanNang(loTrinh.can_muc_tieu_kg, donVi, heSo)}`;
    if (loTrinh.so_thang !== null) {
      dongDich = `${dongDich} · khoảng ${loTrinh.so_thang} tháng`;
    }
  } else if (loTrinh !== null && loTrinh.khoang_giu !== null) {
    dongDich = `Giữ quanh ${vietCanNang(loTrinh.khoang_giu.can_giu_quanh_kg, donVi, heSo)}`;
  }

  return (
    <Pressable style={({ pressed }) => [styles.the, pressed ? styles.dangBam : null]} onPress={onPress}>
      {/* Hàng trên: biểu tượng bia, tên thẻ, dấu › */}
      <View style={styles.hangTren}>
        <MaterialCommunityIcons name="bullseye-arrow" size={18} color={colors.primary} />
        <Text style={styles.tieuDe}>Mục tiêu</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>

      {/* Phần cân nặng: chỉ khi lộ trình đã tải xong */}
      {loTrinh !== null ? (
        <View style={styles.phanCanNang}>
          {/* Nhãn câu nhận xét: vàng khi cần chú ý, xanh khi trong khuyến nghị */}
          <View style={[styles.nhan, loTrinh.can_canh_bao ? styles.nhanCanhBao : styles.nhanBinhThuong]}>
            <Text style={[styles.chuNhan, loTrinh.can_canh_bao ? styles.chuCanhBao : styles.chuBinhThuong]}>{loTrinh.cau_nhan_xet}</Text>
          </View>

          <Text style={styles.dongDich}>{dongDich}</Text>

          {/* Thanh tiến độ: chỉ khi giảm / tăng và đã đặt cân mục tiêu */}
          {loTrinh.tien_do !== null ? (
            <View>
              <View style={styles.thanhNen}>
                <View style={[styles.thanhDay, { width: `${loTrinh.tien_do.phan_tram}%` }]} />
              </View>
              <Text style={styles.chuNho}>đã đi được {loTrinh.tien_do.phan_tram}%</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.duongKe} />

      {/* Phần calo: mục tiêu calo mỗi ngày và 3 ô BMI · BMR · TDEE */}
      <Text style={styles.chuNho}>Mỗi ngày</Text>
      <Text style={styles.soCalo}>
        {hoSo.muc_tieu_calo?.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
      </Text>
      <View style={styles.hangChiSo}>
        <OChiSo nhan="BMI" giaTri={hoSo.bmi?.toLocaleString('vi-VN') ?? ''} chuNho={hoSo.phan_loai_bmi ?? ''} />
        <OChiSo nhan="BMR" giaTri={`${hoSo.chuyen_hoa_co_ban?.toLocaleString('vi-VN')} kcal`} chuNho="Đốt khi nghỉ" />
        <OChiSo nhan="TDEE" giaTri={`${hoSo.nang_luong_giu_can?.toLocaleString('vi-VN')} kcal`} chuNho="Để giữ cân" />
      </View>
    </Pressable>
  );
}

// Một ô trong hàng BMI · BMR · TDEE: tên chỉ số, số đậm, chữ nhỏ giải thích
function OChiSo({ nhan, giaTri, chuNho }: { nhan: string; giaTri: string; chuNho: string }) {
  return (
    <View style={styles.oChiSo}>
      <Text style={styles.nhanNhoGiua}>{nhan}</Text>
      <Text style={styles.giaTriChiSo}>{giaTri}</Text>
      <Text style={styles.nhanNhoGiua}>{chuNho}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.large,
    marginBottom: spacing.medium,
    ...shadows.card,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  tieuDe: {
    flex: 1,
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  phanCanNang: {
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  nhan: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 4,
  },
  nhanBinhThuong: {
    backgroundColor: colors.primaryLight,
  },
  nhanCanhBao: {
    backgroundColor: colors.warningBackground,
  },
  chuNhan: {
    fontSize: fontSizes.secondary,
  },
  chuBinhThuong: {
    color: colors.textOnPrimaryLight,
  },
  chuCanhBao: {
    color: colors.warningText,
  },
  dongDich: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  thanhNen: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 4,
  },
  duongKe: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.medium,
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.primary,
  },
  donVi: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  hangChiSo: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  oChiSo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.medium,
  },
  nhanNhoGiua: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  giaTriChiSo: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
    textAlign: 'center',
    marginVertical: 2,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
