import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayOfMonth, shortWeekdayName, todayKey, weekDateKeys } from '../../shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';
import type { NgayBaoCao } from '../BaoCaoApi';

type LichThangProps = {
  cacNgay: string[];
  duLieuCacNgay: NgayBaoCao[];
  mucTieuCalo: number;
  ngayChon: string;
  onChon: (ngay: string) => void;
};

// Bản Tháng: lịch 7 cột T2…CN; ô đạt nền xanh nhạt, vượt nền vàng, đã qua mà không ghi nền xám, ngày chưa tới chỉ có số mờ và không bấm được
export function LichThang({ cacNgay, duLieuCacNgay, mucTieuCalo, ngayChon, onChon }: LichThangProps) {
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
      {/* Tiêu đề và mục tiêu calo */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Calo cả tháng</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuCalo.toLocaleString('vi-VN')}</Text>
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
          const dangChon = ngay === ngayChon;

          // Màu nền và màu chữ theo trạng thái ngày: không ghi, chưa tới, vượt hoặc đạt
          let mauNen: string = colors.card;
          let mauChu: string = colors.textSecondary;
          if (chuaToi) {
            mauNen = colors.surface;
            mauChu = colors.border;
          } else if (duLieu !== undefined && duLieu.vuot_calo) {
            mauNen = colors.warningBackground;
            mauChu = colors.warningText;
          } else if (duLieu !== undefined) {
            mauNen = colors.primaryLight;
            mauChu = colors.textOnPrimaryLight;
          }

          return (
            <Pressable
              key={ngay}
              style={({ pressed }) => [styles.oLich, pressed ? styles.dangBam : null]}
              disabled={chuaToi}
              onPress={() => onChon(ngay)}
            >
              <View style={[styles.nenO, { backgroundColor: mauNen }, dangChon ? styles.nenODangChon : null]}>
                <Text style={[styles.soNgay, { color: mauChu }]}>{dayOfMonth(ngay)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Chú thích màu */}
      <View style={styles.hangChuThich}>
        <View style={[styles.oMau, styles.oMauDat]} />
        <Text style={styles.chuNho}>Đạt</Text>
        <View style={[styles.oMau, styles.oMauVuot]} />
        <Text style={styles.chuNho}>Vượt</Text>
        <View style={[styles.oMau, styles.oMauKhongGhi]} />
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
  // Ô vuông 1/7 hàng là chỗ bấm; nền màu nằm lùi vào 2 để các ô có khe hở
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
  nenODangChon: {
    borderWidth: 2,
    borderColor: colors.text,
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
    marginBottom: spacing.medium,
  },
  oMau: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginLeft: spacing.small,
  },
  oMauDat: {
    backgroundColor: colors.primaryLight,
  },
  oMauVuot: {
    backgroundColor: colors.warningBackground,
  },
  oMauKhongGhi: {
    backgroundColor: colors.card,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
