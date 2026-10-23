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

// Tấm đi chợ trượt từ dưới lên: nguyên liệu của từng món, ghi theo món (không cộng dồn vì lượng ghi bằng chữ); bấm một dòng để tick
export function DanhSachDiCho({ danhSachMon, onDong }: DanhSachDiChoProps) {
  // Các dòng đã tick, khóa là "bữa|tên món|nguyên liệu"; chỉ nhớ lúc tấm đang mở, không lưu
  const [daTick, setDaTick] = useState<string[]>([]);

  // Chỉ món có nguyên liệu (cơm nhà) mới cần đi chợ; món Viện là món quán, không có nguyên liệu
  const monCanMua = danhSachMon.filter((mon) => mon.nguyen_lieu.length > 0);

  // Bấm một dòng: chưa tick thì tick, đã tick thì bỏ
  function doiTick(khoa: string) {
    if (daTick.includes(khoa)) {
      setDaTick(daTick.filter((khoaCu) => khoaCu !== khoa));
    } else {
      setDaTick([...daTick, khoa]);
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDong}>
      <View style={styles.nenToi}>
        <View style={styles.tam}>
          {/* Tiêu đề và nút ✕ đóng */}
          <View style={styles.hangTieuDe}>
            <Text style={styles.tieuDe}>Danh sách đi chợ</Text>
            <Pressable style={({ pressed }) => (pressed ? styles.dangBam : null)} hitSlop={10} onPress={onDong}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Nguyên liệu nhóm theo món; dòng đã tick thì có dấu tick và gạch ngang */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {monCanMua.map((mon) => (
              <View key={mon.loai_bua + mon.ten_mon} style={styles.nhom}>
                <Text style={styles.tenMon}>
                  {TEN_BUA[mon.loai_bua]} · {mon.ten_mon}
                </Text>
                {mon.nguyen_lieu.map((nguyenLieu, thuTu) => {
                  const khoa = `${mon.loai_bua}|${mon.ten_mon}|${nguyenLieu}`;
                  const daMua = daTick.includes(khoa);
                  return (
                    <Pressable
                      key={thuTu}
                      style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                      onPress={() => doiTick(khoa)}
                    >
                      <Ionicons
                        name={daMua ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={daMua ? colors.protein : colors.textSecondary}
                      />
                      <Text style={[styles.nguyenLieu, daMua ? styles.nguyenLieuDaMua : null]}>{nguyenLieu}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
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
    marginBottom: spacing.medium,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  nhom: {
    marginBottom: spacing.medium,
  },
  tenMon: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
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
});
