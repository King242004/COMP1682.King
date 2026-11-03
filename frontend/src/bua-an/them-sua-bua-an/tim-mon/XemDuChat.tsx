import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, spacing } from '../../../shared/theme';
import type { ThucPham } from '../../../tra-mon/TraMonApi';

type XemDuChatProps = {
  thucPham: ThucPham;
};

// Nút "Xem đủ chất" bấm để mở / đóng bảng các chất trong 100 g của thực phẩm; chất Viện chưa có số ghi "–"
export function XemDuChat({ thucPham }: XemDuChatProps) {
  const [dangMo, setDangMo] = useState(false);

  // Các dòng của bảng, theo thứ tự: nước, xơ, 3 chất nên hạn chế, khoáng chất, vitamin
  const cacDong = [
    { ten: 'Nước', giaTri: thucPham.nuoc_100g, donVi: 'g' },
    { ten: 'Chất xơ', giaTri: thucPham.chat_xo_100g, donVi: 'g' },
    { ten: 'Đường', giaTri: thucPham.duong_100g, donVi: 'g' },
    { ten: 'Béo no', giaTri: thucPham.beo_no_100g, donVi: 'g' },
    { ten: 'Muối', giaTri: thucPham.muoi_100g, donVi: 'g' },
    { ten: 'Canxi', giaTri: thucPham.canxi_mg_100g, donVi: 'mg' },
    { ten: 'Kali', giaTri: thucPham.kali_mg_100g, donVi: 'mg' },
    { ten: 'Magie', giaTri: thucPham.magie_mg_100g, donVi: 'mg' },
    { ten: 'Sắt', giaTri: thucPham.sat_mg_100g, donVi: 'mg' },
    { ten: 'Vitamin A', giaTri: thucPham.vitamin_a_mcg_100g, donVi: 'µg' },
    { ten: 'Vitamin C', giaTri: thucPham.vitamin_c_mg_100g, donVi: 'mg' },
    { ten: 'Vitamin D', giaTri: thucPham.vitamin_d_mcg_100g, donVi: 'µg' },
    { ten: 'Vitamin E', giaTri: thucPham.vitamin_e_mg_100g, donVi: 'mg' },
  ];

  return (
    <View style={styles.khoi}>
      <Pressable style={({ pressed }) => [styles.nut, pressed ? styles.dangBam : null]} onPress={() => setDangMo(!dangMo)}>
        <Text style={styles.chuNut}>Xem đủ chất</Text>
        <Ionicons name={dangMo ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
      </Pressable>

      {/* Bảng các chất trong 100 g, chỉ hiện khi đang mở */}
      {dangMo ? (
        <View>
          <Text style={styles.chuPhu}>Trong 100 g · Dấu "–" là Viện chưa có số</Text>
          {cacDong.map((dong) => (
            <View key={dong.ten} style={styles.dong}>
              <Text style={styles.tenChat}>{dong.ten}</Text>
              <Text style={styles.soChat}>
                {dong.giaTri === null ? '–' : `${dong.giaTri.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${dong.donVi}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khoi: {
    marginBottom: spacing.medium,
  },
  nut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuNut: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
  chuPhu: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tenChat: {
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  soChat: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
});
