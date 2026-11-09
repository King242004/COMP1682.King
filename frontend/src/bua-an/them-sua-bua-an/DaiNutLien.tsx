import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius } from '../../shared/theme';

type DaiNutLienProps = {
  luaChon: { giaTri: string; nhan: string }[];
  giaTriDangChon: string;
  isDisabled: boolean;
  onChon: (giaTri: string) => void;
};

// Dải nút liền nhau trên nền xám, nút đang chọn nền xanh chữ trắng; dùng cho 4 bữa
export function DaiNutLien({ luaChon, giaTriDangChon, isDisabled, onChon }: DaiNutLienProps) {
  return (
    <View style={[styles.dai, isDisabled ? styles.khoa : null]}>
      {luaChon.map((motLuaChon) => (
        <Pressable
          key={motLuaChon.giaTri}
          style={({ pressed }) => [
            styles.nut,
            motLuaChon.giaTri === giaTriDangChon ? styles.nutDangChon : null,
            pressed ? styles.dangBam : null,
          ]}
          disabled={isDisabled}
          onPress={() => onChon(motLuaChon.giaTri)}
        >
          <Text style={[styles.chu, motLuaChon.giaTri === giaTriDangChon ? styles.chuDangChon : null]}>
            {motLuaChon.nhan}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dai: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.input,
    backgroundColor: colors.border,
  },
  khoa: {
    opacity: 0.5,
  },
  nut: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.input - 4,
  },
  nutDangChon: {
    backgroundColor: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  chuDangChon: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});
