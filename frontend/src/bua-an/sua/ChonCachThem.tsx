import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '../../shared/components/Chip';
import { colors } from '../../shared/theme';
import type { MonHayAn } from '../BuaAnApi';

type OCachThemProps = {
  bieuTuong: ComponentProps<typeof Ionicons>['name'];
  ten: string;
  onPress: () => void;
};

// Một ô lớn để chọn cách thêm món
function OCachThem({ bieuTuong, ten, onPress }: OCachThemProps) {
  return (
    <Pressable style={styles.oCachThem} onPress={onPress}>
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
    gap: 10,
  },
  oCachThem: {
    flex: 1,
    height: 92,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chuCachThem: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  khoiMonHayAn: {
    marginTop: 20,
  },
  nhanNhom: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
