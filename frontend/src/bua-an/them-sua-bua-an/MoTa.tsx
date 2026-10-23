import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MonDaChon } from '../../quet-mon/MonDaChon';
import { uocTinhTheoMoTa } from '../../quet-mon/QuetMonApi';
import { Button } from '../../shared/components/Button';
import { ErrorBox } from '../../shared/components/ErrorBox';
import { TextField } from '../../shared/components/TextField';
import { colors, fontSizes, spacing } from '../../shared/theme';
import type { MonHayAn } from '../BuaAnApi';
import { MonBanHayAn } from './MonBanHayAn';

// Câu mô tả dài nhất, giống backend (QuetMonService.ts)
const MO_TA_DAI_NHAT = 200;

type MoTaProps = {
  monHayAn: MonHayAn[];
  // Có món (món hay ăn, hoặc kết quả AI) thì trả về màn để điền thẻ Nhập số
  onChon: (mon: MonHayAn | MonDaChon) => void;
  // Báo màn biết AI đang chạy, để màn khóa chip bữa và chip thẻ
  onDangChay: (dangChay: boolean) => void;
};

// Thẻ Mô tả: bấm một món hay ăn, hoặc viết một câu bữa vừa ăn rồi nhờ AI ước tính thành một món
export function MoTa({ monHayAn, onChon, onDangChay }: MoTaProps) {
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
    <View>
      {loiServer ? <ErrorBox message={loiServer} /> : null}

      {/* Bấm một món hay ăn là điền sẵn thẻ Nhập số */}
      <MonBanHayAn monHayAn={monHayAn} isDisabled={dangUocTinh} onChon={onChon} />

      {/* Ô viết bữa vừa ăn, dưới là dòng nhắc ghi cả lượng */}
      <TextField
        label="Bạn đã ăn gì?"
        value={moTa}
        onChangeText={setMoTa}
        error={loiNhap}
        placeholder="Ví dụ: 1 tô phở bò lớn, thêm trứng"
        maxLength={MO_TA_DAI_NHAT}
        isDisabled={dangUocTinh}
        isMultiline
      />
      <Text style={styles.chuNhac}>Ghi cả lượng ăn (tô, chén, gram…) để AI đoán sát hơn</Text>

      <Button title="AI ước tính" loadingTitle="Đang ước tính…" isLoading={dangUocTinh} onPress={uocTinhBangAi} />
    </View>
  );
}

const styles = StyleSheet.create({
  chuNhac: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.large,
  },
});
