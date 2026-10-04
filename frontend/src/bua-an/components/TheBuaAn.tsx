import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../shared/theme';
import type { BuaAn } from '../BuaAnApi';

type TheBuaAnProps = {
  buaAn: BuaAn;
  onPress: () => void;
};

// Một dòng món ăn trên trang chủ: tên, khẩu phần, calo; bấm vào để sửa
export function TheBuaAn({ buaAn, onPress }: TheBuaAnProps) {
  return (
    <Pressable style={styles.the} onPress={onPress}>
      <View style={styles.cotTen}>
        <Text style={styles.tenMon}>{buaAn.ten_mon}</Text>
        {buaAn.khau_phan ? <Text style={styles.khauPhan}>{buaAn.khau_phan}</Text> : null}
      </View>
      <Text style={styles.soCalo}>{buaAn.so_calo.toLocaleString('vi-VN')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  the: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 6,
  },
  cotTen: {
    flex: 1,
  },
  tenMon: {
    fontSize: 15,
    color: colors.text,
  },
  khauPhan: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  soCalo: {
    fontSize: 15,
    color: colors.text,
  },
});
