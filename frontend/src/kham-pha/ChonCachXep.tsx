import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';

// Các cách xếp món ở Khám phá
export type CachXep = 'ten' | 'ten_nguoc' | 'it_calo' | 'giau_dam' | 'it_tinh_bot';

// Chữ hiện cho từng cách xếp, theo thứ tự trong menu
export const TEN_CACH_XEP: { giaTri: CachXep; nhan: string }[] = [
  { giaTri: 'ten', nhan: 'Tên A–Z' },
  { giaTri: 'ten_nguoc', nhan: 'Tên Z–A' },
  { giaTri: 'it_calo', nhan: 'Calo: thấp → cao' },
  { giaTri: 'giau_dam', nhan: 'Giàu đạm' },
  { giaTri: 'it_tinh_bot', nhan: 'Tinh bột: thấp → cao' },
];

type ChonCachXepProps = {
  cachDangChon: CachXep;
  // Khoảng cách từ đỉnh màn hình tới đáy nút xếp, để menu nằm ngay dưới nút
  dinhMenu: number;
  onChon: (cachXep: CachXep) => void;
  onDong: () => void;
};

// Menu "Xếp món theo" thả xuống ngay dưới nút xếp, sát mép phải; bấm ra ngoài menu là đóng
export function ChonCachXep({ cachDangChon, dinhMenu, onChon, onDong }: ChonCachXepProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDong}>
      <Pressable style={styles.nenTrong} onPress={onDong}>
        <View style={[styles.menu, { top: dinhMenu + spacing.small }]}>
          {TEN_CACH_XEP.map((cach, viTri) => (
            <Pressable
              key={cach.giaTri}
              style={({ pressed }) => [styles.dong, viTri > 0 ? styles.duongKe : null, pressed ? styles.dangBam : null]}
              onPress={() => onChon(cach.giaTri)}
            >
              <Text style={[styles.chuDong, cach.giaTri === cachDangChon ? styles.chuDangChon : null]}>{cach.nhan}</Text>
              {cach.giaTri === cachDangChon ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nenTrong: {
    flex: 1,
  },
  // Khung menu nằm sát mép phải, thẳng hàng với mép phải của nút xếp
  menu: {
    position: 'absolute',
    right: spacing.large,
    width: 230,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
  },
  duongKe: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuDong: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuDangChon: {
    color: colors.primary,
    fontWeight: '600',
  },
});
