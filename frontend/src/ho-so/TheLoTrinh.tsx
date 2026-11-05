import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { vietCanNang } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import type { LoTrinh } from '../lo-trinh/LoTrinhApi';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';

type TheLoTrinhProps = {
  loTrinh: LoTrinh;
  onPress: () => void;
};

// Thẻ "Lộ trình" ở tab Hồ sơ, chỉ để xem: câu nhận xét, đi từ cân nào tới cân nào, thanh tiến độ; bấm cả thẻ mở màn Lộ trình
export function TheLoTrinh({ loTrinh, onPress }: TheLoTrinhProps) {
  const { donVi, heSo } = useDonVi();

  // Dòng đích: "72 kg → 65 kg · khoảng 3–4 tháng" (tăng cân không có số tháng), "Giữ quanh 52 kg", hoặc chưa đặt
  let dongDich = 'Chưa đặt cân mục tiêu';
  if (loTrinh.can_muc_tieu_kg !== null && loTrinh.can_bat_dau_kg !== null) {
    dongDich = `${vietCanNang(loTrinh.can_bat_dau_kg, donVi, heSo)} → ${vietCanNang(loTrinh.can_muc_tieu_kg, donVi, heSo)}`;
    if (loTrinh.so_thang !== null) {
      let soThang = `${loTrinh.so_thang.it_nhat}–${loTrinh.so_thang.nhieu_nhat}`;
      if (loTrinh.so_thang.it_nhat === loTrinh.so_thang.nhieu_nhat) {
        soThang = `${loTrinh.so_thang.it_nhat}`;
      }
      dongDich = `${dongDich} · khoảng ${soThang} tháng`;
    }
  } else if (loTrinh.khoang_giu !== null) {
    dongDich = `Giữ quanh ${vietCanNang(loTrinh.khoang_giu.can_giu_quanh_kg, donVi, heSo)}`;
  }

  return (
    <Pressable style={({ pressed }) => [styles.the, pressed ? styles.dangBam : null]} onPress={onPress}>
      {/* Hàng trên: biểu tượng đường đi, tên thẻ, dấu › */}
      <View style={styles.hangTren}>
        <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.primary} />
        <Text style={styles.tieuDe}>Lộ trình</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>

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
    </Pressable>
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
    gap: spacing.small,
    ...shadows.card,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tieuDe: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
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
  dangBam: {
    opacity: pressedOpacity,
  },
});
