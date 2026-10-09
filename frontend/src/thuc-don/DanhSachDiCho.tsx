import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { MonThucDon } from './ThucDonApi';

// Danh sách đi chợ: nguyên liệu của từng món tự nấu, ghi theo món (không cộng dồn vì lượng ghi bằng chữ)
export function DanhSachDiCho({ danhSachMon }: { danhSachMon: MonThucDon[] }) {
  // Chỉ món tự nấu có nguyên liệu mới cần đi chợ
  const monCanMua = danhSachMon.filter((mon) => mon.nguyen_lieu.length > 0);
  if (monCanMua.length === 0) {
    return null;
  }

  return (
    <View style={styles.khoi}>
      <Text style={styles.tieuDe}>Đi chợ (món tự nấu)</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  khoi: {
    marginTop: 8,
  },
  tieuDe: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  mon: {
    marginBottom: 10,
  },
  tenMon: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  nguyenLieu: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
