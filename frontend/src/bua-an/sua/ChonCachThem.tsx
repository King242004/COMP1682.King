import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '../../shared/components/Chip';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';
import type { MonHayAn } from '../BuaAnApi';

type OCachThemProps = {
  bieuTuong: ComponentProps<typeof Ionicons>['name'];
  ten: string;
  onPress: () => void;
};

// Một ô lớn để chọn cách thêm món
function OCachThem({ bieuTuong, ten, onPress }: OCachThemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.oCachThem, pressed ? styles.dangBam : null]} onPress={onPress}>
      <Ionicons name={bieuTuong} size={26} color={colors.textOnPrimaryLight} />
      <Text style={styles.chuCachThem}>{ten}</Text>
    </Pressable>
  );
}

type ChonCachThemProps = {
  monHayAn: MonHayAn[];
  onChupAnh: () => void;
  onQuetMaVach: () => void;
  onGoTen: () => void;
  onChonMonHayAn: (mon: MonHayAn) => void;
};

// Bước 1 của màn thêm món: ba ô lớn (chụp ảnh, mã vạch, gõ tên), mẹo chụp, danh sách món hay ăn
export function ChonCachThem({ monHayAn, onChupAnh, onQuetMaVach, onGoTen, onChonMonHayAn }: ChonCachThemProps) {
  return (
    <View>
      <View style={styles.hangCachThem}>
        <OCachThem bieuTuong="camera-outline" ten="Chụp ảnh" onPress={onChupAnh} />
        <OCachThem bieuTuong="barcode-outline" ten="Mã vạch" onPress={onQuetMaVach} />
        <OCachThem bieuTuong="create-outline" ten="Gõ tên" onPress={onGoTen} />
      </View>
      <Text style={styles.chuPhu}>Mẹo: chụp phần bạn ăn, từ trên xuống, đặt đũa hoặc thìa bên cạnh.</Text>

      {/* Món hay ăn: bấm là điền sẵn; người mới chưa có món nào thì không hiện */}
      {monHayAn.length > 0 ? (
        <View style={styles.khoiMonHayAn}>
          <Text style={styles.nhanNhom}>Món bạn hay ăn</Text>
          <View style={styles.hangChip}>
            {monHayAn.map((mon) => (
              <Chip
                key={mon.ten_mon}
                label={`${mon.ten_mon} · ${mon.so_calo.toLocaleString('vi-VN')}`}
                isSelected={false}
                onPress={() => onChonMonHayAn(mon)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hangCachThem: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oCachThem: {
    flex: 1,
    height: 92,
    borderRadius: radius.card,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
  },
  chuCachThem: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  khoiMonHayAn: {
    marginTop: spacing.xlarge,
  },
  nhanNhom: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
