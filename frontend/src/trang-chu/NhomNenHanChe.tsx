import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { NhatKyNgay } from '../bua-an/BuaAnApi';

type OHanCheProps = {
  ten: string;
  daAn: number;
  gioiHan: number;
};

// Làm tròn 1 số lẻ rồi viết kiểu Việt Nam, ví dụ 0,3
function vietSoGam(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Một ô muối, đường hoặc béo no: ghi còn bao nhiêu gam, hoặc vượt bao nhiêu gam (ô vượt nền vàng)
function OHanChe({ ten, daAn, gioiHan }: OHanCheProps) {
  const daVuot = daAn > gioiHan;
  let phanTram = 0;
  if (gioiHan > 0) {
    phanTram = Math.min(100, (daAn / gioiHan) * 100);
  }

  let chuChinh = `còn ${vietSoGam(gioiHan - daAn)} g`;
  if (daVuot) {
    chuChinh = `vượt ${vietSoGam(daAn - gioiHan)} g`;
  }

  return (
    <View style={[styles.o, daVuot ? styles.oVuot : null]}>
      <Text style={[styles.ten, daVuot ? styles.chuVuot : null]}>{ten}</Text>
      <Text style={[styles.chuChinh, daVuot ? styles.chuVuot : null]}>{chuChinh}</Text>
      <View style={[styles.thanhNen, daVuot ? styles.thanhNenVuot : null]}>
        <View style={[styles.thanhDay, { width: `${phanTram}%` }, daVuot ? styles.thanhDayVuot : null]} />
      </View>
      <Text style={[styles.chuNho, daVuot ? styles.chuVuot : null]}>
        {vietSoGam(daAn)} / {vietSoGam(gioiHan)} g
      </Text>
    </View>
  );
}

// Nhóm "Nên hạn chế" trên trang chủ: ba ô muối, đường, béo no so với giới hạn mỗi ngày (Bộ Y tế 2016)
export function NhomNenHanChe({ nhatKy }: { nhatKy: NhatKyNgay }) {
  const gioiHan = nhatKy.gioi_han_nen_han_che;
  if (!gioiHan) {
    return null;
  }
  const tongHop = nhatKy.tong_hop;

  return (
    <View style={styles.nhom}>
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Nên hạn chế</Text>
        <Text style={styles.chuNho}>giới hạn mỗi ngày</Text>
      </View>
      <View style={styles.hangO}>
        <OHanChe ten="Muối" daAn={tongHop.tong_muoi_g} gioiHan={gioiHan.muoi_g_toi_da} />
        <OHanChe ten="Đường" daAn={tongHop.tong_duong_g} gioiHan={gioiHan.duong_g_toi_da} />
        <OHanChe ten="Béo no" daAn={tongHop.tong_beo_no_g} gioiHan={gioiHan.beo_no_g_toi_da} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nhom: {
    marginBottom: 8,
  },
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  tieuDe: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hangO: {
    flexDirection: 'row',
    gap: 8,
  },
  o: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    gap: 4,
  },
  oVuot: {
    borderColor: colors.warningBackground,
    backgroundColor: colors.warningBackground,
  },
  ten: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chuChinh: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  thanhNen: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  thanhNenVuot: {
    backgroundColor: colors.background,
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.textSecondary,
  },
  thanhDayVuot: {
    backgroundColor: colors.warning,
  },
  chuNho: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chuVuot: {
    color: colors.warningText,
  },
});
