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

  // Đèn flash khi chụp: mặc định tắt, bấm nút flash để bật / tắt
  const [batFlash, setBatFlash] = useState(false);
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
      canh_bao_di_ung: khaNang.canh_bao_di_ung,
    });
  }

  return (
    <Screen avoidKeyboard>
      <ScreenTitle title={anh ? 'Nhận món từ ảnh' : 'Chụp món'} onBack={onDong} />

      {loi ? <ErrorBox message={loi} /> : null}

      {/* Chưa có ảnh: mẹo chụp, camera, hàng nút Thư viện và nút chụp */}
      {!anh ? (
        <View>
          {/* Mẹo chụp trong khung viền mảnh, có biểu tượng bóng đèn */}
          <View style={styles.khungMeo}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.chuMeo}>
              <Text style={styles.chuMeoDam}>Mẹo:</Text> chụp phần bạn ăn, từ trên xuống, đặt đũa hoặc thìa bên cạnh.
            </Text>
          </View>

          {/* Chưa có quyền camera thì xin quyền; vẫn chọn được ảnh từ thư viện */}
          {quyenCamera && !quyenCamera.granted ? (
            <View style={styles.khungXinQuyen}>
              <Text style={styles.chuPhu}>MealMate cần camera để chụp món.</Text>
              <Button title="Cho phép dùng camera" loadingTitle="" isLoading={false} onPress={xinQuyenCamera} />
            </View>
          ) : null}

          {/* Camera, trên có 4 góc ngắm màu trắng */}
          {coQuyenCamera ? (
            <View style={styles.khungCamera}>
              <CameraView ref={camera} style={styles.camera} flash={batFlash ? 'on' : 'off'} />
              <View style={[styles.gocNgam, styles.gocTrenTrai]} />
              <View style={[styles.gocNgam, styles.gocTrenPhai]} />
              <View style={[styles.gocNgam, styles.gocDuoiTrai]} />
              <View style={[styles.gocNgam, styles.gocDuoiPhai]} />
            </View>
          ) : null}

          {/* Thư viện bên trái, nút chụp ở giữa, nút flash bên phải (rộng bằng nút Thư viện để nút chụp nằm đúng giữa) */}
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
            <Pressable
              style={({ pressed }) => [styles.nutThuVien, !coQuyenCamera ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
              disabled={!coQuyenCamera}
              onPress={() => setBatFlash(!batFlash)}
            >
              <Ionicons name={batFlash ? 'flash' : 'flash-off-outline'} size={26} color={colors.primary} />
              <Text style={styles.chuNutThuVien}>{batFlash ? 'Flash bật' : 'Flash tắt'}</Text>
            </Pressable>
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
              {ketQua.kha_nang.map((khaNang, viTri) => {
                const dangChon = viTri === viTriDangChon;
                return (
                  <Pressable
                    key={`${khaNang.ten_mon}-${viTri}`}
                    style={({ pressed }) => [styles.theKhaNang, dangChon ? styles.theDangChon : null, pressed ? styles.dangBam : null]}
                    onPress={() => setViTriDangChon(viTri)}
                  >
                    {/* Vòng chọn: đang chọn là dấu tích tròn màu chính, chưa chọn là vòng rỗng */}
                    <Ionicons
                      name={dangChon ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={dangChon ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.cotTen}>
                      <Text style={styles.tenMon}>{khaNang.ten_mon}</Text>
                      <Text style={styles.chuPhu}>{khaNang.khau_phan}</Text>
                      {/* Câu cảnh báo dị ứng theo tên món (chỉ khi người dùng có chọn nhóm dị ứng) */}
                      {khaNang.canh_bao_di_ung !== '' ? <Text style={styles.chuCanhBaoDiUng}>{khaNang.canh_bao_di_ung}</Text> : null}
                    </View>
                    <Text style={[styles.soCalo, dangChon ? styles.soCaloDangChon : null]}>{khaNang.so_calo.toLocaleString('vi-VN')} kcal</Text>
                  </Pressable>
                );
              })}

              {/* Câu hỏi phần đã ăn, dưới là 3 chip chia đều cả hàng */}
              <Text style={styles.nhanNhom}>Bạn ăn bao nhiêu so với phần trong ảnh?</Text>
              <View style={styles.hangChip}>
                {LUA_CHON_PHAN_AN.map((luaChon) => (
                  <View key={luaChon.nhan} style={styles.oChip}>
                    <Chip label={luaChon.nhan} isSelected={phanAn === luaChon.giaTri} onPress={() => setPhanAn(luaChon.giaTri)} />
                  </View>
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
  khungMeo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
  },
  chuMeo: {
    flex: 1,
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  chuMeoDam: {
    fontWeight: '600',
    color: colors.text,
  },
  khungXinQuyen: {
    marginVertical: spacing.medium,
  },
  khungCamera: {
    marginTop: spacing.medium,
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  gocNgam: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.surface,
  },
  gocTrenTrai: {
    top: spacing.large,
    left: spacing.large,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  gocTrenPhai: {
    top: spacing.large,
    right: spacing.large,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  gocDuoiTrai: {
    bottom: spacing.large,
    left: spacing.large,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  gocDuoiPhai: {
    bottom: spacing.large,
    right: spacing.large,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
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
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
  soCaloDangChon: {
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  hangChip: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  oChip: {
    flex: 1,
  },
  chuCanhBaoDiUng: {
    fontSize: fontSizes.secondary,
    color: colors.warningText,
    marginTop: 4,
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
