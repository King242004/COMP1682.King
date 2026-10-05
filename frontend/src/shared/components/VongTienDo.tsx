import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

type VongTienDoProps = {
  kichThuoc: number;
  doDay: number;
  phanTram: number;
  mau: string;
  // Chữ hoặc số đặt ở giữa vòng (không bắt buộc)
  children?: ReactNode;
};

// Vòng tròn tiến độ: vòng xám làm nền, cung màu dài theo phần trăm (tối đa 100%), bắt đầu từ đỉnh
export function VongTienDo({ kichThuoc, doDay, phanTram, mau, children }: VongTienDoProps) {
  const tam = kichThuoc / 2;
  const banKinh = (kichThuoc - doDay) / 2;
  const chuVi = 2 * Math.PI * banKinh;

  // Giữ phần trăm trong khoảng 0 tới 100 rồi đổi ra độ dài cung
  let phanTramHopLe = phanTram;
  if (phanTramHopLe < 0) {
    phanTramHopLe = 0;
  }
  if (phanTramHopLe > 100) {
    phanTramHopLe = 100;
  }
  const doDaiCung = (chuVi * phanTramHopLe) / 100;

  return (
    <View style={{ width: kichThuoc, height: kichThuoc }}>
      <Svg width={kichThuoc} height={kichThuoc}>
        <Circle cx={tam} cy={tam} r={banKinh} stroke={colors.border} strokeWidth={doDay} fill="none" />
        {/* Chưa có gì thì không vẽ cung, tránh hiện một chấm tròn */}
        {doDaiCung > 0 ? (
          <Circle
            cx={tam}
            cy={tam}
            r={banKinh}
            stroke={mau}
            strokeWidth={doDay}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${doDaiCung} ${chuVi}`}
            rotation={-90}
            origin={`${tam}, ${tam}`}
          />
        ) : null}
      </Svg>
      <View style={styles.giua}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  giua: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
