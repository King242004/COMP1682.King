import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DanhSachMon } from '../../src/kham-pha/DanhSachMon';
import { ThucDonHomNay } from '../../src/kham-pha/ThucDonHomNay';
import { Chip } from '../../src/shared/components/Chip';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { spacing } from '../../src/shared/theme';

// Hai phần của tab Khám phá
type PhanKhamPha = 'mon_an' | 'thuc_don';

export default function ManKhamPha() {
  const [phanDangXem, setPhanDangXem] = useState<PhanKhamPha>('mon_an');

  return (
    <Screen>
      <ScreenTitle title="Khám phá" />

      {/* Hai nút chọn phần: món Viện Dinh dưỡng đã cân, hoặc thực đơn AI gợi ý hôm nay */}
      <View style={styles.hangChonPhan}>
        <Chip label="Món ăn" isSelected={phanDangXem === 'mon_an'} onPress={() => setPhanDangXem('mon_an')} />
        <Chip label="Thực đơn hôm nay" isSelected={phanDangXem === 'thuc_don'} onPress={() => setPhanDangXem('thuc_don')} />
      </View>

      {phanDangXem === 'mon_an' ? <DanhSachMon /> : <ThucDonHomNay />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hangChonPhan: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.large,
  },
});
