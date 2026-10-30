import { StyleSheet, Text } from 'react-native';

import { colors, fontSizes, radius } from '../shared/theme';

type NhanDiUngProps = {
  // Tên các nhóm dị ứng bị trùng do server dò; rỗng thì không vẽ gì
  danhSachNhom: string[];
  // Thứ bị bắt, ghi sau dấu hai chấm (thẻ thực đơn dùng), ví dụ "Nước mắm 10 ml"
  chiTiet?: string;
};

// Nhãn nhỏ "⚠ Tôm, cua · Sữa" trên món có thứ người dùng dị ứng
export function NhanDiUng({ danhSachNhom, chiTiet }: NhanDiUngProps) {
  if (danhSachNhom.length === 0) {
    return null;
  }

  let chu = `⚠ ${danhSachNhom.join(' · ')}`;
  if (chiTiet) {
    chu = `${chu}: ${chiTiet}`;
  }
  return <Text style={styles.nhan}>{chu}</Text>;
}

const styles = StyleSheet.create({
  nhan: {
    alignSelf: 'flex-start',
    fontSize: fontSizes.label,
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    borderRadius: radius.input,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
});
