import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../shared/components/Button';
import { TextField } from '../../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

type SuaSoMlProps = {
  tieuDe: string;
  giaTriDau: number;
  nhoNhat: number;
  lonNhat: number;
  // Có số gợi ý thì hiện nút "Dùng gợi ý" (dòng Mục tiêu); null thì không có nút (dòng Mỗi lần ghi)
  goiY: number | null;
  // Lưu số ml đã gõ; null là quay về dùng số gợi ý
  onLuu: (soMl: number | null) => void;
  onDong: () => void;
};

// Tấm nổi từ dưới lên để sửa một số ml: ô số, "Hủy" / "Lưu", có thể có nút "Dùng gợi ý"
export function SuaSoMl({ tieuDe, giaTriDau, nhoNhat, lonNhat, goiY, onLuu, onDong }: SuaSoMlProps) {
  const [chuSo, setChuSo] = useState(String(giaTriDau));
  const [loi, setLoi] = useState('');

  // Bấm "Lưu": số phải là số nguyên trong giới hạn
  function luu() {
    const soMl = Number(chuSo);
    if (!Number.isInteger(soMl) || soMl < nhoNhat || soMl > lonNhat) {
      setLoi(`Từ ${nhoNhat.toLocaleString('vi-VN')} đến ${lonNhat.toLocaleString('vi-VN')} ml`);
      return;
    }
    onLuu(soMl);
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDong}>
      <KeyboardAvoidingView style={styles.nenToi} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Vùng tối phía trên tấm: bấm vào thì đóng, không lưu */}
        <Pressable style={styles.vungToi} onPress={onDong} />
        <View style={styles.tam}>
          {/* Hàng đầu: Hủy, tiêu đề, Lưu */}
          <View style={styles.dauTam}>
            <Pressable style={({ pressed }) => [styles.nutChu, pressed ? styles.dangBam : null]} onPress={onDong}>
              <Text style={styles.chuHuy}>Hủy</Text>
            </Pressable>
            <Text style={styles.tieuDe}>{tieuDe}</Text>
            <Pressable style={({ pressed }) => [styles.nutChu, styles.nutLuu, pressed ? styles.dangBam : null]} onPress={luu}>
              <Text style={styles.chuLuu}>Lưu</Text>
            </Pressable>
          </View>

          <TextField label="Số ml" value={chuSo} onChangeText={setChuSo} error={loi} isNumber />

          {/* Nút quay về số gợi ý, chỉ có ở dòng Mục tiêu */}
          {goiY !== null ? (
            <Button
              title={`Dùng gợi ý (${goiY.toLocaleString('vi-VN')} ml)`}
              loadingTitle=""
              isLoading={false}
              onPress={() => onLuu(null)}
              isSecondary
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nenToi: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  vungToi: {
    flex: 1,
  },
  tam: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    paddingBottom: spacing.xlarge,
  },
  dauTam: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  tieuDe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nutChu: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  nutLuu: {
    alignItems: 'flex-end',
  },
  chuHuy: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuLuu: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
