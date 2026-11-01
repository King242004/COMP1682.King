import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { MonDaChon } from '../../quet-mon/MonDaChon';
import { uocTinhTheoMoTa } from '../../quet-mon/QuetMonApi';
import { Card } from '../../shared/components/Card';
import { ErrorBox } from '../../shared/components/ErrorBox';
import { colors, fontSizes, radius, spacing } from '../../shared/theme';
import { NutAi } from './NutAi';

// Câu mô tả dài nhất, giống backend (QuetMonService.ts)
const MO_TA_DAI_NHAT = 200;

type MoTaProps = {
  // Màn đang chạy việc khác (AI, lưu, xóa) thì khóa ô và nút
  isDisabled: boolean;
  // AI nhận ra món thì trả món về màn để sang bước xem lại
  onChon: (mon: MonDaChon) => void;
  // Báo màn biết AI đang chạy, để màn khóa các chỗ bấm khác
  onDangChay: (dangChay: boolean) => void;
};

// Thẻ "Bạn đã ăn gì?": viết một câu bữa vừa ăn rồi nhờ AI ước tính thành một món
export function MoTa({ isDisabled, onChon, onDangChay }: MoTaProps) {
  const [moTa, setMoTa] = useState('');
  const [dangUocTinh, setDangUocTinh] = useState(false);
  const [loiNhap, setLoiNhap] = useState('');
  const [loiServer, setLoiServer] = useState('');

  // Gửi câu mô tả cho AI; AI nhận ra món thì trả món về màn, không thì báo dưới ô
  async function uocTinhBangAi() {
    if (moTa.trim() === '') {
      setLoiNhap('Hãy ghi bạn đã ăn gì');
      return;
    }
    setLoiNhap('');
    setLoiServer('');
    setDangUocTinh(true);
    onDangChay(true);
    try {
      const ketQua = await uocTinhTheoMoTa(moTa.trim());
      if (ketQua.la_mon_an && ketQua.kha_nang.length > 0) {
        onChon({ ...ketQua.kha_nang[0], nguon_so_lieu: 'ai' });
      } else {
        setLoiNhap('Không nhận ra món ăn trong câu này. Hãy ghi rõ hơn hoặc nhập số.');
      }
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
    setDangUocTinh(false);
    onDangChay(false);
  }

  return (
    <Card>
      {loiServer ? <ErrorBox message={loiServer} /> : null}
      <Text style={styles.tieuDeThe}>Bạn đã ăn gì?</Text>

      {/* Ô một dòng để viết bữa vừa ăn, nút AI cùng hàng bên phải */}
      <View style={styles.hang}>
        <TextInput
          style={[styles.oGo, loiNhap ? styles.oLoi : null, isDisabled ? styles.oKhoa : null]}
          value={moTa}
          onChangeText={setMoTa}
          placeholder="Ví dụ: 1 tô phở bò lớn"
          placeholderTextColor={colors.textSecondary}
          maxLength={MO_TA_DAI_NHAT}
          editable={!isDisabled}
        />
        <NutAi isLoading={dangUocTinh} isDisabled={isDisabled} onPress={uocTinhBangAi} />
      </View>
      {loiNhap ? <Text style={styles.chuLoi}>{loiNhap}</Text> : null}
      <Text style={styles.chuNhac}>Ghi cả lượng ăn (tô, chén, gram…) để AI đoán sát hơn</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDeThe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  hang: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oGo: {
    flex: 1,
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  oLoi: {
    borderColor: colors.error,
  },
  oKhoa: {
    opacity: 0.5,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
  chuNhac: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
});
