import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { BuaAn, LoaiBua } from '../bua-an/BuaAnApi';
import { BIEU_TUONG_BUA, TEN_BUA } from '../bua-an/TenBua';
import { TheBuaAn } from './TheBuaAn';

type TheBuaProps = {
  loaiBua: LoaiBua;
  danhSachMon: BuaAn[];
  onThem: () => void;
  onSuaMon: (buaAnId: number) => void;
};

// Thẻ một bữa trên trang chủ: chưa có món thì là khung nét đứt "+ Thêm"; có món thì liệt kê món và tổng calo
export function TheBua({ loaiBua, danhSachMon, onThem, onSuaMon }: TheBuaProps) {
  // Bữa chưa có món
  if (danhSachMon.length === 0) {
    return (
      <Pressable style={[styles.the, styles.theTrong]} onPress={onThem}>
        <View style={styles.hangDau}>
          <Ionicons name={BIEU_TUONG_BUA[loaiBua]} size={18} color={colors.textSecondary} />
          <Text style={styles.tenBuaTrong}>{TEN_BUA[loaiBua]}</Text>
        </View>
        <Text style={styles.chuThem}>+ Thêm</Text>
      </Pressable>
    );
  }

  // Cộng calo các món trong bữa
  let tongCalo = 0;
  for (const buaAn of danhSachMon) {
    tongCalo = tongCalo + buaAn.so_calo;
  }

  return (
    <View style={styles.the}>
      <View style={styles.hangTieuDe}>
        <View style={styles.hangDau}>
          <Ionicons name={BIEU_TUONG_BUA[loaiBua]} size={18} color={colors.primary} />
          <Text style={styles.tenBua}>{TEN_BUA[loaiBua]}</Text>
        </View>
        <Text style={styles.tongCalo}>{tongCalo.toLocaleString('vi-VN')} kcal</Text>
      </View>
      {danhSachMon.map((buaAn) => (
        <TheBuaAn key={buaAn.id} buaAn={buaAn} onPress={() => onSuaMon(buaAn.id)} />
      ))}
      <Pressable style={styles.nutThemMon} onPress={onThem}>
        <Text style={styles.chuThem}>+ Thêm món</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  theTrong: {
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hangDau: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tenBua: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tenBuaTrong: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tongCalo: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  nutThemMon: {
    minHeight: 36,
    justifyContent: 'center',
  },
  chuThem: {
    fontSize: 15,
    color: colors.primary,
  },
});
