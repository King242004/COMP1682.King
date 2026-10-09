import { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MonDaChon } from '../quet-mon/MonDaChon';
import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { ErrorBox } from '../shared/components/ErrorBox';
import { TextField } from '../shared/components/TextField';
import { colors } from '../shared/theme';
import { timMon } from './TraMonApi';
import type { MonTraCuu } from './TraMonApi';

// Người dùng ăn bao nhiêu so với 1 suất của Viện; là lựa chọn giao diện
const LUA_CHON_PHAN_AN = [
  { giaTri: 0.5, nhan: '½' },
  { giaTri: 1, nhan: '1' },
  { giaTri: 1.5, nhan: '1½' },
  { giaTri: 2, nhan: '2' },
];

// Từ khóa tối đa bao nhiêu ký tự (giống backend)
const TU_KHOA_DAI_NHAT = 50;

type TraMonProps = {
  dangMo: boolean;
  onChon: (mon: MonDaChon) => void;
  onDong: () => void;
};

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Màn tra món: gõ tên, chọn 1 món Viện Dinh dưỡng đã cân, xem ảnh suất, chọn phần đã ăn
export function TraMon({ dangMo, onChon, onDong }: TraMonProps) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangTim, setDangTim] = useState(false);
  const [loi, setLoi] = useState('');
  // Danh sách món tìm được; null là chưa tìm lần nào
  const [ketQua, setKetQua] = useState<MonTraCuu[] | null>(null);
  const [monDangXem, setMonDangXem] = useState<MonTraCuu | null>(null);
  const [phanAn, setPhanAn] = useState(1);

  // Đóng thì xóa sạch để lần sau bắt đầu lại
  function dong() {
    setTuKhoa('');
    setLoi('');
    setKetQua(null);
    setMonDangXem(null);
    setPhanAn(1);
    onDong();
  }

  // Tìm món theo từ khóa đang gõ
  async function tim() {
    setLoi('');
    setDangTim(true);
    try {
      setKetQua(await timMon(tuKhoa.trim()));
    } catch (loiTim) {
      setLoi((loiTim as Error).message);
    }
    setDangTim(false);
  }

  // Bấm một món trong danh sách: mở phần xem món, phần ăn về 1 suất
  function xemMon(mon: MonTraCuu) {
    setMonDangXem(mon);
    setPhanAn(1);
  }

  // Nhân số liệu 1 suất theo phần đã ăn rồi đưa về form; Viện không có số đường, béo no nên để trống
  function chonMon() {
    if (!monDangXem) {
      return;
    }
    const luaChonPhan = LUA_CHON_PHAN_AN.find((luaChon) => luaChon.giaTri === phanAn);
    let khauPhan = '1 suất';
    if (phanAn !== 1 && luaChonPhan) {
      khauPhan = `${luaChonPhan.nhan} suất`;
    }
    onChon({
      ten_mon: monDangXem.ten_mon,
      khau_phan: khauPhan,
      so_calo: Math.round(monDangXem.so_calo * phanAn),
      dam_g: lamTronMotSoLe(monDangXem.dam_g * phanAn),
      tinh_bot_g: lamTronMotSoLe(monDangXem.tinh_bot_g * phanAn),
      beo_g: lamTronMotSoLe(monDangXem.beo_g * phanAn),
      muoi_g: lamTronMotSoLe(monDangXem.muoi_g * phanAn),
      duong_g: null,
      beo_no_g: null,
      nguon_so_lieu: 'vien_dinh_duong',
    });
    dong();
  }

  return (
    <Modal visible={dangMo} animationType="slide" onRequestClose={dong}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.tieuDe}>Tra món</Text>
          <Text style={styles.chuPhu}>Số liệu do Viện Dinh dưỡng cân và phân tích, tính cho 1 suất.</Text>

          {loi ? <ErrorBox message={loi} /> : null}

          {/* Bước 1: chưa chọn món thì gõ tên, tìm, hiện danh sách */}
          {!monDangXem ? (
            <View style={styles.khoiTim}>
              <TextField
                label="Tên món"
                value={tuKhoa}
                onChangeText={setTuKhoa}
                error=""
                placeholder="Ví dụ: phở bò"
                maxLength={TU_KHOA_DAI_NHAT}
              />
              <Button title="Tìm" loadingTitle="Đang tìm…" isLoading={dangTim} onPress={tim} />

              {ketQua && ketQua.length === 0 ? (
                <Text style={styles.chuPhu}>
                  Không thấy món này. Bảng chỉ có món Viện Dinh dưỡng đã cân (chủ yếu miền Bắc); hãy đóng lại rồi chụp ảnh hoặc gõ tên.
                </Text>
              ) : null}
              {ketQua
                ? ketQua.map((mon) => (
                    <Pressable key={mon.ma_so} style={styles.dongMon} onPress={() => xemMon(mon)}>
                      <Text style={styles.tenMon}>{mon.ten_mon}</Text>
                      <Text style={styles.chuPhu}>1 suất · {Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal</Text>
                    </Pressable>
                  ))
                : null}
            </View>
          ) : null}

          {/* Bước 2: đã chọn món thì xem ảnh suất của Viện, chọn phần đã ăn */}
          {monDangXem ? (
            <View>
              <Text style={styles.tenMonLon}>{monDangXem.ten_mon}</Text>
              <Text style={styles.chuPhu}>Viện Dinh dưỡng · mã {monDangXem.ma_so}</Text>

              {/* Ảnh có bảng nguyên liệu và số gam; bấm để mở ảnh gốc mà phóng to */}
              <Pressable onPress={() => Linking.openURL(monDangXem.anh_url)}>
                <Image source={{ uri: monDangXem.anh_url }} style={styles.anh} resizeMode="contain" />
                <Text style={styles.chuLienKet}>Bấm ảnh để phóng to, xem nguyên liệu và số gam</Text>
              </Pressable>

              <Text style={styles.nhanNhom}>Bạn ăn bao nhiêu so với suất này?</Text>
              <View style={styles.hangChip}>
                {LUA_CHON_PHAN_AN.map((luaChon) => (
                  <Chip
                    key={luaChon.nhan}
                    label={luaChon.nhan}
                    isSelected={phanAn === luaChon.giaTri}
                    onPress={() => setPhanAn(luaChon.giaTri)}
                  />
                ))}
              </View>

              {/* Số liệu đã nhân theo phần đang chọn */}
              <Text style={styles.soCalo}>{Math.round(monDangXem.so_calo * phanAn).toLocaleString('vi-VN')} kcal</Text>
              <Text style={styles.chuPhu}>
                Đạm {lamTronMotSoLe(monDangXem.dam_g * phanAn).toLocaleString('vi-VN')} g · tinh bột{' '}
                {lamTronMotSoLe(monDangXem.tinh_bot_g * phanAn).toLocaleString('vi-VN')} g · béo{' '}
                {lamTronMotSoLe(monDangXem.beo_g * phanAn).toLocaleString('vi-VN')} g · muối{' '}
                {lamTronMotSoLe(monDangXem.muoi_g * phanAn).toLocaleString('vi-VN')} g
              </Text>
              <Text style={styles.chuPhu}>Viện chưa có số đường và béo no cho món này.</Text>

              <View style={styles.khoangNut}>
                <Button title="Chọn món này" loadingTitle="" isLoading={false} onPress={chonMon} />
              </View>
              <Pressable style={styles.nutPhu} onPress={() => setMonDangXem(null)}>
                <Text style={styles.chuNutPhu}>Chọn món khác</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.nutPhu} onPress={dong}>
            <Text style={styles.chuNutPhu}>Đóng</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tieuDe: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  khoiTim: {
    marginTop: 16,
  },
  dongMon: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tenMon: {
    fontSize: 15,
    color: colors.text,
  },
  tenMonLon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  anh: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: colors.card,
  },
  chuLienKet: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 6,
  },
  nhanNhom: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  hangChip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  soCalo: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  khoangNut: {
    marginTop: 16,
  },
  nutPhu: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  chuNutPhu: {
    fontSize: 15,
    color: colors.primary,
  },
});
