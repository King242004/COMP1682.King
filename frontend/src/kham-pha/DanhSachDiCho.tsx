import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TEN_BUA } from '../bua-an/TenBua';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { MonThucDon } from '../thuc-don/ThucDonApi';

type DanhSachDiChoProps = {
  danhSachMon: MonThucDon[];
  onDong: () => void;
};

// Một dòng của danh sách tổng: nguyên liệu và số bữa có đúng dòng đó
type DongDiCho = {
  nguyenLieu: string;
  soLan: number;
};

// Tấm đi chợ hiện ra trên nền tối (không trượt): một danh sách tổng nguyên liệu của mọi mâm cơm nhà; dòng giống hệt nhau gộp làm một kèm "× 2" (không cộng lượng vì lượng ghi bằng chữ); bấm một dòng để tick
export function DanhSachDiCho({ danhSachMon, onDong }: DanhSachDiChoProps) {
  // Các dòng đã tick, khóa là chữ nguyên liệu; chỉ nhớ lúc tấm đang mở, không lưu
  const [daTick, setDaTick] = useState<string[]>([]);

  // Chỉ món có nguyên liệu (cơm nhà) mới cần đi chợ; món Viện là món quán, không có nguyên liệu
  const monCanMua = danhSachMon.filter((mon) => mon.nguyen_lieu.length > 0);

  // Gom nguyên liệu mọi mâm thành một danh sách; gặp dòng đã có thì tăng số lần
  const cacDong: DongDiCho[] = [];
  for (const mon of monCanMua) {
    for (const nguyenLieu of mon.nguyen_lieu) {
      const dongDaCo = cacDong.find((dong) => dong.nguyenLieu === nguyenLieu);
      if (dongDaCo !== undefined) {
        dongDaCo.soLan = dongDaCo.soLan + 1;
      } else {
        cacDong.push({ nguyenLieu: nguyenLieu, soLan: 1 });
      }
    }
  }

  // Dòng nhỏ dưới tiêu đề: cho những bữa nào và có bao nhiêu nguyên liệu
  const tenCacBua = monCanMua.map((mon) => TEN_BUA[mon.loai_bua].toLowerCase()).join(', ');

  // Bấm một dòng: chưa tick thì tick, đã tick thì bỏ
  function doiTick(nguyenLieu: string) {
    if (daTick.includes(nguyenLieu)) {
      setDaTick(daTick.filter((nguyenLieuCu) => nguyenLieuCu !== nguyenLieu));
    } else {
      setDaTick([...daTick, nguyenLieu]);
    }
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDong}>
      <View style={styles.nenToi}>
        <View style={styles.tam}>
          {/* Tiêu đề và nút ✕ đóng */}
          <View style={styles.hangTieuDe}>
            <Text style={styles.tieuDe}>Danh sách đi chợ</Text>
            <Pressable style={({ pressed }) => (pressed ? styles.dangBam : null)} hitSlop={10} onPress={onDong}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.chuPhu}>
            Cho {tenCacBua} · {cacDong.length} nguyên liệu
          </Text>

          {/* Một danh sách chung; dòng có ở nhiều bữa thì có nhãn "× 2"; dòng đã tick thì có dấu tick và gạch ngang */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {cacDong.map((dong) => {
              const daMua = daTick.includes(dong.nguyenLieu);
              return (
                <Pressable
                  key={dong.nguyenLieu}
                  style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                  onPress={() => doiTick(dong.nguyenLieu)}
                >
                  <Ionicons name={daMua ? 'checkbox' : 'square-outline'} size={20} color={daMua ? colors.protein : colors.textSecondary} />
                  <Text style={[styles.nguyenLieu, daMua ? styles.nguyenLieuDaMua : null]}>{dong.nguyenLieu}</Text>
                  {dong.soLan > 1 ? <Text style={styles.nhanSoLan}>× {dong.soLan}</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nenToi: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  tam: {
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.large,
    paddingBottom: spacing.xlarge * 2,
  },
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.medium,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingVertical: 6,
  },
  nguyenLieu: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  nguyenLieuDaMua: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  // Nhãn xanh nhạt nhỏ "× 2" cho dòng có ở nhiều bữa
  nhanSoLan: {
    fontSize: fontSizes.label,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
