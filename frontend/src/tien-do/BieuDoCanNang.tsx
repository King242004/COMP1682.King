import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { daysBetween, formatShortDate, shiftDateKey } from '../shared/dateKey';
import { colors } from '../shared/theme';
import type { DiemCanNang } from './TienDoApi';

type BieuDoCanNangProps = {
  diemCanNang: DiemCanNang[];
  ngayCuoi: string;
  soNgay: number;
};

// Kích thước biểu đồ (điểm ảnh): chiều cao, lề trái cho số kg, lề dưới cho ngày
const CHIEU_CAO = 150;
const LE_TRAI = 38;
const LE_PHAI = 8;
const LE_TREN = 10;
const LE_DUOI = 22;

// Trục cân nặng rộng thêm 0,5 kg ở trên và dưới cho chấm không dính mép
const KG_DU_THEM = 0.5;

// Làm tròn 1 số lẻ rồi viết kiểu Việt Nam
function vietKg(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Biểu đồ cân nặng: chấm xám là cân từng ngày, đường màu chính là trung bình 7 ngày; trục ngang là soNgay ngày tính tới ngayCuoi
export function BieuDoCanNang({ diemCanNang, ngayCuoi, soNgay }: BieuDoCanNangProps) {
  // Chiều rộng đo được sau khi màn hình vẽ xong
  const [chieuRong, setChieuRong] = useState(0);

  if (diemCanNang.length === 0) {
    return <Text style={styles.chuTrong}>Chưa có lần cân nào. Ghi cân hôm nay để bắt đầu.</Text>;
  }

  // Khoảng cân nặng của trục dọc
  let kgNhoNhat = diemCanNang[0].can_nang_kg;
  let kgLonNhat = diemCanNang[0].can_nang_kg;
  for (const diem of diemCanNang) {
    kgNhoNhat = Math.min(kgNhoNhat, diem.can_nang_kg, diem.xu_huong_kg);
    kgLonNhat = Math.max(kgLonNhat, diem.can_nang_kg, diem.xu_huong_kg);
  }
  kgNhoNhat = kgNhoNhat - KG_DU_THEM;
  kgLonNhat = kgLonNhat + KG_DU_THEM;

  // Đổi ngày ra toạ độ ngang: ngày đầu ở lề trái, ngayCuoi ở lề phải
  function toaDoNgang(ngay: string): number {
    const viTriNgay = soNgay - 1 - daysBetween(ngay, ngayCuoi);
    return LE_TRAI + (viTriNgay / (soNgay - 1)) * (chieuRong - LE_TRAI - LE_PHAI);
  }

  // Đổi số kg ra toạ độ dọc: nặng hơn thì ở trên
  function toaDoDoc(kg: number): number {
    return LE_TREN + ((kgLonNhat - kg) / (kgLonNhat - kgNhoNhat)) * (CHIEU_CAO - LE_TREN - LE_DUOI);
  }

  // Các điểm của đường xu hướng, dạng "x1,y1 x2,y2 …"
  const diemDuongXuHuong = diemCanNang.map((diem) => `${toaDoNgang(diem.ngay)},${toaDoDoc(diem.xu_huong_kg)}`).join(' ');
  const dayCuaTruc = CHIEU_CAO - LE_DUOI;

  return (
    <View onLayout={(suKien) => setChieuRong(suKien.nativeEvent.layout.width)}>
      {chieuRong > 0 ? (
        <Svg width={chieuRong} height={CHIEU_CAO}>
          {/* Đường đáy và hai số kg ở trục dọc */}
          <Line x1={LE_TRAI} y1={dayCuaTruc} x2={chieuRong - LE_PHAI} y2={dayCuaTruc} stroke={colors.border} strokeWidth={1} />
          <SvgText x={0} y={LE_TREN + 4} fontSize={11} fill={colors.textSecondary}>{vietKg(kgLonNhat)}</SvgText>
          <SvgText x={0} y={dayCuaTruc} fontSize={11} fill={colors.textSecondary}>{vietKg(kgNhoNhat)}</SvgText>

          {/* Ngày đầu và ngày cuối ở trục ngang */}
          <SvgText x={LE_TRAI} y={CHIEU_CAO - 4} fontSize={11} fill={colors.textSecondary}>
            {formatShortDate(shiftDateKey(ngayCuoi, -(soNgay - 1)))}
          </SvgText>
          <SvgText x={chieuRong - LE_PHAI} y={CHIEU_CAO - 4} fontSize={11} fill={colors.textSecondary} textAnchor="end">
            {formatShortDate(ngayCuoi)}
          </SvgText>

          {/* Chấm xám: cân từng ngày */}
          {diemCanNang.map((diem) => (
            <Circle key={diem.ngay} cx={toaDoNgang(diem.ngay)} cy={toaDoDoc(diem.can_nang_kg)} r={3} fill={colors.textSecondary} opacity={0.5} />
          ))}

          {/* Đường xu hướng; chỉ có một lần cân thì chưa có đường */}
          {diemCanNang.length >= 2 ? (
            <Polyline points={diemDuongXuHuong} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          ) : null}
        </Svg>
      ) : (
        <View style={{ height: CHIEU_CAO }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chuTrong: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: 24,
  },
});
