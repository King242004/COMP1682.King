import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../../shared/theme';

type TheCachProps = {
  bieuTuong: ComponentProps<typeof Ionicons>['name'];
  ten: string;
  moTa: string;
  biKhoa: boolean;
  onPress: () => void;
};

// Một thẻ trắng: ô biểu tượng nền xanh nhạt, tên cách thêm, dòng mô tả ngắn
function TheCach({ bieuTuong, ten, moTa, biKhoa, onPress }: TheCachProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.the, biKhoa ? styles.khoa : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <View style={styles.oBieuTuong}>
        <Ionicons name={bieuTuong} size={20} color={colors.primary} />
      </View>
      <Text style={styles.ten}>{ten}</Text>
      <Text style={styles.moTa}>{moTa}</Text>
    </Pressable>
  );
}

type BaCachThemProps = {
  biKhoa: boolean;
  onChupAnh: () => void;
  onQuetMa: () => void;
  onNhapTay: () => void;
};

// Ba thẻ cùng hàng ở đầu bước 1: chụp ảnh để AI nhận món, quét mã vạch hàng đóng gói, tự gõ số liệu
export function BaCachThem({ biKhoa, onChupAnh, onQuetMa, onNhapTay }: BaCachThemProps) {
  return (
    <View style={styles.hang}>
      <TheCach bieuTuong="camera-outline" ten="Chụp ảnh" moTa="AI nhận món" biKhoa={biKhoa} onPress={onChupAnh} />
      <TheCach bieuTuong="barcode-outline" ten="Quét mã vạch" moTa="Hàng đóng gói" biKhoa={biKhoa} onPress={onQuetMa} />
      <TheCach bieuTuong="create-outline" ten="Gõ tên món" moTa="AI ước tính hoặc tự gõ" biKhoa={biKhoa} onPress={onNhapTay} />
    </View>
  );
}

const styles = StyleSheet.create({
  hang: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  the: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.medium,
    ...shadows.card,
  },
  khoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  oBieuTuong: {
    width: 36,
    height: 36,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.small,
  },
  ten: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  moTa: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
