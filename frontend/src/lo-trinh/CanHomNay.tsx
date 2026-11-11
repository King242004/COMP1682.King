import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ghiCanNang } from '../can-nang/CanNangApi';
import { docCanNang, doiKgRaDonVi, vietGioiHan } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { TextField } from '../shared/components/TextField';
import { todayKey } from '../shared/dateKey';
import { colors, fontSizes, spacing } from '../shared/theme';

// Giới hạn cân nặng (giống backend)
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

type CanHomNayProps = {
  // Cân gần đây (kg) để gợi ý trong ô trống
  canGanNhatKg: number;
  // Ghi xong thì màn tải lại lộ trình
  onDaGhi: () => void;
};

// Thẻ "Cân hôm nay": ô nhập và nút "Ghi"; ghi lại trong ngày thì đè
export function CanHomNay({ canGanNhatKg, onDaGhi }: CanHomNayProps) {
  const { donVi, heSo } = useDonVi();
  const tenDonViCan = donVi === 'anh_my' && heSo !== null ? 'lb' : 'kg';
  const [canNang, setCanNang] = useState('');
  const [loiCanNang, setLoiCanNang] = useState('');
  const [dangGhi, setDangGhi] = useState(false);

  // Kiểm số cân rồi ghi cho hôm nay; lỗi từ server hiện ngay dưới ô
  async function ghiCanHomNay() {
    const canNangSo = docCanNang(canNang, donVi, heSo) ?? 0;
    if (!(canNangSo >= CAN_NANG_NHO_NHAT && canNangSo <= CAN_NANG_LON_NHAT)) {
      setLoiCanNang(`Cân nặng ${vietGioiHan(CAN_NANG_NHO_NHAT, CAN_NANG_LON_NHAT, 'can_nang', donVi, heSo)}`);
      return;
    }
    setLoiCanNang('');
    setDangGhi(true);
    try {
      await ghiCanNang(todayKey(), canNangSo);
      setCanNang('');
      onDaGhi();
    } catch (loiGhi) {
      setLoiCanNang((loiGhi as Error).message);
    }
    setDangGhi(false);
  }

  return (
    <Card>
      {/* Nhãn nằm trên cả hàng để ô nhập và nút Ghi thẳng hàng */}
      <Text style={styles.nhanCan}>Cân hôm nay ({tenDonViCan})</Text>
      <View style={styles.hangGhiCan}>
        <View style={styles.oCan}>
          <TextField
            label=""
            value={canNang}
            onChangeText={setCanNang}
            error={loiCanNang}
            placeholder={String(doiKgRaDonVi(canGanNhatKg, donVi, heSo)).replace('.', ',')}
            isNumber
            isDisabled={dangGhi}
          />
        </View>
        <View style={styles.nutGhi}>
          <Button title="Ghi" loadingTitle="…" isLoading={dangGhi} onPress={ghiCanHomNay} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  nhanCan: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  hangGhiCan: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
  },
  oCan: {
    flex: 1,
  },
  nutGhi: {
    width: 88,
  },
});
