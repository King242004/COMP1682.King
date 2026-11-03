import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { dayOfMonth, shortWeekdayName, todayKey, weekDateKeys } from '../../shared/dateKey';
import { colors, fontSizes, radius, spacing } from '../../shared/theme';
import type { NuocMotNgay } from '../BaoCaoApi';

type LichThangProps = {
  cacNgay: string[];
  duLieuCacNgay: NuocMotNgay[];
  mucTieuMl: number;
};

// Bản Tháng: lịch 7 cột T2…CN; ô đạt nền xanh nhạt, chưa đủ nền trắng viền xanh nhạt, đã qua mà không ghi nền xám, chưa tới chỉ có số mờ
export function LichThang({ cacNgay, duLieuCacNgay, mucTieuMl }: LichThangProps) {
  const homNay = todayKey();

  // Tuần chứa ngày 1: cho tên 7 cột (T2…CN) và vị trí cột của ngày 1
  const tuanDauThang = weekDateKeys(cacNgay[0]);
  const soOTrong = tuanDauThang.indexOf(cacNgay[0]);

  // Ô trống đầu lịch để ngày 1 đứng đúng cột thứ của nó
  const danhSachOTrong: number[] = [];
  for (let viTri = 0; viTri < soOTrong; viTri++) {
    danhSachOTrong.push(viTri);
  }

  return (
    <View>
      {/* Tiêu đề và mục tiêu */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Lượng nước cả tháng</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuMl.toLocaleString('vi-VN')} ml</Text>
      </View>

      {/* Hàng tên thứ */}
      <View style={styles.luoi}>
        {tuanDauThang.map((ngay) => (
          <Text key={ngay} style={styles.tenThu}>
            {shortWeekdayName(ngay)}
          </Text>
        ))}
      </View>

      {/* Các ô ngày, xuống hàng sau mỗi 7 ô */}
      <View style={styles.luoi}>
        {danhSachOTrong.map((viTri) => (
          <View key={`o-trong-${viTri}`} style={styles.oLich} />
        ))}

        {cacNgay.map((ngay) => {
          const duLieu = duLieuCacNgay.find((motNgay) => motNgay.ngay === ngay);
          const chuaToi = ngay > homNay;

          // Kiểu ô theo trạng thái ngày: không ghi, chưa tới, đạt hoặc chưa đủ
          let kieuO: ViewStyle = styles.nenKhongGhi;
          let mauChu: string = colors.textSecondary;
          if (chuaToi) {
            kieuO = styles.nenChuaToi;
            mauChu = colors.border;
          } else if (duLieu !== undefined && duLieu.so_ml >= mucTieuMl) {
            kieuO = styles.nenDat;
            mauChu = colors.textOnPrimaryLight;
          } else if (duLieu !== undefined) {
            kieuO = styles.nenChuaDu;
            mauChu = colors.textOnPrimaryLight;
          }

          return (
            <View key={ngay} style={styles.oLich}>
              <View style={[styles.nenO, kieuO]}>
                <Text style={[styles.soNgay, { color: mauChu }]}>{dayOfMonth(ngay)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Chú thích màu */}
      <View style={styles.hangChuThich}>
        <View style={[styles.oMau, styles.nenDat]} />
        <Text style={styles.chuNho}>Đạt</Text>
        <View style={[styles.oMau, styles.nenChuaDu]} />
        <Text style={styles.chuNho}>Chưa đủ</Text>
        <View style={[styles.oMau, styles.nenKhongGhi]} />
        <Text style={styles.chuNho}>Không ghi</Text>
      </View>
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
  luoi: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Mỗi cột rộng 1/7 hàng
  tenThu: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  // Ô vuông 1/7 hàng; nền màu nằm lùi vào 2 để các ô có khe hở
  oLich: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  nenO: {
    flex: 1,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nenDat: {
    backgroundColor: colors.primaryLight,
  },
  nenChuaDu: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  nenKhongGhi: {
    backgroundColor: colors.card,
  },
  nenChuaToi: {
    backgroundColor: colors.surface,
  },
  soNgay: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  hangChuThich: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.small,
  },
  oMau: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginLeft: spacing.small,
  },
});
