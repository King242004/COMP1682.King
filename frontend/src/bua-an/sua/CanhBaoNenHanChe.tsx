import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../shared/theme';
import type { NhatKyNgay } from '../BuaAnApi';

// Muối, đường, béo no của một món (gam); null là chưa có số
export type SoNenHanChe = {
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
};

type CanhBaoNenHanCheProps = {
  monNay: SoNenHanChe;
  // Món lúc mới mở màn sửa: số của nó đã nằm trong tổng của ngày nên phải trừ ra
  monCu: SoNenHanChe | null;
  nhatKy: NhatKyNgay | null;
};

// Số liệu một chất để vẽ: của món này, cả ngày nếu thêm món này, giới hạn, có vượt không
type MotChat = {
  ten: string;
  soCuaMon: number | null;
  caNgay: number | null;
  gioiHan: number | null;
  vuot: boolean;
};

// Làm tròn 1 số lẻ rồi viết kiểu Việt Nam, ví dụ 4,5
function vietSoGam(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Tính cả ngày sẽ là bao nhiêu nếu thêm món này, và có vượt giới hạn không
function gomMotChat(ten: string, soCuaMon: number | null, soCuaMonCu: number | null, tongCuaNgay: number | null, gioiHan: number | null): MotChat {
  if (soCuaMon === null || tongCuaNgay === null || gioiHan === null) {
    return { ten: ten, soCuaMon: soCuaMon, caNgay: null, gioiHan: gioiHan, vuot: false };
  }
  let caNgay = tongCuaNgay + soCuaMon;
  if (soCuaMonCu !== null) {
    caNgay = caNgay - soCuaMonCu;
  }
  return { ten: ten, soCuaMon: soCuaMon, caNgay: caNgay, gioiHan: gioiHan, vuot: caNgay > gioiHan };
}

// Ba ô muối, đường, béo no của món (ô vàng nếu làm cả ngày vượt giới hạn) và một dòng liệt kê chất bị vượt
export function CanhBaoNenHanChe({ monNay, monCu, nhatKy }: CanhBaoNenHanCheProps) {
  // Món chưa có số nào (thường là nhập tay) thì không hiện gì
  if (monNay.muoi_g === null && monNay.duong_g === null && monNay.beo_no_g === null) {
    return null;
  }

  // Chưa tải xong nhật ký của ngày thì chỉ hiện số của món, chưa so với giới hạn
  let tongMuoi: number | null = null;
  let tongDuong: number | null = null;
  let tongBeoNo: number | null = null;
  let gioiHanMuoi: number | null = null;
  let gioiHanDuong: number | null = null;
  let gioiHanBeoNo: number | null = null;
  if (nhatKy && nhatKy.gioi_han_nen_han_che) {
    tongMuoi = nhatKy.tong_hop.tong_muoi_g;
    tongDuong = nhatKy.tong_hop.tong_duong_g;
    tongBeoNo = nhatKy.tong_hop.tong_beo_no_g;
    gioiHanMuoi = nhatKy.gioi_han_nen_han_che.muoi_g_toi_da;
    gioiHanDuong = nhatKy.gioi_han_nen_han_che.duong_g_toi_da;
    gioiHanBeoNo = nhatKy.gioi_han_nen_han_che.beo_no_g_toi_da;
  }

  const cacChat = [
    gomMotChat('Muối', monNay.muoi_g, monCu ? monCu.muoi_g : null, tongMuoi, gioiHanMuoi),
    gomMotChat('Đường', monNay.duong_g, monCu ? monCu.duong_g : null, tongDuong, gioiHanDuong),
    gomMotChat('Béo no', monNay.beo_no_g, monCu ? monCu.beo_no_g : null, tongBeoNo, gioiHanBeoNo),
  ];

  // Dòng cảnh báo: "muối 9,2 / 5 g · đường 63 / 43 g"
  const cacPhanVuot: string[] = [];
  for (const chat of cacChat) {
    if (chat.vuot && chat.caNgay !== null && chat.gioiHan !== null) {
      cacPhanVuot.push(`${chat.ten.toLowerCase()} ${vietSoGam(chat.caNgay)} / ${vietSoGam(chat.gioiHan)} g`);
    }
  }

  return (
    <View style={styles.khoi}>
      <View style={styles.hangO}>
        {cacChat.map((chat) => (
          <View key={chat.ten} style={[styles.o, chat.vuot ? styles.oVuot : null]}>
            <Text style={[styles.ten, chat.vuot ? styles.chuVuot : null]}>{chat.ten}</Text>
            <Text style={[styles.so, chat.vuot ? styles.chuVuot : null]}>
              {chat.soCuaMon === null ? '—' : `${vietSoGam(chat.soCuaMon)} g`}
            </Text>
          </View>
        ))}
      </View>
      {cacPhanVuot.length > 0 ? (
        <Text style={styles.dongCanhBao}>Thêm món này, cả ngày sẽ quá mức: {cacPhanVuot.join(' · ')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khoi: {
    marginTop: 8,
  },
  hangO: {
    flexDirection: 'row',
    gap: 8,
  },
  o: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    backgroundColor: colors.background,
  },
  oVuot: {
    backgroundColor: colors.warningBackground,
  },
  ten: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  so: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chuVuot: {
    color: colors.warningText,
  },
  dongCanhBao: {
    fontSize: 13,
    color: colors.warningText,
    marginTop: 8,
  },
});
