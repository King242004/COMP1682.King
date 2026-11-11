import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '../../shared/components/ProgressRing';
import { shortWeekdayName, todayKey } from '../../shared/dateKey';
import { colors, fontSizes, pressedOpacity, spacing } from '../../shared/theme';
import type { NgayBaoCao } from '../BaoCaoApi';

type VongCacNgayProps = {
  cacNgay: string[];
  duLieuCacNgay: NgayBaoCao[];
  mucTieuCalo: number;
  ngayChon: string;
  onChon: (ngay: string) => void;
};

// Bản Tuần: 7 vòng nhỏ T2…CN, cung dài theo calo / mục tiêu; vượt thì vòng đầy màu cảnh báo; đã qua mà không ghi là vòng đứt; ngày chưa tới không bấm được
export function VongCacNgay({ cacNgay, duLieuCacNgay, mucTieuCalo, ngayChon, onChon }: VongCacNgayProps) {
  const homNay = todayKey();

  return (
    <View>
      {/* Tiêu đề và mục tiêu calo */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Calo từng ngày</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuCalo.toLocaleString('vi-VN')}</Text>
      </View>

      {/* Hàng 7 vòng, chữ thứ ở dưới */}
      <View style={styles.hangVong}>
        {cacNgay.map((ngay) => {
          const duLieu = duLieuCacNgay.find((motNgay) => motNgay.ngay === ngay);
          const chuaToi = ngay > homNay;
          const dangChon = ngay === ngayChon;

          // Cung dài theo calo đã ăn so với mục tiêu; vượt thì đổi màu cảnh báo
          let phanTram = 0;
          let mauCung: string = colors.primary;
          if (duLieu !== undefined) {
            phanTram = (duLieu.tong_hop.tong_calo / mucTieuCalo) * 100;
            if (duLieu.vuot_calo) {
              mauCung = colors.warning;
            }
          }

          return (
            <Pressable
              key={ngay}
              style={({ pressed }) => [styles.oNgay, pressed ? styles.dangBam : null]}
              disabled={chuaToi}
              onPress={() => onChon(ngay)}
            >
              <View style={[styles.khungVong, dangChon ? styles.khungVongDangChon : null]}>
                {duLieu === undefined && !chuaToi ? (
                  <View style={styles.vongDut} />
                ) : (
                  <ProgressRing size={36} thickness={4} percent={phanTram} color={mauCung} />
                )}
              </View>
              <Text style={[styles.chuThu, dangChon ? styles.chuThuDangChon : null, chuaToi ? styles.chuChuaToi : null]}>
                {shortWeekdayName(ngay)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Chú thích màu: chữ tô đúng màu của vòng */}
      <Text style={styles.chuThich}>
        <Text style={styles.chuXanh}>Xanh</Text>: chưa vượt · <Text style={styles.chuVang}>Vàng</Text>: vượt · <Text style={styles.chuVongDut}>Vòng đứt</Text>: không ghi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.medium,
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
  hangVong: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  oNgay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  // Khung tròn 44 bao quanh vòng 36, để chỗ bấm đủ lớn và có chỗ cho viền ngày đang chọn
  khungVong: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  khungVongDangChon: {
    borderColor: colors.text,
  },
  vongDut: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  chuThu: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  chuThuDangChon: {
    color: colors.text,
    fontWeight: '600',
  },
  chuChuaToi: {
    color: colors.border,
  },
  chuThich: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  chuXanh: {
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuVang: {
    fontWeight: '600',
    color: colors.warningText,
  },
  chuVongDut: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
