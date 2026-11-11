import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../shared/components/Button';
import { TextField } from '../../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

// Giới hạn chặn gõ nhầm, giống backend (UongNuocService.ts)
const ML_MOI_LAN_NHO_NHAT = 50;
const ML_MOI_LAN_LON_NHAT = 1000;
const MUC_TIEU_NHO_NHAT = 500;
const MUC_TIEU_LON_NHAT = 5000;

type SuaLuongNuocProps = {
  mlMoiLanDau: number;
  mucTieuDau: number;
  mucTieuGoiY: number;
  // Mục tiêu đang là số người dùng tự đặt (false là đang dùng gợi ý)
  laMucTieuTuDat: boolean;
  // Lưu cả hai; mục tiêu null là dùng số gợi ý
  onLuu: (mlMoiLan: number, mucTieu: number | null) => void;
  onDong: () => void;
};

// Tấm nổi từ dưới lên "Lượng nước": ô Mỗi lần ghi, ô Mục tiêu, nút "Dùng gợi ý" khi mục tiêu đang tự đặt; "Hủy" / "Lưu"
export function SuaLuongNuoc({ mlMoiLanDau, mucTieuDau, mucTieuGoiY, laMucTieuTuDat, onLuu, onDong }: SuaLuongNuocProps) {
  const [chuMoiLan, setChuMoiLan] = useState(String(mlMoiLanDau));
  const [chuMucTieu, setChuMucTieu] = useState(String(mucTieuDau));
  const [dungGoiY, setDungGoiY] = useState(!laMucTieuTuDat);
  const [loiMoiLan, setLoiMoiLan] = useState('');
  const [loiMucTieu, setLoiMucTieu] = useState('');

  // Gõ vào ô mục tiêu là chuyển sang số tự đặt
  function doiMucTieu(chu: string) {
    setChuMucTieu(chu);
    setDungGoiY(false);
  }

  // Bấm "Dùng gợi ý": điền số gợi ý vào ô, lưu thì mục tiêu đi theo gợi ý
  function chonGoiY() {
    setChuMucTieu(String(mucTieuGoiY));
    setDungGoiY(true);
    setLoiMucTieu('');
  }

  // Bấm "Lưu": hai số phải là số nguyên trong giới hạn
  function luu() {
    const mlMoiLan = Number(chuMoiLan);
    const mucTieu = Number(chuMucTieu);
    const moiLanSai = !Number.isInteger(mlMoiLan) || mlMoiLan < ML_MOI_LAN_NHO_NHAT || mlMoiLan > ML_MOI_LAN_LON_NHAT;
    const mucTieuSai = !dungGoiY && (!Number.isInteger(mucTieu) || mucTieu < MUC_TIEU_NHO_NHAT || mucTieu > MUC_TIEU_LON_NHAT);
    setLoiMoiLan(moiLanSai ? `Từ ${ML_MOI_LAN_NHO_NHAT.toLocaleString('vi-VN')} đến ${ML_MOI_LAN_LON_NHAT.toLocaleString('vi-VN')} ml` : '');
    setLoiMucTieu(mucTieuSai ? `Từ ${MUC_TIEU_NHO_NHAT.toLocaleString('vi-VN')} đến ${MUC_TIEU_LON_NHAT.toLocaleString('vi-VN')} ml` : '');
    if (moiLanSai || mucTieuSai) {
      return;
    }
    onLuu(mlMoiLan, dungGoiY ? null : mucTieu);
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
            <Text style={styles.tieuDe}>Lượng nước</Text>
            <Pressable style={({ pressed }) => [styles.nutChu, styles.nutLuu, pressed ? styles.dangBam : null]} onPress={luu}>
              <Text style={styles.chuLuu}>Lưu</Text>
            </Pressable>
          </View>

          <TextField label="Mỗi lần ghi (ml)" value={chuMoiLan} onChangeText={setChuMoiLan} error={loiMoiLan} isNumber />
          <TextField label="Mục tiêu mỗi ngày (ml)" value={chuMucTieu} onChangeText={doiMucTieu} error={loiMucTieu} isNumber />

          {/* Nút quay về số gợi ý theo cân nặng, chỉ có khi mục tiêu đang tự đặt */}
          {!dungGoiY ? (
            <Button
              title={`Dùng gợi ý (${mucTieuGoiY.toLocaleString('vi-VN')} ml)`}
              loadingTitle=""
              isLoading={false}
              onPress={chonGoiY}
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
