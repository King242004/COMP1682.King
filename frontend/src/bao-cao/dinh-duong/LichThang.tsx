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
      {/* Tiêu đề và mục tiêu calo */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Calo cả tháng</Text>
        <Text style={styles.chuNho}>mục tiêu {mucTieuCalo.toLocaleString('vi-VN')}</Text>
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
      ))}

      {/* Chú thích màu: chữ tô đúng màu của ô */}
      <View style={styles.hangChuThich}>
        <View style={[styles.oMau, styles.oMauDat]} />
        <Text style={[styles.chuNho, styles.chuDat]}>Đạt</Text>
        <View style={[styles.oMau, styles.oMauVuot]} />
        <Text style={[styles.chuNho, styles.chuVuot]}>Vượt</Text>
        <View style={[styles.oMau, styles.oMauKhongGhi]} />
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
  // Ô vuông 1/7 hàng là chỗ bấm; nền màu nằm lùi vào 2 để các ô có khe hở
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
  chuDat: {
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuVuot: {
    fontWeight: '600',
    color: colors.warningText,
  },
  chuDam: {
    fontWeight: '600',
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
