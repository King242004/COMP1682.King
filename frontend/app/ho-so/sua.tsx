import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { ChonNamSinh } from '../../src/ho-so/components/ChonNamSinh';
import { layHoSo, layLuaChonHoSo, luuHoSo } from '../../src/ho-so/HoSoApi';
import type { CamNhanKhiTap, CongViec, GioiTinh, LuaChonHoSo, MucTieu } from '../../src/ho-so/HoSoApi';
import { Button } from '../../src/shared/components/Button';
import { Chip } from '../../src/shared/components/Chip';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { TextField } from '../../src/shared/components/TextField';
import { colors } from '../../src/shared/theme';

// Giới hạn chiều cao, cân nặng: giống ràng buộc CHECK trong 004_ho_so.sql
const CHIEU_CAO_NHO_NHAT = 100;
const CHIEU_CAO_LON_NHAT = 250;
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

// Lựa chọn công việc, ví dụ nghề theo Bảng 5, Bộ Y tế 2016
const LUA_CHON_CONG_VIEC: { giaTri: CongViec; ten: string; viDu: string }[] = [
  { giaTri: 'ngoi_nhieu', ten: 'Ngồi nhiều', viDu: 'Nhân viên văn phòng, giáo viên, bác sĩ, kế toán, bán hàng' },
  { giaTri: 'di_lai_nhieu', ten: 'Đi lại, đứng nhiều', viDu: 'Sinh viên, công nhân công nghiệp nhẹ, công nhân xây dựng' },
  { giaTri: 'lao_dong_nang', ten: 'Lao động chân tay nặng', viDu: 'Nông dân vụ thu hoạch, công nhân mỏ, vận động viên' },
];

// Lựa chọn số buổi và số phút; là lựa chọn giao diện, không phải luật
const LUA_CHON_SO_BUOI = [0, 1, 2, 3, 4, 5, 6, 7];
const LUA_CHON_SO_PHUT = [15, 30, 45, 60, 90, 120];

// Cảm nhận khi tập theo "bài kiểm tra nói chuyện" của CDC
const LUA_CHON_CAM_NHAN: { giaTri: CamNhanKhiTap; ten: string }[] = [
  { giaTri: 'nhe', ten: 'Nói chuyện thoải mái' },
  { giaTri: 'vua', ten: 'Nói được nhưng không hát được' },
  { giaTri: 'nang', ten: 'Chỉ nói được vài từ' },
];

export default function SuaHoSo() {
  const { user, refreshUser } = useAuth();

  // Lần đầu thì là "Thiết lập hồ sơ", đã có hồ sơ thì là "Sửa hồ sơ"
  const [laLanDau] = useState(user ? !user.da_co_ho_so : true);

  // Dữ liệu tải từ server
  const [luaChon, setLuaChon] = useState<LuaChonHoSo | null>(null);
  const [loiTai, setLoiTai] = useState('');

  // Các câu trả lời trong form
  const [gioiTinh, setGioiTinh] = useState<GioiTinh | null>(null);
  const [namSinh, setNamSinh] = useState<number | null>(null);
  const [chieuCao, setChieuCao] = useState('');
  const [canNang, setCanNang] = useState('');
  const [congViec, setCongViec] = useState<CongViec | null>(null);
  const [soBuoiTap, setSoBuoiTap] = useState(0);
  const [soPhutMoiBuoi, setSoPhutMoiBuoi] = useState<number | null>(null);
  const [camNhan, setCamNhan] = useState<CamNhanKhiTap | null>(null);
  const [mucTieu, setMucTieu] = useState<MucTieu>('giu');
  const [benhNen, setBenhNen] = useState<string[]>([]);

  // Lỗi dưới từng ô (theo tên ô), lỗi từ server, trạng thái đang lưu
  const [loiNhap, setLoiNhap] = useState<Record<string, string>>({});
  const [loiServer, setLoiServer] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  // Mở màn là tải các lựa chọn và hồ sơ cũ (nếu có) để điền sẵn
  useEffect(() => {
    taiDuLieu();
  }, []);

  async function taiDuLieu() {
    setLoiTai('');
    try {
      setLuaChon(await layLuaChonHoSo());
      const hoSo = await layHoSo();
      if (hoSo.muc_tieu_calo !== null) {
        setGioiTinh(hoSo.gioi_tinh);
        setNamSinh(hoSo.nam_sinh);
        setChieuCao(String(hoSo.chieu_cao_cm));
        setCanNang(String(hoSo.can_nang_kg));
        setCongViec(hoSo.cong_viec);
        setSoBuoiTap(hoSo.so_buoi_tap ?? 0);
        setSoPhutMoiBuoi(hoSo.so_phut_moi_buoi);
        setCamNhan(hoSo.cam_nhan_khi_tap);
        setMucTieu(hoSo.muc_tieu ?? 'giu');
        setBenhNen(hoSo.benh_nen);
      }
    } catch (loi) {
      setLoiTai((loi as Error).message);
    }
  }

  // BMI tính ngay khi đã nhập đủ chiều cao và cân nặng, để làm mờ mục tiêu không phù hợp
  const chieuCaoSo = Number(chieuCao.replace(',', '.'));
  const canNangSo = Number(canNang.replace(',', '.'));
  let bmi: number | null = null;
  if (chieuCaoSo > 0 && canNangSo > 0) {
    bmi = canNangSo / ((chieuCaoSo / 100) * (chieuCaoSo / 100));
  }
  let choPhepGiam = true;
  let choPhepTang = true;
  if (bmi !== null && luaChon !== null) {
    choPhepGiam = bmi >= luaChon.bmi_thieu_can;
    choPhepTang = bmi < luaChon.bmi_ly_tuong;
  }

  // Mục tiêu đang chọn bị làm mờ (vì vừa sửa cân nặng) thì quay về "Giữ cân"
  useEffect(() => {
    if ((mucTieu === 'giam' && !choPhepGiam) || (mucTieu === 'tang' && !choPhepTang)) {
      setMucTieu('giu');
    }
  }, [choPhepGiam, choPhepTang]);

  // Bấm chọn hoặc bỏ chọn một bệnh nền
  function doiBenhNen(ma: string) {
    if (benhNen.includes(ma)) {
      setBenhNen(benhNen.filter((maDaChon) => maDaChon !== ma));
    } else {
      setBenhNen([...benhNen, ma]);
    }
  }

  // Kiểm các ô, đúng thì gửi lên server
  async function handleLuu() {
    // Bước 1. Kiểm từng ô, gom lỗi theo tên ô
    const loiMoi: Record<string, string> = {};
    if (gioiTinh === null) {
      loiMoi.gioiTinh = 'Hãy chọn giới tính';
    }
    if (namSinh === null) {
      loiMoi.namSinh = 'Hãy chọn năm sinh';
    }
    if (!(chieuCaoSo >= CHIEU_CAO_NHO_NHAT && chieuCaoSo <= CHIEU_CAO_LON_NHAT)) {
      loiMoi.chieuCao = `Chiều cao từ ${CHIEU_CAO_NHO_NHAT} đến ${CHIEU_CAO_LON_NHAT} cm`;
    }
    if (!(canNangSo >= CAN_NANG_NHO_NHAT && canNangSo <= CAN_NANG_LON_NHAT)) {
      loiMoi.canNang = `Cân nặng từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`;
    }
    if (congViec === null) {
      loiMoi.congViec = 'Hãy chọn công việc';
    }
    if (soBuoiTap > 0 && soPhutMoiBuoi === null) {
      loiMoi.soPhut = 'Hãy chọn số phút mỗi buổi';
    }
    if (soBuoiTap > 0 && camNhan === null) {
      loiMoi.camNhan = 'Hãy chọn cảm nhận khi tập';
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0 || gioiTinh === null || namSinh === null || congViec === null) {
      return;
    }

    // Bước 2. Gửi lên server; không tập thì không gửi số phút và cảm nhận
    setLoiServer('');
    setDangLuu(true);
    try {
      await luuHoSo({
        gioi_tinh: gioiTinh,
        nam_sinh: namSinh,
        chieu_cao_cm: chieuCaoSo,
        can_nang_kg: canNangSo,
        cong_viec: congViec,
        so_buoi_tap: soBuoiTap,
        so_phut_moi_buoi: soBuoiTap > 0 ? soPhutMoiBuoi : null,
        cam_nhan_khi_tap: soBuoiTap > 0 ? camNhan : null,
        muc_tieu: mucTieu,
        benh_nen: benhNen,
      });
      await refreshUser();
      // Bước 3. Lần đầu thì vào trang chủ, sửa thì quay lại màn hồ sơ
      if (laLanDau) {
        router.replace('/(tabs)');
      } else {
        router.back();
      }
    } catch (loi) {
      setLoiServer((loi as Error).message);
      setDangLuu(false);
    }
  }

  // Đang tải, hoặc tải lỗi
  if (luaChon === null) {
    return (
      <SafeAreaView style={styles.giuaManHinh}>
        {loiTai ? <ErrorBox message={loiTai} onRetry={taiDuLieu} /> : <ActivityIndicator color={colors.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.tieuDe}>{laLanDau ? 'Thiết lập hồ sơ' : 'Sửa hồ sơ'}</Text>
        <Text style={styles.moTa}>Dùng để tính mục tiêu calo mỗi ngày của bạn</Text>

        {loiServer ? <ErrorBox message={loiServer} /> : null}

        {/* Cơ thể */}
        <Text style={styles.nhanNhom}>Giới tính</Text>
        <View style={styles.hangChip}>
          <Chip label="Nam" isSelected={gioiTinh === 'nam'} onPress={() => setGioiTinh('nam')} />
          <Chip label="Nữ" isSelected={gioiTinh === 'nu'} onPress={() => setGioiTinh('nu')} />
        </View>
        {loiNhap.gioiTinh ? <Text style={styles.chuLoi}>{loiNhap.gioiTinh}</Text> : null}

        <ChonNamSinh namSinh={namSinh} onChon={setNamSinh} loi={loiNhap.namSinh ?? ''} />
        <TextField label="Chiều cao (cm)" value={chieuCao} onChangeText={setChieuCao} error={loiNhap.chieuCao ?? ''} placeholder="165" isNumber />
        <TextField label="Cân nặng (kg)" value={canNang} onChangeText={setCanNang} error={loiNhap.canNang ?? ''} placeholder="55" isNumber />

        {/* Vận động */}
        <Text style={styles.nhanNhom}>Công việc hằng ngày</Text>
        {LUA_CHON_CONG_VIEC.map((luaChonCongViec) => (
          <View key={luaChonCongViec.giaTri} style={styles.dongCongViec}>
            <Chip
              label={luaChonCongViec.ten}
              isSelected={congViec === luaChonCongViec.giaTri}
              onPress={() => setCongViec(luaChonCongViec.giaTri)}
            />
            <Text style={styles.chuPhu}>{luaChonCongViec.viDu}</Text>
          </View>
        ))}
        {loiNhap.congViec ? <Text style={styles.chuLoi}>{loiNhap.congViec}</Text> : null}

        <Text style={styles.nhanNhom}>Mỗi tuần bạn tập thể thao mấy buổi?</Text>
        <View style={styles.hangChip}>
          {LUA_CHON_SO_BUOI.map((soBuoi) => (
            <Chip key={soBuoi} label={String(soBuoi)} isSelected={soBuoiTap === soBuoi} onPress={() => setSoBuoiTap(soBuoi)} />
          ))}
        </View>

        <Text style={styles.nhanNhom}>Mỗi buổi khoảng bao nhiêu phút?</Text>
        <View style={styles.hangChip}>
          {LUA_CHON_SO_PHUT.map((soPhut) => (
            <Chip
              key={soPhut}
              label={String(soPhut)}
              isSelected={soBuoiTap > 0 && soPhutMoiBuoi === soPhut}
              isDisabled={soBuoiTap === 0}
              onPress={() => setSoPhutMoiBuoi(soPhut)}
            />
          ))}
        </View>
        {loiNhap.soPhut ? <Text style={styles.chuLoi}>{loiNhap.soPhut}</Text> : null}

        <Text style={styles.nhanNhom}>Lúc tập bạn thấy thế nào?</Text>
        <View style={styles.hangChip}>
          {LUA_CHON_CAM_NHAN.map((luaChonCamNhan) => (
            <Chip
              key={luaChonCamNhan.giaTri}
              label={luaChonCamNhan.ten}
              isSelected={soBuoiTap > 0 && camNhan === luaChonCamNhan.giaTri}
              isDisabled={soBuoiTap === 0}
              onPress={() => setCamNhan(luaChonCamNhan.giaTri)}
            />
          ))}
        </View>
        {loiNhap.camNhan ? <Text style={styles.chuLoi}>{loiNhap.camNhan}</Text> : null}

        {/* Mục tiêu: lựa chọn không hợp với BMI thì làm mờ kèm một dòng lý do */}
        <Text style={styles.nhanNhom}>Mục tiêu</Text>
        <View style={styles.hangChip}>
          <Chip label="Giảm cân" isSelected={mucTieu === 'giam'} isDisabled={!choPhepGiam} onPress={() => setMucTieu('giam')} />
          <Chip label="Giữ cân" isSelected={mucTieu === 'giu'} onPress={() => setMucTieu('giu')} />
          <Chip label="Tăng cân" isSelected={mucTieu === 'tang'} isDisabled={!choPhepTang} onPress={() => setMucTieu('tang')} />
        </View>
        {!choPhepGiam ? (
          <Text style={styles.chuPhu}>Giảm cân dành cho BMI từ {luaChon.bmi_thieu_can.toLocaleString('vi-VN')} trở lên</Text>
        ) : null}
        {!choPhepTang ? (
          <Text style={styles.chuPhu}>Tăng cân dành cho BMI dưới {luaChon.bmi_ly_tuong.toLocaleString('vi-VN')}</Text>
        ) : null}

        {/* Bệnh nền: chọn nhiều, có thể không chọn */}
        <Text style={styles.nhanNhom}>Bệnh nền (nếu có)</Text>
        <View style={styles.hangChip}>
          {luaChon.benh_nen.map((benh) => (
            <Chip key={benh.ma} label={benh.ten} isSelected={benhNen.includes(benh.ma)} onPress={() => doiBenhNen(benh.ma)} />
          ))}
        </View>

        <View style={styles.khoangNut}>
          <Button title="Lưu hồ sơ" loadingTitle="Đang lưu…" isLoading={dangLuu} onPress={handleLuu} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  giuaManHinh: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tieuDe: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  moTa: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  dongCongViec: {
    marginBottom: 10,
    gap: 4,
  },
  chuPhu: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chuLoi: {
    fontSize: 13,
    color: colors.error,
    marginTop: 4,
  },
  khoangNut: {
    marginTop: 28,
  },
});
