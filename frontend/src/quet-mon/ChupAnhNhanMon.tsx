import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { ErrorBox } from '../shared/components/ErrorBox';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { TextField } from '../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { MonDaChon } from './MonDaChon';
import { nhanMonTuAnh } from './QuetMonApi';
import type { KetQuaNhanMon } from './QuetMonApi';

// Ảnh vừa chụp hoặc vừa chọn, dạng base64 để gửi cho AI
type AnhVuaChup = {
  uri: string;
  base64: string;
  mimeType: string;
};

// Nén ảnh còn 50% chất lượng trước khi gửi cho AI, để gửi nhanh và không quá giới hạn của server
const CHAT_LUONG_ANH = 0.5;

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

// Màn chụp món: camera ngay trong app (hoặc chọn ảnh từ thư viện), rồi gửi AI, chọn 1 trong 3 khả năng, chọn phần đã ăn
export function ChupAnhNhanMon({ onChon, onDong }: ChupAnhNhanMonProps) {
  const [quyenCamera, xinQuyenCamera] = useCameraPermissions();
  const coQuyenCamera = quyenCamera !== null && quyenCamera.granted;
  // Tay cầm của camera, cần để gọi lệnh chụp
  const camera = useRef<CameraView>(null);

  const [anh, setAnh] = useState<AnhVuaChup | null>(null);
  const [ghiChu, setGhiChu] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const [ketQua, setKetQua] = useState<KetQuaNhanMon | null>(null);
  const [viTriDangChon, setViTriDangChon] = useState(0);
  const [phanAn, setPhanAn] = useState(1);

  // Bấm nút chụp: chụp bằng camera trong app, nén rồi giữ lại để gửi AI
  async function chupAnh() {
    if (!camera.current) {
      return;
    }
    setLoi('');
    try {
      const anhChup = await camera.current.takePictureAsync({ quality: CHAT_LUONG_ANH, base64: true });
      if (!anhChup.base64) {
        setLoi('Không chụp được ảnh, hãy thử lại');
        return;
      }
      setAnh({ uri: anhChup.uri, base64: anhChup.base64, mimeType: 'image/jpeg' });
    } catch {
      setLoi('Không chụp được ảnh, hãy thử lại');
    }
  }

  // Mở thư viện ảnh của máy (xin bản JPEG thay cho HEIC của iPhone); chọn xong thì giữ lại để gửi AI
  async function chonAnhTuThuVien() {
    setLoi('');
    const ketQuaChon = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: CHAT_LUONG_ANH,
      base64: true,
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (ketQuaChon.canceled) {
      return;
    }
    const anhChon = ketQuaChon.assets[0];
    if (!anhChon.base64) {
      setLoi('Không đọc được ảnh, hãy chọn ảnh khác');
      return;
    }
    setAnh({ uri: anhChon.uri, base64: anhChon.base64, mimeType: anhChon.mimeType ?? 'image/jpeg' });
  }

  // Bấm "Chụp lại": bỏ ảnh và kết quả cũ, quay về camera
  function chupLai() {
    setAnh(null);
    setGhiChu('');
    setLoi('');
    setKetQua(null);
    setViTriDangChon(0);
    setPhanAn(1);
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
  }

  return (
    <Screen>
      <ScreenTitle title={anh ? 'Nhận món từ ảnh' : 'Chụp món'} onBack={onDong} />

      {loi ? <ErrorBox message={loi} /> : null}

      {/* Chưa có ảnh: mẹo chụp, camera, hàng nút Thư viện và nút chụp */}
      {!anh ? (
        <View>
          <Text style={styles.chuPhu}>Mẹo: chụp phần bạn ăn, từ trên xuống, đặt đũa hoặc thìa bên cạnh.</Text>

          {/* Chưa có quyền camera thì xin quyền; vẫn chọn được ảnh từ thư viện */}
          {quyenCamera && !quyenCamera.granted ? (
            <View style={styles.khungXinQuyen}>
              <Text style={styles.chuPhu}>MealMate cần camera để chụp món.</Text>
              <Button title="Cho phép dùng camera" loadingTitle="" isLoading={false} onPress={xinQuyenCamera} />
            </View>
          ) : null}

          {coQuyenCamera ? <CameraView ref={camera} style={styles.camera} /> : null}

          {/* Thư viện bên trái, nút chụp ở giữa; ô trống bên phải rộng bằng nút Thư viện để nút chụp nằm đúng giữa */}
          <View style={styles.hangNut}>
            <Pressable style={({ pressed }) => [styles.nutThuVien, pressed ? styles.dangBam : null]} onPress={chonAnhTuThuVien}>
              <Ionicons name="images-outline" size={26} color={colors.primary} />
              <Text style={styles.chuNutThuVien}>Thư viện</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.nutChup, !coQuyenCamera ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
              disabled={!coQuyenCamera}
              onPress={chupAnh}
            >
              <View style={styles.loiNutChup} />
            </Pressable>
            <View style={styles.nutThuVien} />
          </View>
        </View>
      ) : null}

      {/* Có ảnh: xem ảnh, gửi AI, chọn món */}
      {anh ? (
        <View>
          <Image source={{ uri: anh.uri }} style={styles.anh} />

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
                isDisabled={dangGui}
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
                  style={({ pressed }) => [styles.theKhaNang, viTri === viTriDangChon ? styles.theDangChon : null, pressed ? styles.dangBam : null]}
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

          {/* Chụp lại; khóa khi đang chờ AI */}
          <View style={styles.khoangNut}>
            <Button title="Chụp lại" loadingTitle="" isLoading={false} isDisabled={dangGui} onPress={chupLai} isSecondary />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  khungXinQuyen: {
    marginVertical: spacing.medium,
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.small,
  },
  hangNut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.large,
  },
  nutThuVien: {
    width: 72,
    alignItems: 'center',
  },
  chuNutThuVien: {
    fontSize: fontSizes.secondary,
    color: colors.text,
    marginTop: 2,
  },
  nutChup: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loiNutChup: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  anh: {
    width: '100%',
    height: 220,
    borderRadius: radius.card,
    marginBottom: spacing.large,
    backgroundColor: colors.card,
  },
  nhanNhom: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.small,
    marginBottom: spacing.small,
  },
  theKhaNang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    marginBottom: spacing.small,
  },
  theDangChon: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cotTen: {
    flex: 1,
  },
  tenMon: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  soCalo: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  hangChip: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  khoangNut: {
    marginTop: spacing.large,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
