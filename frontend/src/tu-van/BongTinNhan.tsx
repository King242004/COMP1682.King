import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { VaiTro } from './TuVanApi';

type BongTinNhanProps = {
  vaiTro: VaiTro;
  noiDung: string;
};

// Một bong bóng tin nhắn: của người dùng thì xanh, nằm bên phải; của coach thì nền xám, nằm bên trái
export function BongTinNhan({ vaiTro, noiDung }: BongTinNhanProps) {
  const laNguoiDung = vaiTro === 'nguoi_dung';
  return (
    <View style={[styles.hang, laNguoiDung ? styles.hangPhai : styles.hangTrai]}>
      <View style={[styles.bong, laNguoiDung ? styles.bongNguoiDung : styles.bongCoach]}>
        <Text style={[styles.chu, laNguoiDung ? styles.chuNguoiDung : null]}>{noiDung}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hang: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  hangPhai: {
    justifyContent: 'flex-end',
  },
  hangTrai: {
    justifyContent: 'flex-start',
  },
  bong: {
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bongNguoiDung: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bongCoach: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  chu: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  chuNguoiDung: {
    color: colors.textOnPrimary,
  },
});
