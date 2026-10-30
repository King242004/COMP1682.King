import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { BuaAn, LoaiBua } from '../bua-an/BuaAnApi';
import { BIEU_TUONG_BUA, MAU_BUA, TEN_BUA } from '../bua-an/TenBua';
import { TheBuaAn } from './TheBuaAn';

type TheBuaProps = {
  loaiBua: LoaiBua;
  danhSachMon: BuaAn[];
  onThem: () => void;
  onSuaMon: (buaAnId: number) => void;
};

// Hộp một bữa trên trang chủ: ô biểu tượng, tên bữa, tổng kcal, nút +; từng món; thanh 3 chất theo số gam
export function TheBua({ loaiBua, danhSachMon, onThem, onSuaMon }: TheBuaProps) {
  const mauBua = MAU_BUA[loaiBua];

  // Cộng calo cả bữa; đạm, tinh bột, béo chỉ cộng món có đủ 3 số (món thiếu đã có nhãn "Chưa đủ số" trên dòng món)
  let tongCalo = 0;
  let tongDam = 0;
  let tongTinhBot = 0;
  let tongBeo = 0;
  for (const buaAn of danhSachMon) {
    tongCalo = tongCalo + buaAn.so_calo;
    if (buaAn.dam_g !== null && buaAn.tinh_bot_g !== null && buaAn.beo_g !== null) {
      tongDam = tongDam + buaAn.dam_g;
      tongTinhBot = tongTinhBot + buaAn.tinh_bot_g;
      tongBeo = tongBeo + buaAn.beo_g;
    }
  }

  // Làm tròn số gam một lần, thanh và chữ dùng chung số này để luôn khớp nhau (cà phê 0,2 g đạm thành 0, không hiện thanh)
  const damLamTron = Math.round(tongDam);
  const tinhBotLamTron = Math.round(tongTinhBot);
  const beoLamTron = Math.round(tongBeo);
  const tongGam = damLamTron + tinhBotLamTron + beoLamTron;

  return (
    <View style={styles.hop}>
      {/* Hàng đầu: ô biểu tượng màu của bữa, tên bữa, tổng kcal (khi có món), nút + */}
      <View style={styles.hangDau}>
        <View style={[styles.oBieuTuong, { backgroundColor: mauBua.nen }]}>
          <Ionicons name={BIEU_TUONG_BUA[loaiBua]} size={18} color={mauBua.mau} />
        </View>
        <Text style={styles.tenBua}>{TEN_BUA[loaiBua]}</Text>
        {danhSachMon.length > 0 ? (
          <Text style={styles.tongCalo}>
            {tongCalo.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
          </Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.nutThem, pressed ? styles.dangBam : null]}
          onPress={onThem}
          hitSlop={8}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Mỗi món một dòng, bấm để sửa */}
      {danhSachMon.map((buaAn) => (
        <TheBuaAn key={buaAn.id} buaAn={buaAn} onPress={() => onSuaMon(buaAn.id)} />
      ))}

      {/* Thanh 3 màu dài theo số gam đạm / tinh bột / béo, số gam ghi ngay dưới; làm tròn ra 0 cả ba (cà phê, trà) thì không hiện gì */}
      {tongGam > 0 ? (
        <View style={styles.khoiChat}>
          <View style={styles.thanh}>
            <View style={{ flex: damLamTron, backgroundColor: colors.protein }} />
            <View style={{ flex: tinhBotLamTron, backgroundColor: colors.carbs }} />
            <View style={{ flex: beoLamTron, backgroundColor: colors.fat }} />
          </View>
          <View style={styles.hangSoGam}>
            <Text style={[styles.soGam, { color: colors.protein }]}>Đạm {damLamTron.toLocaleString('vi-VN')} g</Text>
            <Text style={[styles.soGam, { color: colors.carbs }]}>Tinh bột {tinhBotLamTron.toLocaleString('vi-VN')} g</Text>
            <Text style={[styles.soGam, { color: colors.fat }]}>Béo {beoLamTron.toLocaleString('vi-VN')} g</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hop: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    gap: spacing.small,
    ...shadows.card,
  },
  hangDau: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  oBieuTuong: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenBua: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tongCalo: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  donVi: {
    fontSize: fontSizes.label,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  nutThem: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  khoiChat: {
    marginTop: 4,
  },
  thanh: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  hangSoGam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  soGam: {
    fontSize: fontSizes.label,
  },
});
