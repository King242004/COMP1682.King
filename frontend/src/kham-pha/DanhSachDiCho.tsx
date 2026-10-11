import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../shared/components/Card';
import { SectionTitle } from '../shared/components/SectionTitle';
import { colors, fontSizes, spacing } from '../shared/theme';
import type { MonThucDon } from '../thuc-don/ThucDonApi';

// Danh sách đi chợ: nguyên liệu của từng món tự nấu, ghi theo món (không cộng dồn vì lượng ghi bằng chữ)
export function DanhSachDiCho({ danhSachMon }: { danhSachMon: MonThucDon[] }) {
  // Chỉ món tự nấu có nguyên liệu mới cần đi chợ
  const monCanMua = danhSachMon.filter((mon) => mon.nguyen_lieu.length > 0);
  if (monCanMua.length === 0) {
    return null;
  }

  return (
    <Card>
      <SectionTitle title="Đi chợ (món tự nấu)" />
      {monCanMua.map((mon) => (
        <View key={mon.loai_bua + mon.ten_mon} style={styles.mon}>
          <Text style={styles.tenMon}>{mon.ten_mon}</Text>
          {mon.nguyen_lieu.map((nguyenLieu, thuTu) => (
            <Text key={thuTu} style={styles.nguyenLieu}>
              • {nguyenLieu}
            </Text>
          ))}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  mon: {
    marginBottom: spacing.medium,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nguyenLieu: {
    fontSize: fontSizes.body,
    color: colors.text,
    lineHeight: 20,
  },
});
