import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { BuaAn } from '../bua-an/BuaAnApi';

type TheBuaAnProps = {
  buaAn: BuaAn;
  onPress: () => void;
};

// Một dòng món ăn trong thẻ bữa: tên, khẩu phần, calo; bấm vào để sửa
export function TheBuaAn({ buaAn, onPress }: TheBuaAnProps) {
  return (
    <Pressable style={styles.the} onPress={onPress}>
      <View style={styles.cotTen}>
        <View style={styles.hangTen}>
          <Text style={styles.tenMon}>{buaAn.ten_mon}</Text>
          {/* Món có số liệu do AI ước tính thì gắn nhãn nhỏ */}
          {buaAn.nguon_so_lieu === 'ai' ? <Text style={styles.nhanAi}>AI</Text> : null}
        </View>
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
    minHeight: 44,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cotTen: {
    flex: 1,
  },
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenMon: {
    flexShrink: 1,
    fontSize: 15,
    color: colors.text,
  },
  nhanAi: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
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
