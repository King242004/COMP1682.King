import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DanhSachMon } from '../../src/kham-pha/DanhSachMon';
import { ThucDonHomNay } from '../../src/kham-pha/ThucDonHomNay';
import { colors, fontSizes, pressedOpacity, spacing } from '../../src/shared/theme';

// Hai phần của tab Khám phá
type PhanKhamPha = 'mon_an' | 'thuc_don';

export default function KhamPha() {
  const [phanDangXem, setPhanDangXem] = useState<PhanKhamPha>('mon_an');

  // Hai tab chữ trên cùng thay cho tiêu đề màn: món Viện Dinh dưỡng đã cân, hoặc thực đơn AI gợi ý hôm nay
  const haiTab = (
    <View style={styles.hangTab}>
      <Pressable
        style={({ pressed }) => [styles.tab, phanDangXem === 'mon_an' ? styles.tabDangChon : null, pressed ? styles.dangBam : null]}
        onPress={() => setPhanDangXem('mon_an')}
      >
        <Text style={[styles.chuTab, phanDangXem === 'mon_an' ? styles.chuTabDangChon : null]}>Món ăn</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.tab, phanDangXem === 'thuc_don' ? styles.tabDangChon : null, pressed ? styles.dangBam : null]}
        onPress={() => setPhanDangXem('thuc_don')}
      >
        <Text style={[styles.chuTab, phanDangXem === 'thuc_don' ? styles.chuTabDangChon : null]}>Thực đơn hôm nay</Text>
      </Pressable>
    </View>
  );

  // Mỗi phần tự đặt 2 tab vào phần đầu đứng yên của màn
  if (phanDangXem === 'mon_an') {
    return <DanhSachMon dauMan={haiTab} />;
  }
  return <ThucDonHomNay dauMan={haiTab} />;
}

const styles = StyleSheet.create({
  hangTab: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.large,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabDangChon: {
    borderBottomColor: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuTab: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chuTabDangChon: {
    color: colors.primary,
  },
});
