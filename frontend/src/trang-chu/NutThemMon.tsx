import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { LoaiBua } from '../bua-an/BuaAnApi';
import { colors, pressedOpacity, radius, shadows, spacing } from '../shared/theme';

// Ba cách thêm món; gửi sang màn thêm món để mở thẳng đúng cách đó
export type CachThem = 'chup-anh' | 'ma-vach' | 'go-ten';

type NutCachThemProps = {
  bieuTuong: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
};

// Một nút tròn nền xanh, chỉ có biểu tượng, bung lên phía trên nút +
function NutCachThem({ bieuTuong, onPress }: NutCachThemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.nutTron, pressed ? styles.dangBam : null]} onPress={onPress}>
      <Ionicons name={bieuTuong} size={22} color={colors.textOnPrimary} />
    </Pressable>
  );
}

type NutThemMonProps = {
  buaDangThem: LoaiBua | null;
  onMo: () => void;
  onDong: () => void;
  onChonCach: (loaiBua: LoaiBua, cach: CachThem) => void;
};

// Nút + nổi ở góc; bấm thì 3 cách thêm món bung lên; buaDangThem là null nghĩa là đang đóng
export function NutThemMon({ buaDangThem, onMo, onDong, onChonCach }: NutThemMonProps) {
  return (
    <>
      {/* Đang mở: lớp trong suốt phủ cả màn (chạm ra ngoài để đóng) và 3 nút; Chụp ảnh nằm sát nút + vì dùng nhiều nhất */}
      {buaDangThem !== null ? (
        <Pressable style={styles.vungChamDeDong} onPress={onDong}>
          <View style={styles.cotNut}>
            <NutCachThem bieuTuong="create-outline" onPress={() => onChonCach(buaDangThem, 'go-ten')} />
            <NutCachThem bieuTuong="barcode-outline" onPress={() => onChonCach(buaDangThem, 'ma-vach')} />
            <NutCachThem bieuTuong="camera-outline" onPress={() => onChonCach(buaDangThem, 'chup-anh')} />
          </View>
        </Pressable>
      ) : null}

      {/* Nút + nổi; đang mở thì thành × để đóng */}
      {buaDangThem !== null ? (
        <Pressable style={({ pressed }) => [styles.nutNoi, pressed ? styles.dangBam : null]} onPress={onDong}>
          <Ionicons name="close" size={30} color={colors.textOnPrimary} />
        </Pressable>
      ) : (
        <Pressable style={({ pressed }) => [styles.nutNoi, pressed ? styles.dangBam : null]} onPress={onMo}>
          <Ionicons name="add" size={30} color={colors.textOnPrimary} />
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  vungChamDeDong: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cotNut: {
    position: 'absolute',
    right: spacing.large + 6,
    bottom: spacing.large + 60 + spacing.medium,
    alignItems: 'flex-end',
    gap: spacing.medium,
  },
  nutTron: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  nutNoi: {
    position: 'absolute',
    right: spacing.large,
    bottom: spacing.large,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
