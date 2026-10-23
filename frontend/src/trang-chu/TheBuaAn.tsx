import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { BuaAn } from '../bua-an/BuaAnApi';

type TheBuaAnProps = {
  buaAn: BuaAn;
  onPress: () => void;
};

// Một dòng món ăn nền kem trong hộp bữa: tên, khẩu phần, calo, dấu ›; bấm vào để sửa
export function TheBuaAn({ buaAn, onPress }: TheBuaAnProps) {
  return (
    <Pressable style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]} onPress={onPress}>
      <View style={styles.cotTen}>
        <View style={styles.hangTen}>
          <Text style={styles.tenMon}>{buaAn.ten_mon}</Text>
          {/* Món có số liệu do AI ước tính thì gắn nhãn nhỏ */}
          {buaAn.nguon_so_lieu === 'ai' ? <Text style={styles.nhanAi}>AI</Text> : null}
          {/* Món thiếu đạm, tinh bột hoặc béo thì gắn nhãn, để người dùng biết bấm vào bổ sung */}
          {buaAn.dam_g === null || buaAn.tinh_bot_g === null || buaAn.beo_g === null ? (
            <Text style={styles.nhanThieuSo}>Chưa đủ số</Text>
          ) : null}
        </View>
        {buaAn.khau_phan ? <Text style={styles.khauPhan}>{buaAn.khau_phan}</Text> : null}
      </View>
      <Text style={styles.soCalo}>{buaAn.so_calo.toLocaleString('vi-VN')} kcal</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    minHeight: 44,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    backgroundColor: colors.background,
  },
  dangBam: {
    opacity: pressedOpacity,
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
    fontSize: fontSizes.body,
    color: colors.text,
  },
  nhanAi: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  nhanThieuSo: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  khauPhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  soCalo: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
});
