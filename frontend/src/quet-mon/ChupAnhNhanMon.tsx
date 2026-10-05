import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { ErrorBox } from '../shared/components/ErrorBox';
import { TextField } from '../shared/components/TextField';
import { colors } from '../shared/theme';
import type { MonDaChon } from './MonDaChon';
import { nhanMonTuAnh } from './QuetMonApi';
import type { KetQuaNhanMon } from './QuetMonApi';

// Ảnh vừa chụp, dạng base64 để gửi cho AI
export type AnhVuaChup = {
  uri: string;
  base64: string;
  mimeType: string;
};

// Người dùng ăn bao nhiêu so với phần trong ảnh; là lựa chọn giao diện
const LUA_CHON_PHAN_AN = [
  { giaTri: 0.5, nhan: '½' },
  { giaTri: 1, nhan: '1' },
  { giaTri: 1.5, nhan: '1½' },
  { giaTri: 2, nhan: '2' },
];

// Ghi chú gửi kèm ảnh tối đa bao nhiêu ký tự (giống backend)
const GHI_CHU_DAI_NHAT = 200;

type ChupAnhNhanMonProps = {
  anh: AnhVuaChup | null;
  onChon: (mon: MonDaChon) => void;
  onDong: () => void;
};

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Nhân muối, đường, béo no theo phần đã ăn; AI không trả số này thì giữ null
function nhanTheoPhanAn(soGam: number | null, phanAn: number): number | null {
  if (soGam === null) {
    return null;
  }
  return lamTronMotSoLe(soGam * phanAn);
}

// Màn hiện ra sau khi chụp: thêm ghi chú, gửi AI, chọn 1 trong 3 khả năng, chọn phần đã ăn
export function ChupAnhNhanMon({ anh, onChon, onDong }: ChupAnhNhanMonProps) {
  const [ghiChu, setGhiChu] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const [ketQua, setKetQua] = useState<KetQuaNhanMon | null>(null);
  const [viTriDangChon, setViTriDangChon] = useState(0);
  const [phanAn, setPhanAn] = useState(1);

  // Đóng thì xóa sạch để lần chụp sau bắt đầu lại
  function dong() {
    setGhiChu('');
    setLoi('');
    setKetQua(null);
    setViTriDangChon(0);
    setPhanAn(1);
    onDong();
  }

  // Gửi ảnh và ghi chú cho AI
  async function guiChoAi() {
    if (!anh) {
      return;
    }
    setLoi('');
    setDangGui(true);
    try {
      setKetQua(await nhanMonTuAnh(anh.base64, anh.mimeType, ghiChu.trim()));
      setViTriDangChon(0);
    } catch (loiGui) {
      setLoi((loiGui as Error).message);
    }
    setDangGui(false);
  }

  // Nhân số liệu khả năng đang chọn theo phần đã ăn rồi đưa về form
  function chonMon() {
    if (!ketQua) {
      return;
    }
    const khaNang = ketQua.kha_nang[viTriDangChon];
    const luaChonPhan = LUA_CHON_PHAN_AN.find((luaChon) => luaChon.giaTri === phanAn);
    let khauPhan = khaNang.khau_phan;
    if (phanAn !== 1 && luaChonPhan) {
      khauPhan = `${luaChonPhan.nhan} của ${khaNang.khau_phan}`;
    }
    onChon({
      ten_mon: khaNang.ten_mon,
      khau_phan: khauPhan,
      so_calo: Math.round(khaNang.so_calo * phanAn),
      dam_g: lamTronMotSoLe(khaNang.dam_g * phanAn),
      tinh_bot_g: lamTronMotSoLe(khaNang.tinh_bot_g * phanAn),
      beo_g: lamTronMotSoLe(khaNang.beo_g * phanAn),
      muoi_g: nhanTheoPhanAn(khaNang.muoi_g, phanAn),
      duong_g: nhanTheoPhanAn(khaNang.duong_g, phanAn),
      beo_no_g: nhanTheoPhanAn(khaNang.beo_no_g, phanAn),
      nguon_so_lieu: 'ai',
    });
    dong();
  }

  return (
    <Modal visible={anh !== null} animationType="slide" onRequestClose={dong}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.tieuDe}>Nhận món từ ảnh</Text>
          {anh ? <Image source={{ uri: anh.uri }} style={styles.anh} /> : null}

          {loi ? <ErrorBox message={loi} /> : null}

          {/* Bước 1: chưa gửi thì cho ghi thêm rồi gửi */}
          {!ketQua ? (
            <View>
              <TextField
                label="Ghi thêm (không bắt buộc)"
                value={ghiChu}
                onChangeText={setGhiChu}
                error=""
                placeholder="Ví dụ: tô lớn, ăn ở quán"
                maxLength={GHI_CHU_DAI_NHAT}
              />
              <Button title="Nhận món" loadingTitle="AI đang xem ảnh…" isLoading={dangGui} onPress={guiChoAi} />
            </View>
          ) : null}

          {/* Bước 2a: AI thấy không phải đồ ăn */}
          {ketQua && !ketQua.la_mon_an ? (
            <Text style={styles.chuPhu}>Không nhận ra món ăn trong ảnh. Hãy chụp lại hoặc nhập tay.</Text>
          ) : null}

          {/* Bước 2b: chọn 1 trong các khả năng và phần đã ăn */}
          {ketQua && ketQua.la_mon_an ? (
            <View>
              <Text style={styles.nhanNhom}>AI đoán là</Text>
              {ketQua.kha_nang.map((khaNang, viTri) => (
                <Pressable
                  key={`${khaNang.ten_mon}-${viTri}`}
                  style={[styles.theKhaNang, viTri === viTriDangChon ? styles.theDangChon : null]}
                  onPress={() => setViTriDangChon(viTri)}
                >
                  <View style={styles.cotTen}>
                    <Text style={styles.tenMon}>{khaNang.ten_mon}</Text>
                    <Text style={styles.chuPhu}>{khaNang.khau_phan}</Text>
                  </View>
                  <Text style={styles.soCalo}>{khaNang.so_calo.toLocaleString('vi-VN')} kcal</Text>
                </Pressable>
              ))}

              <Text style={styles.nhanNhom}>Bạn ăn bao nhiêu so với phần trong ảnh?</Text>
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
              <Text style={styles.chuPhu}>Kết quả do AI ước tính, không chính xác 100%. Bạn kiểm tra và sửa lại được ở bước sau.</Text>

              <View style={styles.khoangNut}>
                <Button title="Chọn món này" loadingTitle="" isLoading={false} onPress={chonMon} />
              </View>
            </View>
          ) : null}

          <Pressable style={styles.nutDong} onPress={dong}>
            <Text style={styles.chuNutDong}>Đóng</Text>
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
    marginBottom: 12,
  },
  anh: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.card,
  },
  nhanNhom: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  theKhaNang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  theDangChon: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cotTen: {
    flex: 1,
  },
  tenMon: {
    fontSize: 15,
    color: colors.text,
  },
  soCalo: {
    fontSize: 15,
    color: colors.text,
  },
  hangChip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  khoangNut: {
    marginTop: 16,
  },
  nutDong: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  chuNutDong: {
    fontSize: 15,
    color: colors.primary,
  },
});
