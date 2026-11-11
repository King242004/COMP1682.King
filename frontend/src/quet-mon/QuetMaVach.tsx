import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { docKhoiLuong, doiGamRaDonVi, vietGioiHan, vietKhoiLuong } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { TextField } from '../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { MonDaChon } from './MonDaChon';
import { traMaVach } from './QuetMonApi';
import type { SanPhamMaVach } from './QuetMonApi';

// Số phần chọn được bằng nút − / +: từ 0,5 tới 10, mỗi lần 0,5; là lựa chọn giao diện
const SO_PHAN_NHO_NHAT = 0.5;
const SO_PHAN_LON_NHAT = 10;
const BUOC_SO_PHAN = 0.5;

// Số gam lớn nhất cho một lần ăn khi tự gõ, để chặn gõ nhầm; là lựa chọn giao diện
const SO_GAM_LON_NHAT = 5000;

type QuetMaVachProps = {
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

// Màn quét mã vạch: camera đọc mã, tra Open Food Facts, chọn số phần (1 phần = cả gói, hộp hoặc lon) hoặc gõ số gam đã ăn
export function QuetMaVach({ onChon, onDong }: QuetMaVachProps) {
  const [quyenCamera, xinQuyenCamera] = useCameraPermissions();
  const [dangTra, setDangTra] = useState(false);
  const [loi, setLoi] = useState('');
  const [sanPham, setSanPham] = useState<SanPhamMaVach | null>(null);
  // Số phần đang chọn bằng − / +; null là người dùng tự gõ số gam
  const [soPhan, setSoPhan] = useState<number | null>(1);
  const [chuSoGam, setChuSoGam] = useState('');
  const [loiSoGam, setLoiSoGam] = useState('');
  // Ô lượng theo đơn vị: Mét gõ gam, Anh-Mỹ gõ oz
  const { donVi, heSo } = useDonVi();
  const laAnhMy = donVi === 'anh_my' && heSo !== null;
  const insets = useSafeAreaInsets();
  // Camera đọc mã nhiều lần mỗi giây; cờ này giữ cho chỉ tra một lần, tới khi bấm "Quét lại"
  const daNhanMa = useRef(false);

  // Camera đọc được mã: tra một lần; có sản phẩm thì mở ra ở 1 phần, không ghi khối lượng bao bì thì để người dùng gõ số gam
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
        setSoPhan(1);
        setChuSoGam(String(doiGamRaDonVi(sanPhamTimDuoc.khoi_luong_1_phan_g, donVi, heSo)).replace('.', ','));
      } else {
        setSoPhan(null);
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
    setSoPhan(1);
    setChuSoGam('');
    setLoiSoGam('');
  }

  // Đổi số phần: ô số gam tự điền theo khối lượng cả bao bì
  function doiSoPhan(soPhanMoi: number) {
    if (!sanPham || sanPham.khoi_luong_1_phan_g === null) {
      return;
    }
    setSoPhan(soPhanMoi);
    setChuSoGam(String(doiGamRaDonVi(sanPham.khoi_luong_1_phan_g * soPhanMoi, donVi, heSo)).replace('.', ','));
    setLoiSoGam('');
  }

  // Bấm −: đang tự gõ số gam thì về 1 phần
  function botMotPhan() {
    if (soPhan === null) {
      doiSoPhan(1);
      return;
    }
    doiSoPhan(soPhan - BUOC_SO_PHAN);
  }

  // Bấm +: đang tự gõ số gam thì về 1 phần
  function themMotPhan() {
    if (soPhan === null) {
      doiSoPhan(1);
      return;
    }
    doiSoPhan(soPhan + BUOC_SO_PHAN);
  }

  // Gõ tay số gam thì không còn đếm theo phần
  function goSoGam(chu: string) {
    setChuSoGam(chu);
    setSoPhan(null);
  }

  // Số gam đang có trong ô, đổi về gam
  const soGam = docKhoiLuong(chuSoGam, donVi, heSo) ?? 0;

  // Kiểm số gam rồi đưa món về form; khẩu phần ghi "3 phần (225 g)", tự gõ thì "15 g"
  function chonMon() {
    if (!sanPham) {
      return;
    }
    if (!(soGam > 0 && soGam <= SO_GAM_LON_NHAT)) {
      setLoiSoGam(`Số ${laAnhMy ? 'oz' : 'gam'} ${vietGioiHan(1, SO_GAM_LON_NHAT, 'khoi_luong', donVi, heSo)}`);
      return;
    }
    let khauPhan = vietKhoiLuong(soGam, donVi, heSo);
    if (soPhan !== null) {
      khauPhan = `${soPhan.toLocaleString('vi-VN')} phần (${khauPhan})`;
    }
    onChon({
      ten_mon: sanPham.ten_san_pham,
      khau_phan: khauPhan,
      so_calo: Math.round((sanPham.kcal_100g * soGam) / 100),
      dam_g: nhanTheoGam(sanPham.dam_100g, soGam),
      tinh_bot_g: nhanTheoGam(sanPham.tinh_bot_100g, soGam),
      beo_g: nhanTheoGam(sanPham.beo_100g, soGam),
      muoi_g: nhanTheoGam(sanPham.muoi_100g, soGam),
      duong_g: nhanTheoGam(sanPham.duong_100g, soGam),
      beo_no_g: nhanTheoGam(sanPham.beo_no_100g, soGam),
      nguon_so_lieu: 'ma_vach',
      canh_bao_di_ung: sanPham.canh_bao_di_ung,
    });
  }

  // Tổng calo xem trước khi ô số gam có số
  let tongCalo: number | null = null;
  if (sanPham && soGam > 0) {
    tongCalo = Math.round((sanPham.kcal_100g * soGam) / 100);
  }

  return (
    <View style={styles.khung}>
      <Screen compactBottom={sanPham !== null} avoidKeyboard>
        <ScreenTitle title="Quét mã vạch" onBack={onDong} />

        {/* Chưa có quyền camera thì xin quyền */}
        {quyenCamera && !quyenCamera.granted ? (
          <View>
            <Text style={styles.chuPhu}>MealMate cần camera để đọc mã vạch trên bao bì.</Text>
            <View style={styles.khoangNut}>
              <Button title="Cho phép dùng camera" loadingTitle="" isLoading={false} onPress={xinQuyenCamera} />
            </View>
          </View>
        ) : null}

        {/* Chưa có sản phẩm: hiện camera; không tra được thì camera dừng đọc, câu lỗi và nút "Quét lại" nằm ngay dưới */}
        {quyenCamera && quyenCamera.granted && !sanPham ? (
          <View>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
              onBarcodeScanned={(ketQuaQuet) => khiQuetDuoc(ketQuaQuet.data)}
            />
            {loi ? (
              <View>
                <Text style={styles.chuLoi}>{loi}</Text>
                <Button title="Quét lại" loadingTitle="" isLoading={false} onPress={quetLai} isSecondary />
              </View>
            ) : (
              <Text style={styles.chuPhu}>{dangTra ? 'Đang tra sản phẩm…' : 'Đưa mã vạch vào khung hình'}</Text>
            )}
          </View>
        ) : null}

        {/* Đã có sản phẩm: thẻ sản phẩm, thẻ lượng đã ăn */}
        {sanPham ? (
          <View>
            {/* Thẻ sản phẩm: tên, nhãn dị ứng và nguồn, năng lượng trên 100 g, khối lượng 1 phần */}
            <Card>
              <Text style={styles.tenSanPham}>{sanPham.ten_san_pham}</Text>
              {/* Nhãn vàng cảnh báo dị ứng theo nhãn và tên sản phẩm (chỉ khi người dùng có chọn nhóm dị ứng), cạnh dòng nguồn */}
              <View style={styles.hangNguon}>
                {sanPham.canh_bao_di_ung !== '' ? <Text style={styles.nhanDiUng}>{sanPham.canh_bao_di_ung}</Text> : null}
                <Text style={styles.chuPhu}>Nguồn: Open Food Facts</Text>
              </View>
              <View style={styles.hangNangLuong}>
                <Text style={styles.chuThuong}>Năng lượng</Text>
                <Text style={styles.nhanNangLuong}>
                  {Math.round(sanPham.kcal_100g).toLocaleString('vi-VN')} kcal / 100 g{laAnhMy ? ` (${vietKhoiLuong(100, donVi, heSo)})` : ''}
                </Text>
              </View>
              {sanPham.khoi_luong_1_phan_g !== null ? (
                <Text style={styles.chuPhu}>1 phần = cả gói, hộp hoặc lon ({vietKhoiLuong(sanPham.khoi_luong_1_phan_g, donVi, heSo)})</Text>
              ) : null}
            </Card>

            {/* Thẻ "Lượng đã ăn": hàng − / + (khi biết khối lượng bao bì), ô số gam, ô tổng calo kèm phép tính */}
            <Card>
              <Text style={styles.tieuDeLuong}>Lượng đã ăn</Text>
              {sanPham.khoi_luong_1_phan_g !== null ? (
                <View style={styles.oDem}>
                  <Pressable
                    style={({ pressed }) => [styles.nutDem, soPhan !== null && soPhan <= SO_PHAN_NHO_NHAT ? styles.nutMo : null, pressed ? styles.dangBam : null]}
                    disabled={soPhan !== null && soPhan <= SO_PHAN_NHO_NHAT}
                    onPress={botMotPhan}
                  >
                    <Ionicons name="remove" size={22} color={colors.primary} />
                  </Pressable>
                  {soPhan !== null ? (
                    <Text style={styles.soPhan}>{soPhan.toLocaleString('vi-VN')} phần</Text>
                  ) : (
                    <Text style={styles.chuPhu}>{laAnhMy ? 'Bạn tự nhập số oz' : 'Bạn tự nhập số gam'}</Text>
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.nutDem, soPhan !== null && soPhan >= SO_PHAN_LON_NHAT ? styles.nutMo : null, pressed ? styles.dangBam : null]}
                    disabled={soPhan !== null && soPhan >= SO_PHAN_LON_NHAT}
                    onPress={themMotPhan}
                  >
                    <Ionicons name="add" size={22} color={colors.primary} />
                  </Pressable>
                </View>
              ) : null}
              <TextField
                label={laAnhMy ? 'Số oz' : 'Số gam'}
                value={chuSoGam}
                onChangeText={goSoGam}
                error={loiSoGam}
                placeholder={laAnhMy ? 'Ví dụ: 3,5' : 'Ví dụ: 100'}
                isNumber
              />
              {tongCalo !== null ? (
                <View style={styles.oTong}>
                  <Text style={styles.nhanTong}>Tổng calo</Text>
                  <View style={styles.hangSoTong}>
                    <Text style={styles.soTong}>{tongCalo.toLocaleString('vi-VN')}</Text>
                    <Text style={styles.chuThuong}>kcal</Text>
                  </View>
                  <Text style={styles.chuPhu}>
                    {vietKhoiLuong(soGam, donVi, heSo)} × {Math.round(sanPham.kcal_100g).toLocaleString('vi-VN')} kcal / {vietKhoiLuong(100, donVi, heSo)} ≈{' '}
                    {tongCalo.toLocaleString('vi-VN')} kcal
                  </Text>
                </View>
              ) : null}
            </Card>
          </View>
        ) : null}
      </Screen>

      {/* Đã có sản phẩm: nút chọn món và nút quét lại ghim ở đáy màn */}
      {sanPham ? (
        <View style={[styles.thanhDuoi, { paddingBottom: insets.bottom + spacing.small }]}>
          <Button title="Chọn món này" loadingTitle="" isLoading={false} onPress={chonMon} />
          <View style={styles.khoangNutPhu}>
            <Button title="Quét lại" loadingTitle="" isLoading={false} onPress={quetLai} isSecondary />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    width: '100%',
    height: 320,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.small,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginBottom: spacing.small,
  },
  tenSanPham: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  hangNguon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.small,
    marginTop: 4,
  },
  // Nhãn vàng nhỏ, giống nhãn dị ứng ở Khám phá
  nhanDiUng: {
    fontSize: fontSizes.label,
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    borderRadius: radius.input,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  hangNangLuong: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.small,
    marginTop: spacing.medium,
    marginBottom: 4,
  },
  nhanNangLuong: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.medium,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  tieuDeLuong: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  // Ô nền xám bo tròn chứa hàng − / +
  oDem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.input,
    padding: spacing.small,
    marginBottom: spacing.medium,
  },
  nutDem: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutMo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  soPhan: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuThuong: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  oTong: {
    backgroundColor: colors.card,
    borderRadius: radius.input,
    padding: spacing.medium,
  },
  nhanTong: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  hangSoTong: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  soTong: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.primary,
  },
  khoangNut: {
    marginTop: spacing.large,
  },
  // Thanh nút ghim ở đáy, giống thanh nút ở màn Thiết lập hồ sơ
  thanhDuoi: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  khoangNutPhu: {
    marginTop: spacing.small,
  },
});
