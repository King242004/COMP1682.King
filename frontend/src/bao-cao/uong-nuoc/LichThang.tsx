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

  // Các ô của lịch: ô trống đầu tháng (null) để ngày 1 đứng đúng cột thứ, rồi các ngày, rồi ô trống cho đủ hàng cuối
  const cacO: (string | null)[] = [];
  for (let viTri = 0; viTri < soOTrong; viTri++) {
    cacO.push(null);
  }
  for (const ngay of cacNgay) {
    cacO.push(ngay);
  }
  while (cacO.length % 7 !== 0) {
    cacO.push(null);
  }

  // Chia các ô thành từng hàng 7 ô, mỗi hàng là một tuần T2…CN
  const cacHang: (string | null)[][] = [];
  for (let viTriDau = 0; viTriDau < cacO.length; viTriDau += 7) {
    cacHang.push(cacO.slice(viTriDau, viTriDau + 7));
  }

  return (
    <View>
      {/* Tiêu đề và mục tiêu */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Lượng nước cả tháng</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuMl.toLocaleString('vi-VN')} ml</Text>
      </View>

      {/* Hàng tên thứ */}
      <View style={styles.hang}>
        {tuanDauThang.map((ngay) => (
          <Text key={ngay} style={styles.tenThu}>
            {shortWeekdayName(ngay)}
          </Text>
        ))}
      </View>

      {/* Các hàng tuần, mỗi hàng 7 ô */}
      {cacHang.map((hang, viTriHang) => (
        <View key={`hang-${viTriHang}`} style={styles.hang}>
          {hang.map((ngay, viTriO) => {
            if (ngay === null) {
              return <View key={`o-trong-${viTriO}`} style={styles.oLich} />;
            }
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
      ))}

      {/* Chú thích màu: chữ tô đúng màu của ô */}
      <View style={styles.hangChuThich}>
        <View style={[styles.oMau, styles.nenDat]} />
        <Text style={[styles.chuNho, styles.chuXanh]}>Đạt</Text>
        <View style={[styles.oMau, styles.nenChuaDu]} />
        <Text style={[styles.chuNho, styles.chuXanh]}>Chưa đủ</Text>
        <View style={[styles.oMau, styles.nenKhongGhi]} />
        <Text style={[styles.chuNho, styles.chuDam]}>Không ghi</Text>
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
  chuXanh: {
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuDam: {
    fontWeight: '600',
  },
  // Một hàng 7 cột chia đều
  hang: {
    flexDirection: 'row',
  },
  tenThu: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  // Ô vuông 1/7 hàng; nền màu nằm lùi vào 2 để các ô có khe hở
  oLich: {
    flex: 1,
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
