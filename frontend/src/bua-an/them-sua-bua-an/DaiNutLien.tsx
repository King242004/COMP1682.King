import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius } from '../../shared/theme';

type DaiNutLienProps = {
  luaChon: { giaTri: string; nhan: string }[];
  giaTriDangChon: string;
  // "dam": ô chọn nền xanh chữ trắng (dải bữa); "nhat": ô chọn nền trắng chữ xanh (dải Khẩu phần / Gram)
  kieu: 'dam' | 'nhat';
  isDisabled: boolean;
  onChon: (giaTri: string) => void;
};

// Dải nút liền nhau trên nền xám, nút đang chọn nổi lên theo kiểu; dùng cho 4 bữa và cho "Khẩu phần / Gram"
export function DaiNutLien({ luaChon, giaTriDangChon, kieu, isDisabled, onChon }: DaiNutLienProps) {
  return (
    <View style={[styles.dai, isDisabled ? styles.khoa : null]}>
      {luaChon.map((motLuaChon) => (
        <Pressable
          key={motLuaChon.giaTri}
          style={({ pressed }) => [
            styles.nut,
            motLuaChon.giaTri === giaTriDangChon && kieu === 'dam' ? styles.nutChonDam : null,
            motLuaChon.giaTri === giaTriDangChon && kieu === 'nhat' ? styles.nutChonNhat : null,
            pressed ? styles.dangBam : null,
          ]}
          disabled={isDisabled}
          onPress={() => onChon(motLuaChon.giaTri)}
        >
          <Text
            style={[
              styles.chu,
              motLuaChon.giaTri === giaTriDangChon && kieu === 'dam' ? styles.chuChonDam : null,
              motLuaChon.giaTri === giaTriDangChon && kieu === 'nhat' ? styles.chuChonNhat : null,
            ]}
          >
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
  nutChonDam: {
    backgroundColor: colors.primary,
  },
  nutChonNhat: {
    backgroundColor: colors.surface,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  chuChonDam: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  chuChonNhat: {
    color: colors.primary,
    fontWeight: '600',
  },
});
