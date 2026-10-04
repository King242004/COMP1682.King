import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../shared/theme';

// Chỉ cho chọn năm sinh của người từ 18 tuổi (giống luật ở backend)
const TUOI_TOI_THIEU = 18;
// Độ dài danh sách năm cho chọn; là lựa chọn giao diện, không phải luật
const SO_NAM_TRONG_DANH_SACH = 83;

type ChonNamSinhProps = {
  namSinh: number | null;
  onChon: (namSinh: number) => void;
  loi: string;
};

// Ô bấm vào thì mở danh sách năm sinh để chọn
export function ChonNamSinh({ namSinh, onChon, loi }: ChonNamSinhProps) {
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
      <Pressable style={[styles.o, loi ? styles.oLoi : null]} onPress={() => setDangMo(true)}>
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
                  style={styles.dongNam}
                  onPress={() => {
                    onChon(nam);
                    setDangMo(false);
                  }}
                >
                  <Text style={[styles.chuNam, nam === namSinh ? styles.chuNamDangChon : null]}>{nam}</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.nutDong} onPress={() => setDangMo(false)}>
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
    marginBottom: 12,
  },
  nhan: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  o: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  oLoi: {
    borderColor: colors.error,
  },
  giaTri: {
    fontSize: 16,
    color: colors.text,
  },
  goiY: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  chuLoi: {
    fontSize: 13,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  dongNam: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chuNam: {
    fontSize: 17,
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
    fontSize: 16,
    color: colors.primary,
  },
});
