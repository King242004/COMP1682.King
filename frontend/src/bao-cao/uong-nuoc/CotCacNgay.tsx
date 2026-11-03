import { StyleSheet, Text, View } from 'react-native';

import { shortWeekdayName, todayKey } from '../../shared/dateKey';
import { colors, fontSizes, spacing } from '../../shared/theme';
import type { NuocMotNgay } from '../BaoCaoApi';

// Chiều cao vùng vẽ cột và chiều cao vạch xám của ngày không ghi
const CHIEU_CAO_VUNG_VE = 120;
const CHIEU_CAO_KHONG_GHI = 4;

type CotCacNgayProps = {
  cacNgay: string[];
  duLieuCacNgay: NuocMotNgay[];
  mucTieuMl: number;
};

// Bản Tuần: 7 cột T2…CN cao theo ml, vạch đứt ở mức mục tiêu; cột đạt màu chính, chưa đạt xanh nhạt, đã qua mà không ghi là vạch xám thấp, ngày chưa tới để trống
export function CotCacNgay({ cacNgay, duLieuCacNgay, mucTieuMl }: CotCacNgayProps) {
  const homNay = todayKey();

  // Thang đo: số lớn hơn giữa mục tiêu và ngày uống nhiều nhất, để cột cao nhất vừa vùng vẽ
  let thangDo = mucTieuMl;
  for (const motNgay of duLieuCacNgay) {
    if (motNgay.so_ml > thangDo) {
      thangDo = motNgay.so_ml;
    }
  }
  const chieuCaoMucTieu = (mucTieuMl / thangDo) * CHIEU_CAO_VUNG_VE;

  return (
    <View>
      {/* Tiêu đề và mục tiêu */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Lượng nước từng ngày</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuMl.toLocaleString('vi-VN')} ml</Text>
      </View>

      {/* Vùng vẽ: 7 cột, rồi vạch mục tiêu nằm đè lên trên */}
      <View style={styles.vungVe}>
        {cacNgay.map((ngay) => {
          const duLieu = duLieuCacNgay.find((motNgay) => motNgay.ngay === ngay);
          const chuaToi = ngay > homNay;

          // Chiều cao và màu cột theo trạng thái ngày: có uống, đã qua mà không ghi, hoặc chưa tới
          let chieuCao = 0;
          let mauCot: string = colors.primaryLight;
          if (duLieu !== undefined) {
            chieuCao = (duLieu.so_ml / thangDo) * CHIEU_CAO_VUNG_VE;
            if (duLieu.so_ml >= mucTieuMl) {
              mauCot = colors.primary;
            }
          } else if (!chuaToi) {
            chieuCao = CHIEU_CAO_KHONG_GHI;
            mauCot = colors.border;
          }

          return (
            <View key={ngay} style={styles.oCot}>
              <View style={[styles.cot, { height: chieuCao, backgroundColor: mauCot }]} />
            </View>
          );
        })}
        <View style={[styles.vachMucTieu, { bottom: chieuCaoMucTieu }]} />
        <Text style={[styles.soMucTieu, { bottom: chieuCaoMucTieu + 2 }]}>{mucTieuMl.toLocaleString('vi-VN')}</Text>
      </View>

      {/* Chữ thứ dưới mỗi cột; ngày chưa tới chữ mờ */}
      <View style={styles.hangThu}>
        {cacNgay.map((ngay) => (
          <Text key={ngay} style={[styles.chuThu, ngay > homNay ? styles.chuChuaToi : null]}>
            {shortWeekdayName(ngay)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.large,
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
  vungVe: {
    height: CHIEU_CAO_VUNG_VE,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  oCot: {
    flex: 1,
    alignItems: 'center',
  },
  cot: {
    width: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  // Vạch đứt ngang ở mức mục tiêu (iPhone chỉ vẽ viền đứt khi có viền cả 4 cạnh nên dùng khung cao 1)
  vachMucTieu: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    borderColor: colors.textSecondary,
  },
  soMucTieu: {
    position: 'absolute',
    left: 0,
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 2,
  },
  hangThu: {
    flexDirection: 'row',
    marginTop: spacing.small,
  },
  chuThu: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  chuChuaToi: {
    color: colors.border,
  },
});
