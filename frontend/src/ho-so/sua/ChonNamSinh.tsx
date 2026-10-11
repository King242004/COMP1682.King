import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

// Chỉ cho chọn năm sinh của người từ 18 tuổi (giống luật ở backend)
const TUOI_TOI_THIEU = 18;
// Độ dài danh sách năm cho chọn; là lựa chọn giao diện, không phải luật
const SO_NAM_TRONG_DANH_SACH = 83;

type ChonNamSinhProps = {
  namSinh: number | null;
  onChon: (namSinh: number) => void;
  loi: string;
  // Khóa ô khi màn đang lưu
  isDisabled?: boolean;
};

// Ô bấm vào thì mở danh sách năm sinh để chọn
export function ChonNamSinh({ namSinh, onChon, loi, isDisabled }: ChonNamSinhProps) {
  const [dangMo, setDangMo] = useState(false);

  // Danh sách năm, mới nhất (vừa đủ 18 tuổi) ở đầu
  const namLonNhat = new Date().getFullYear() - TUOI_TOI_THIEU;
  const danhSachNam: number[] = [];
  for (let thuTu = 0; thuTu < SO_NAM_TRONG_DANH_SACH; thuTu++) {
    danhSachNam.push(namLonNhat - thuTu);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.nhan}>Năm sinh</Text>
      <Pressable
        style={({ pressed }) => [styles.o, loi ? styles.oLoi : null, isDisabled ? styles.oKhoa : null, pressed ? styles.dangBam : null]}
        disabled={isDisabled}
        onPress={() => setDangMo(true)}
      >
        <Text style={namSinh ? styles.giaTri : styles.goiY}>{namSinh ? String(namSinh) : 'Chọn năm sinh'}</Text>
      </Pressable>
      {loi ? <Text style={styles.chuLoi}>{loi}</Text> : null}

      <Modal visible={dangMo} animationType="slide" transparent onRequestClose={() => setDangMo(false)}>
        <View style={styles.nenMo}>
          <View style={styles.bangChon}>
            <FlatList
              data={danhSachNam}
              keyExtractor={(nam) => String(nam)}
              renderItem={({ item: nam }) => (
                <Pressable
                  style={({ pressed }) => [styles.dongNam, pressed ? styles.dangBam : null]}
                  onPress={() => {
                    onChon(nam);
                    setDangMo(false);
                  }}
                >
                  <Text style={[styles.chuNam, nam === namSinh ? styles.chuNamDangChon : null]}>{nam}</Text>
                </Pressable>
              )}
            />
            <Pressable style={({ pressed }) => [styles.nutDong, pressed ? styles.dangBam : null]} onPress={() => setDangMo(false)}>
              <Text style={styles.chuNutDong}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.medium,
  },
  nhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  o: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.medium,
    justifyContent: 'center',
  },
  oKhoa: {
    opacity: 0.5,
  },
  oLoi: {
    borderColor: colors.error,
  },
  giaTri: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  goiY: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
  nenMo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  bangChon: {
    maxHeight: '60%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: spacing.small,
  },
  dongNam: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chuNam: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuNamDangChon: {
    color: colors.primary,
    fontWeight: '600',
  },
  nutDong: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chuNutDong: {
    fontSize: fontSizes.body,
    color: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
