import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { VaiTro } from './TuVanApi';

type BongTinNhanProps = {
  vaiTro: VaiTro;
  noiDung: string;
};

// Một bong bóng tin nhắn: của người dùng thì xanh, nằm bên phải; của coach thì nền trắng, nằm bên trái, có vòng biểu tượng coach
export function BongTinNhan({ vaiTro, noiDung }: BongTinNhanProps) {
  const laNguoiDung = vaiTro === 'nguoi_dung';
  return (
    <View style={[styles.hang, laNguoiDung ? styles.hangPhai : styles.hangTrai]}>
      {laNguoiDung ? null : (
        <View style={styles.vongCoach}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} />
        </View>
      )}
      <View style={[styles.bong, laNguoiDung ? styles.bongNguoiDung : styles.bongCoach]}>
        <Text style={[styles.chu, laNguoiDung ? styles.chuNguoiDung : null]}>{noiDung}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hang: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  hangPhai: {
    justifyContent: 'flex-end',
  },
  hangTrai: {
    justifyContent: 'flex-start',
  },
  vongCoach: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bong: {
    maxWidth: '80%',
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
  },
  bongNguoiDung: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    borderBottomRightRadius: 4,
  },
  bongCoach: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderBottomLeftRadius: 4,
  },
  chu: {
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.text,
  },
  chuNguoiDung: {
    color: colors.textOnPrimary,
  },
});
