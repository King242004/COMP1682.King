import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../shared/components/Button';
import { ErrorBox } from '../shared/components/ErrorBox';
import { TextField } from '../shared/components/TextField';
import { colors } from '../shared/theme';
import type { MonDaChon } from './MonDaChon';
import { traMaVach } from './QuetMonApi';
import type { SanPhamMaVach } from './QuetMonApi';

// Số gam lớn nhất cho một lần ăn, để chặn gõ nhầm; là lựa chọn giao diện
const SO_GAM_LON_NHAT = 5000;

type QuetMaVachProps = {
  dangMo: boolean;
  onChon: (mon: MonDaChon) => void;
  onDong: () => void;
};

// Nhân số liệu trên 100 g theo số gam đã ăn, làm tròn 1 số lẻ; chất chưa có thì giữ null
function nhanTheoGam(soLieu100g: number | null, soGam: number): number | null {
  if (soLieu100g === null) {
    return null;
  }
  return Math.round(((soLieu100g * soGam) / 100) * 10) / 10;
}

// Màn quét mã vạch: camera đọc mã, tra Open Food Facts, nhập số gam đã ăn
export function QuetMaVach({ dangMo, onChon, onDong }: QuetMaVachProps) {
  const [quyenCamera, xinQuyenCamera] = useCameraPermissions();
  const [dangTra, setDangTra] = useState(false);
  const [loi, setLoi] = useState('');
  const [sanPham, setSanPham] = useState<SanPhamMaVach | null>(null);
  const [soGam, setSoGam] = useState('');
  const [loiSoGam, setLoiSoGam] = useState('');
  // Camera đọc mã nhiều lần mỗi giây; cờ này giữ cho chỉ tra một lần
  const daNhanMa = useRef(false);

  // Đóng thì xóa sạch để lần quét sau bắt đầu lại
  function dong() {
    daNhanMa.current = false;
    setDangTra(false);
    setLoi('');
    setSanPham(null);
    setSoGam('');
    setLoiSoGam('');
    onDong();
  }

  // Camera đọc được mã: tra một lần, đang tra hoặc đã có kết quả thì bỏ qua các lần đọc sau
  async function khiQuetDuoc(maVach: string) {
    if (daNhanMa.current) {
      return;
    }
    daNhanMa.current = true;
    setDangTra(true);
    try {
      const sanPhamTimDuoc = await traMaVach(maVach);
      setSanPham(sanPhamTimDuoc);
      if (sanPhamTimDuoc.khoi_luong_1_phan_g !== null) {
        setSoGam(String(sanPhamTimDuoc.khoi_luong_1_phan_g));
      }
    } catch (loiTra) {
      setLoi((loiTra as Error).message);
    }
    setDangTra(false);
  }

  // Quét lại từ đầu
  function quetLai() {
    daNhanMa.current = false;
    setLoi('');
    setSanPham(null);
    setSoGam('');
  }

  // Kiểm số gam rồi đưa món về form
  function chonMon() {
    if (!sanPham) {
      return;
    }
    const soGamSo = Number(soGam.replace(',', '.'));
    if (!(soGamSo > 0 && soGamSo <= SO_GAM_LON_NHAT)) {
      setLoiSoGam(`Số gam từ 1 đến ${SO_GAM_LON_NHAT.toLocaleString('vi-VN')}`);
      return;
    }
    onChon({
      ten_mon: sanPham.ten_san_pham,
      khau_phan: `${soGamSo.toLocaleString('vi-VN')} g`,
      so_calo: Math.round((sanPham.kcal_100g * soGamSo) / 100),
      dam_g: nhanTheoGam(sanPham.dam_100g, soGamSo),
      tinh_bot_g: nhanTheoGam(sanPham.tinh_bot_100g, soGamSo),
      beo_g: nhanTheoGam(sanPham.beo_100g, soGamSo),
      muoi_g: nhanTheoGam(sanPham.muoi_100g, soGamSo),
      duong_g: nhanTheoGam(sanPham.duong_100g, soGamSo),
      beo_no_g: nhanTheoGam(sanPham.beo_no_100g, soGamSo),
      nguon_so_lieu: 'ma_vach',
    });
    dong();
  }

  // Tổng calo xem trước khi đã nhập số gam
  const soGamXemTruoc = Number(soGam.replace(',', '.'));
  let tongCaloXemTruoc: number | null = null;
  if (sanPham && soGamXemTruoc > 0) {
    tongCaloXemTruoc = Math.round((sanPham.kcal_100g * soGamXemTruoc) / 100);
  }

  return (
    <Modal visible={dangMo} animationType="slide" onRequestClose={dong}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.tieuDe}>Quét mã vạch</Text>

          {/* Chưa có quyền camera thì xin quyền */}
          {quyenCamera && !quyenCamera.granted ? (
            <View>
              <Text style={styles.chuPhu}>MealMate cần camera để đọc mã vạch trên bao bì.</Text>
              <View style={styles.khoangNut}>
                <Button title="Cho phép dùng camera" loadingTitle="" isLoading={false} onPress={xinQuyenCamera} />
              </View>
            </View>
          ) : null}

          {/* Đang quét: hiện camera */}
          {quyenCamera && quyenCamera.granted && !sanPham && !loi ? (
            <View>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
                onBarcodeScanned={(ketQuaQuet) => khiQuetDuoc(ketQuaQuet.data)}
              />
              <Text style={styles.chuPhu}>{dangTra ? 'Đang tra sản phẩm…' : 'Đưa mã vạch vào khung hình'}</Text>
            </View>
          ) : null}

          {/* Không tìm thấy hoặc lỗi mạng */}
          {loi ? (
            <View>
              <ErrorBox message={loi} />
              <Button title="Quét lại" loadingTitle="" isLoading={false} onPress={quetLai} isSecondary />
            </View>
          ) : null}

          {/* Đã có sản phẩm: nhập số gam đã ăn */}
          {sanPham ? (
            <View>
              <Text style={styles.tenSanPham}>{sanPham.ten_san_pham}</Text>
              <Text style={styles.chuPhu}>Nguồn: Open Food Facts</Text>
              <View style={styles.theSoLieu}>
                <Text style={styles.chuThuong}>Trên 100 g: {sanPham.kcal_100g.toLocaleString('vi-VN')} kcal</Text>
                {sanPham.khoi_luong_1_phan_g !== null ? (
                  <Text style={styles.chuPhu}>1 phần = {sanPham.khoi_luong_1_phan_g.toLocaleString('vi-VN')} g (theo nhãn)</Text>
                ) : null}
              </View>
              <TextField label="Số gam đã ăn" value={soGam} onChangeText={setSoGam} error={loiSoGam} placeholder="Ví dụ: 100" isNumber />
              {tongCaloXemTruoc !== null ? (
                <Text style={styles.tong}>Tổng: {tongCaloXemTruoc.toLocaleString('vi-VN')} kcal</Text>
              ) : null}
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
  camera: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tenSanPham: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  theSoLieu: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
  },
  chuThuong: {
    fontSize: 15,
    color: colors.text,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tong: {
    fontSize: 15,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 10,
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
