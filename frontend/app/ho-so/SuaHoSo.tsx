import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { docCanNang, docChieuCaoFeetInch, doiCmRaFeetInch, doiKgRaDonVi, vietGioiHan } from '../../src/don-vi/DoiDonVi';
import type { DonVi } from '../../src/don-vi/DoiDonVi';
import { useDonVi } from '../../src/don-vi/DonViContext';
import { ChonNgaySinh } from '../../src/ho-so/sua-ho-so/ChonNgaySinh';
import { layHoSo, layLuaChonHoSo, luuHoSo } from '../../src/ho-so/HoSoApi';
import type { GioiTinh, LuaChonHoSo, MucTieu, MucVanDong } from '../../src/ho-so/HoSoApi';
import { Button } from '../../src/shared/components/Button';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { TextField } from '../../src/shared/components/TextField';
import { ageOnDate, todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

// Phần nào của hồ sơ đang sửa: mở từ thẻ nào thì chỉ hiện phần đó
type PhanSua = 'ca-nhan' | 'muc-tieu' | 'di-ung';

// Tiêu đề màn theo phần đang sửa
const TIEU_DE_THEO_PHAN: Record<PhanSua, string> = {
  'ca-nhan': 'Thông tin cá nhân',
  'muc-tieu': 'Mục tiêu',
  'di-ung': 'Dị ứng, kiêng ăn',
};

// Giới hạn chiều cao, cân nặng: giống ràng buộc CHECK trong 004_ho_so.sql
const CHIEU_CAO_NHO_NHAT = 100;
const CHIEU_CAO_LON_NHAT = 250;
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

// Ô kiêng ăn khác tối đa bao nhiêu ký tự (giống backend)
const DI_UNG_KIENG_AN_DAI_NHAT = 200;

// Ba mức vận động, mô tả theo Bảng 5 của Chuẩn dinh dưỡng người Nhật 2025 (ThuatToan.md bước 4)
const LUA_CHON_MUC_VAN_DONG: { giaTri: MucVanDong; ten: string; moTa: string }[] = [
  { giaTri: 'nhe', ten: 'Nhẹ', moTa: 'Phần lớn thời gian ngồi, chủ yếu hoạt động tĩnh' },
  {
    giaTri: 'trung_binh',
    ten: 'Trung bình',
    moTa: 'Công việc chủ yếu ngồi, nhưng có một trong các việc: đi lại hoặc đứng làm, tiếp khách; đi bộ đi làm, đi chợ; làm việc nhà; chơi thể thao nhẹ',
  },
  { giaTri: 'nang', ten: 'Nặng', moTa: 'Công việc phải đi lại, đứng nhiều; hoặc có thói quen chơi thể thao tích cực lúc rảnh' },
];

export default function SuaHoSo() {
  const { user, refreshUser, changeDisplayName } = useAuth();
  const { donVi, heSo, doiDonVi } = useDonVi();
  const insets = useSafeAreaInsets();
  const thamSo = useLocalSearchParams<{ phan?: PhanSua }>();

  // Lần đầu thì là "Thiết lập hồ sơ" và hiện đủ mọi phần; đã có hồ sơ thì chỉ hiện phần được mở
  const [laLanDau] = useState(user ? !user.da_co_ho_so : true);
  const hienCaNhan = laLanDau || thamSo.phan === 'ca-nhan';
  const hienMucTieu = laLanDau || thamSo.phan === 'muc-tieu';
  const hienDiUng = laLanDau || thamSo.phan === 'di-ung';
  // Ô tên chỉ có ở màn Thông tin cá nhân (lần đầu đã nhập tên lúc đăng ký); ô cân nặng chỉ có lần đầu (sau đó ghi ở màn Tiến độ)
  const hienOTen = !laLanDau && thamSo.phan === 'ca-nhan';
  const hienOCanNang = laLanDau;

  // Lần đầu chọn đơn vị ngay trong form (lưu khi bấm Lưu); sửa sau thì dùng đơn vị đã chọn ở Tài khoản
  const [donViLanDau, setDonViLanDau] = useState<DonVi>(donVi);
  const donViDangDung = laLanDau ? donViLanDau : donVi;
  const laAnhMy = donViDangDung === 'anh_my' && heSo !== null;

  // Dữ liệu tải từ server
  const [luaChon, setLuaChon] = useState<LuaChonHoSo | null>(null);
  const [loiTai, setLoiTai] = useState('');

  // Các câu trả lời trong form; phần không hiện vẫn giữ giá trị cũ để gửi lên đủ hồ sơ
  const [tenHienThi, setTenHienThi] = useState(user ? user.ten_hien_thi : '');
  const [gioiTinh, setGioiTinh] = useState<GioiTinh | null>(null);
  const [ngaySinh, setNgaySinh] = useState<string | null>(null);
  const [chieuCao, setChieuCao] = useState('');
  // Chiều cao kiểu Anh-Mỹ gõ ở 2 ô ft và in
  const [chieuCaoFeet, setChieuCaoFeet] = useState('');
  const [chieuCaoInch, setChieuCaoInch] = useState('');
  const [canNang, setCanNang] = useState('');
  const [mucVanDong, setMucVanDong] = useState<MucVanDong | null>(null);
  const [mucTieu, setMucTieu] = useState<MucTieu>('giu');
  const [maNhomDiUng, setMaNhomDiUng] = useState<string[]>([]);
  const [diUngKiengAn, setDiUngKiengAn] = useState('');

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
        setNgaySinh(hoSo.ngay_sinh);
        setChieuCao(String(hoSo.chieu_cao_cm));
        setCanNang(String(hoSo.can_nang_kg));
        setMucVanDong(hoSo.muc_van_dong);
        setMucTieu(hoSo.muc_tieu ?? 'giu');
        setMaNhomDiUng(hoSo.nhom_di_ung_da_chon.map((nhom) => nhom.ma));
        setDiUngKiengAn(hoSo.di_ung_kieng_an);
      }
    } catch (loi) {
      setLoiTai((loi as Error).message);
    }
  }

  // Điền sẵn 2 ô ft, in khi đã có số cm và 4 số đổi (số đổi có thể tải xong sau khi mở màn); ô đã có chữ thì không đè
  useEffect(() => {
    const chieuCaoCm = Number(chieuCao.replace(',', '.'));
    if (heSo !== null && chieuCaoCm > 0 && chieuCaoFeet === '' && chieuCaoInch === '') {
      const feetInch = doiCmRaFeetInch(chieuCaoCm, heSo);
      setChieuCaoFeet(String(feetInch.feet));
      setChieuCaoInch(String(feetInch.inch));
    }
  }, [heSo, chieuCao]);

  // Đổi đơn vị trong form lần đầu thì đổi luôn số đang gõ ở ô cân nặng và chiều cao sang đơn vị mới
  function doiDonViLanDau(donViMoi: DonVi) {
    if (donViMoi !== donViLanDau && heSo !== null) {
      const canNangKg = docCanNang(canNang, donViLanDau, heSo);
      if (canNangKg !== null) {
        setCanNang(String(doiKgRaDonVi(canNangKg, donViMoi, heSo)));
      }
      const chieuCaoCm = Number(chieuCao.replace(',', '.'));
      if (donViMoi === 'anh_my' && chieuCaoCm > 0) {
        const feetInch = doiCmRaFeetInch(chieuCaoCm, heSo);
        setChieuCaoFeet(String(feetInch.feet));
        setChieuCaoInch(String(feetInch.inch));
      }
      const chieuCaoTuFeetInch = docChieuCaoFeetInch(chieuCaoFeet, chieuCaoInch, heSo);
      if (donViMoi === 'met' && chieuCaoTuFeetInch !== null) {
        setChieuCao(String(chieuCaoTuFeetInch));
      }
    }
    setDonViLanDau(donViMoi);
  }

  // Bấm một nhóm dị ứng: chưa chọn thì thêm, đã chọn thì bỏ
  function doiNhomDiUng(ma: string) {
    if (maNhomDiUng.includes(ma)) {
      setMaNhomDiUng(maNhomDiUng.filter((maDaChon) => maDaChon !== ma));
    } else {
      setMaNhomDiUng([...maNhomDiUng, ma]);
    }
  }

  // Đổi số người dùng gõ ra cm, kg (database lưu cm, kg); màn không có ô chiều cao, cân nặng thì giữ số đã lưu
  let chieuCaoSo = Number(chieuCao.replace(',', '.'));
  if (laAnhMy && heSo !== null && hienCaNhan) {
    chieuCaoSo = docChieuCaoFeetInch(chieuCaoFeet, chieuCaoInch, heSo) ?? 0;
  }
  let canNangSo = Number(canNang.replace(',', '.'));
  if (laLanDau) {
    canNangSo = docCanNang(canNang, donViDangDung, heSo) ?? 0;
  }

  // BMI tính ngay khi đã nhập đủ chiều cao và cân nặng, làm tròn 1 số lẻ giống server, để làm mờ mục tiêu không phù hợp
  let bmi: number | null = null;
  if (chieuCaoSo > 0 && canNangSo > 0) {
    bmi = Math.round((canNangSo / ((chieuCaoSo / 100) * (chieuCaoSo / 100))) * 10) / 10;
  }

  // Tuổi tính ngay khi đã chọn năm sinh; người cao tuổi có ngưỡng BMI giảm cân riêng và không có mức vận động nặng
  let tuoi: number | null = null;
  if (ngaySinh !== null) {
    tuoi = ageOnDate(ngaySinh, todayKey());
  }
  let nguongGiamCan = 0;
  if (luaChon !== null) {
    nguongGiamCan = luaChon.bmi_thieu_can;
    if (tuoi !== null && tuoi >= luaChon.tuoi_cao_tuoi) {
      nguongGiamCan = luaChon.bmi_thieu_can_cao_tuoi;
    }
  }

  // Lựa chọn nào không hợp với BMI hoặc tuổi thì làm mờ
  let choPhepGiam = true;
  let choPhepTang = true;
  if (bmi !== null && luaChon !== null) {
    choPhepGiam = bmi >= nguongGiamCan;
    choPhepTang = bmi < luaChon.bmi_ly_tuong;
  }
  let choPhepNang = true;
  if (luaChon !== null && tuoi !== null) {
    choPhepNang = tuoi < luaChon.tuoi_khong_co_muc_nang;
  }

  // Mục tiêu đang chọn bị làm mờ (vì vừa sửa chiều cao, cân nặng hoặc năm sinh) thì quay về "Giữ cân"
  useEffect(() => {
    if ((mucTieu === 'giam' && !choPhepGiam) || (mucTieu === 'tang' && !choPhepTang)) {
      setMucTieu('giu');
    }
  }, [choPhepGiam, choPhepTang]);

  // Mức "Nặng" bị làm mờ (vì vừa sửa năm sinh) thì quay về "Trung bình"
  useEffect(() => {
    if (mucVanDong === 'nang' && !choPhepNang) {
      setMucVanDong('trung_binh');
    }
  }, [choPhepNang]);

  // Kiểm các ô, đúng thì gửi lên server
  async function handleLuu() {
    // Bước 1. Kiểm từng ô, gom lỗi theo tên ô
    const loiMoi: Record<string, string> = {};
    if (hienOTen && tenHienThi.trim() === '') {
      loiMoi.ten = 'Hãy nhập tên hiển thị';
    }
    if (gioiTinh === null) {
      loiMoi.gioiTinh = 'Hãy chọn giới tính';
    }
    if (ngaySinh === null) {
      loiMoi.ngaySinh = 'Hãy chọn ngày sinh';
    }
    if (!(chieuCaoSo >= CHIEU_CAO_NHO_NHAT && chieuCaoSo <= CHIEU_CAO_LON_NHAT)) {
      loiMoi.chieuCao = `Chiều cao ${vietGioiHan(CHIEU_CAO_NHO_NHAT, CHIEU_CAO_LON_NHAT, 'chieu_cao', donViDangDung, heSo)}`;
    }
    // Ô inch gõ sai (không phải số nguyên từ 0 tới số inch của 1 ft trừ 1) thì báo riêng cho dễ hiểu
    if (laAnhMy && heSo !== null && chieuCaoInch.trim() !== '') {
      const inchSo = Number(chieuCaoInch.replace(',', '.'));
      if (!(Number.isInteger(inchSo) && inchSo >= 0 && inchSo < heSo.inchMoiFoot)) {
        loiMoi.chieuCao = `Inch từ 0 đến ${heSo.inchMoiFoot - 1}`;
      }
    }
    if (!(canNangSo >= CAN_NANG_NHO_NHAT && canNangSo <= CAN_NANG_LON_NHAT)) {
      loiMoi.canNang = `Cân nặng ${vietGioiHan(CAN_NANG_NHO_NHAT, CAN_NANG_LON_NHAT, 'can_nang', donViDangDung, heSo)}`;
    }
    if (mucVanDong === null) {
      loiMoi.mucVanDong = 'Hãy chọn mức vận động';
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0 || gioiTinh === null || ngaySinh === null || mucVanDong === null) {
      return;
    }

    // Bước 2. Gửi lên server: lưu đủ hồ sơ trước, tên có đổi thì đổi sau (tên thuộc tài khoản)
    setLoiServer('');
    setDangLuu(true);
    try {
      // Lần đầu chọn đơn vị khác với đơn vị đang lưu thì lưu đơn vị trước
      if (laLanDau && donViLanDau !== donVi) {
        await doiDonVi(donViLanDau);
      }
      await luuHoSo({
        gioi_tinh: gioiTinh,
        ngay_sinh: ngaySinh,
        chieu_cao_cm: chieuCaoSo,
        can_nang_kg: canNangSo,
        muc_van_dong: mucVanDong,
        muc_tieu: mucTieu,
        ma_nhom_di_ung: maNhomDiUng,
        di_ung_kieng_an: diUngKiengAn.trim(),
      });
      if (hienOTen && user && tenHienThi.trim() !== user.ten_hien_thi) {
        await changeDisplayName(tenHienThi.trim());
      }
      await refreshUser();
      // Bước 3. Lần đầu thì vào trang chủ, sửa thì quay lại màn trước
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
      <Screen>
        {loiTai ? <ErrorBox message={loiTai} onRetry={taiDuLieu} /> : <ActivityIndicator color={colors.primary} />}
      </Screen>
    );
  }

  // Tiêu đề: lần đầu là "Thiết lập hồ sơ", còn lại theo phần đang sửa
  let tieuDe = 'Thiết lập hồ sơ';
  if (!laLanDau && thamSo.phan) {
    tieuDe = TIEU_DE_THEO_PHAN[thamSo.phan];
  }

  return (
    <View style={styles.khung}>
      <Screen compactBottom>
        {/* Lần đầu thiết lập thì chưa có màn nào để quay lại */}
        <ScreenTitle
          title={tieuDe}
          subtitle={hienDiUng && !laLanDau ? undefined : 'Dùng để tính mục tiêu calo mỗi ngày của bạn'}
          onBack={laLanDau ? undefined : () => router.back()}
        />

        {loiServer ? <ErrorBox message={loiServer} /> : null}

        {/* Lần đầu: chọn đơn vị trước khi gõ chiều cao, cân nặng */}
        {laLanDau ? (
          <Card>
            <TieuDeThe bieuTuong={<Ionicons name="options-outline" size={18} color={colors.primary} />} tieuDe="Đơn vị" />
            <View style={styles.hangHaiNut}>
              <NutDonVi ten="Mét" chiTiet="kg, cm, g" laDangChon={donViLanDau === 'met'} biKhoa={dangLuu} onPress={() => doiDonViLanDau('met')} />
              <NutDonVi ten="Anh-Mỹ" chiTiet="lb, ft-in, oz" laDangChon={donViLanDau === 'anh_my'} biKhoa={dangLuu || heSo === null} onPress={() => doiDonViLanDau('anh_my')} />
            </View>
          </Card>
        ) : null}

        {/* Thông tin cá nhân: tên (chỉ khi sửa), giới tính, năm sinh, chiều cao; lần đầu có thêm cân nặng */}
        {hienCaNhan ? (
          <Card>
            <TieuDeThe bieuTuong={<Ionicons name="person-outline" size={18} color={colors.primary} />} tieuDe="Thông tin cá nhân" />
            {hienOTen ? (
              <TextField label="Tên hiển thị" value={tenHienThi} onChangeText={setTenHienThi} error={loiNhap.ten ?? ''} isDisabled={dangLuu} />
            ) : null}
            <Text style={styles.nhanO}>Giới tính</Text>
            <View style={styles.hangHaiNut}>
              <NutGioiTinh ten="Nam" bieuTuong="male" laDangChon={gioiTinh === 'nam'} biKhoa={dangLuu} onPress={() => setGioiTinh('nam')} />
              <NutGioiTinh ten="Nữ" bieuTuong="female" laDangChon={gioiTinh === 'nu'} biKhoa={dangLuu} onPress={() => setGioiTinh('nu')} />
            </View>
            {loiNhap.gioiTinh ? <Text style={styles.chuLoi}>{loiNhap.gioiTinh}</Text> : null}
            <ChonNgaySinh ngaySinh={ngaySinh} onChon={setNgaySinh} loi={loiNhap.ngaySinh ?? ''} isDisabled={dangLuu} />
            {laAnhMy ? (
              <View>
                <View style={styles.hangHaiO}>
                  <View style={styles.oNuaHang}>
                    <TextField label="Chiều cao (ft)" value={chieuCaoFeet} onChangeText={setChieuCaoFeet} error="" placeholder="5" isNumber isDisabled={dangLuu} />
                  </View>
                  <View style={styles.oNuaHang}>
                    <TextField label="(in)" value={chieuCaoInch} onChangeText={setChieuCaoInch} error="" placeholder="5" isNumber isDisabled={dangLuu} />
                  </View>
                </View>
                {loiNhap.chieuCao ? <Text style={styles.chuLoi}>{loiNhap.chieuCao}</Text> : null}
              </View>
            ) : (
              <TextField label="Chiều cao (cm)" value={chieuCao} onChangeText={setChieuCao} error={loiNhap.chieuCao ?? ''} placeholder="165" isNumber isDisabled={dangLuu} />
            )}
            {hienOCanNang ? (
              <TextField
                label={laAnhMy ? 'Cân nặng (lb)' : 'Cân nặng (kg)'}
                value={canNang}
                onChangeText={setCanNang}
                error={loiNhap.canNang ?? ''}
                placeholder={laAnhMy ? '121' : '55'}
                isNumber
                isDisabled={dangLuu}
              />
            ) : null}
          </Card>
        ) : null}

        {/* Vận động: ba mức có mô tả; từ tuổi không còn mức nặng thì "Nặng" bị làm mờ kèm một dòng lý do */}
        {hienMucTieu ? (
          <Card>
            <TieuDeThe bieuTuong={<Ionicons name="walk-outline" size={18} color={colors.primary} />} tieuDe="Một ngày bình thường của bạn" />
            {LUA_CHON_MUC_VAN_DONG.map((luaChonMuc) => (
              <LuaChonCoMoTa
                key={luaChonMuc.giaTri}
                ten={luaChonMuc.ten}
                moTa={luaChonMuc.moTa}
                laDangChon={mucVanDong === luaChonMuc.giaTri}
                biKhoa={(luaChonMuc.giaTri === 'nang' && !choPhepNang) || dangLuu}
                onPress={() => setMucVanDong(luaChonMuc.giaTri)}
              />
            ))}
            {!choPhepNang ? <Text style={styles.chuPhu}>Từ {luaChon.tuoi_khong_co_muc_nang} tuổi chỉ chọn Nhẹ hoặc Trung bình</Text> : null}
            {loiNhap.mucVanDong ? <Text style={styles.chuLoi}>{loiNhap.mucVanDong}</Text> : null}
          </Card>
        ) : null}

        {/* Mục tiêu: ba ô liền nhau, ô không hợp với BMI thì làm mờ; dưới là mỗi mục tiêu dành cho ai */}
        {hienMucTieu ? (
          <Card>
            <TieuDeThe bieuTuong={<MaterialCommunityIcons name="target" size={18} color={colors.primary} />} tieuDe="Mục tiêu" />
            <View style={styles.hangBaNut}>
              <NutMucTieu ten="Giảm cân" laDangChon={mucTieu === 'giam'} biKhoa={!choPhepGiam || dangLuu} onPress={() => setMucTieu('giam')} />
              <NutMucTieu ten="Giữ cân" laDangChon={mucTieu === 'giu'} biKhoa={dangLuu} onPress={() => setMucTieu('giu')} />
              <NutMucTieu ten="Tăng cân" laDangChon={mucTieu === 'tang'} biKhoa={!choPhepTang || dangLuu} onPress={() => setMucTieu('tang')} />
            </View>
            <Text style={styles.chuPhu}>• Giảm cân: dành cho BMI từ {nguongGiamCan.toLocaleString('vi-VN')} trở lên</Text>
            <Text style={styles.chuPhu}>• Giữ cân: dành cho mọi người</Text>
            <Text style={styles.chuPhu}>• Tăng cân: dành cho BMI dưới {luaChon.bmi_ly_tuong.toLocaleString('vi-VN')}</Text>
          </Card>
        ) : null}

        {/* Dị ứng: chọn nhiều nhóm, không bắt buộc; app kiểm thành phần món theo các nhóm này */}
        {hienDiUng ? (
          <Card>
            <TieuDeThe bieuTuong={<Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />} tieuDe="Dị ứng" />
            <Text style={styles.chuPhuDauThe}>Không bắt buộc. App kiểm thành phần món theo những nhóm bạn chọn.</Text>
            <View style={styles.hangNhom}>
              {luaChon.danh_sach_nhom_di_ung.map((nhom) => (
                <NutNhomDiUng
                  key={nhom.ma}
                  ten={nhom.ten}
                  laDangChon={maNhomDiUng.includes(nhom.ma)}
                  biKhoa={dangLuu}
                  onPress={() => doiNhomDiUng(nhom.ma)}
                />
              ))}
            </View>
          </Card>
        ) : null}

        {/* Kiêng ăn khác: không bắt buộc, chỉ AI đọc */}
        {hienDiUng ? (
          <Card>
            <TieuDeThe bieuTuong={<MaterialCommunityIcons name="food-off-outline" size={18} color={colors.primary} />} tieuDe="Kiêng ăn khác" />
            <Text style={styles.chuPhuDauThe}>Không bắt buộc. Chỉ AI đọc khi gợi ý món, app không tự kiểm.</Text>
            <TextField
              label=""
              value={diUngKiengAn}
              onChangeText={setDiUngKiengAn}
              error=""
              placeholder="Ví dụ: thịt bò, ăn chay, đậu nành"
              maxLength={DI_UNG_KIENG_AN_DAI_NHAT}
              isDisabled={dangLuu}
            />
          </Card>
        ) : null}
      </Screen>

      {/* Nút lưu ghim ở đáy màn */}
      <View style={[styles.thanhDuoi, { paddingBottom: insets.bottom + spacing.small }]}>
        <Button title={laLanDau ? 'Lưu hồ sơ' : 'Lưu'} loadingTitle="Đang lưu…" isLoading={dangLuu} onPress={handleLuu} />
      </View>
    </View>
  );
}

// Tiêu đề trong thẻ: biểu tượng nhỏ màu xanh và chữ đậm
function TieuDeThe({ bieuTuong, tieuDe }: { bieuTuong: ReactNode; tieuDe: string }) {
  return (
    <View style={styles.hangTieuDe}>
      {bieuTuong}
      <Text style={styles.tieuDeThe}>{tieuDe}</Text>
    </View>
  );
}

type NutChonProps = {
  ten: string;
  laDangChon: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Nút giới tính to, có biểu tượng nam / nữ; đang chọn thì nền xanh nhạt, chữ xanh
function NutGioiTinh({ ten, bieuTuong, laDangChon, biKhoa, onPress }: NutChonProps & { bieuTuong: ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nutGioiTinh, laDangChon ? styles.nutDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Ionicons name={bieuTuong} size={16} color={laDangChon ? colors.primary : colors.textSecondary} />
      <Text style={[styles.chuNut, laDangChon ? styles.chuNutDangChon : null]}>{ten}</Text>
    </Pressable>
  );
}

// Một ô chọn đơn vị: tên đậm, dòng nhỏ các đơn vị
function NutDonVi({ ten, chiTiet, laDangChon, biKhoa, onPress }: NutChonProps & { chiTiet: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nutDonVi, laDangChon ? styles.nutDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Text style={[styles.chuNut, laDangChon ? styles.chuNutDangChon : null]}>{ten}</Text>
      <Text style={styles.chuPhuNho}>{chiTiet}</Text>
    </Pressable>
  );
}

// Một mức vận động: vòng tròn chọn, tên đậm, mô tả bên dưới
function LuaChonCoMoTa({ ten, moTa, laDangChon, biKhoa, onPress }: NutChonProps & { moTa: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.luaChonCoMoTa, laDangChon ? styles.nutDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Ionicons name={laDangChon ? 'radio-button-on' : 'radio-button-off'} size={20} color={laDangChon ? colors.primary : colors.textSecondary} />
      <View style={styles.cotChu}>
        <Text style={[styles.chuNut, laDangChon ? styles.chuNutDangChon : null]}>{ten}</Text>
        <Text style={styles.chuPhu}>{moTa}</Text>
      </View>
    </Pressable>
  );
}

// Một ô trong hàng ba ô mục tiêu
function NutMucTieu({ ten, laDangChon, biKhoa, onPress }: NutChonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nutMucTieu, laDangChon ? styles.nutDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Text style={[styles.chuNut, laDangChon ? styles.chuNutDangChon : null]}>{ten}</Text>
    </Pressable>
  );
}

// Một nhóm dị ứng: đang chọn thì nền xanh nhạt, chữ xanh, có dấu ✓
function NutNhomDiUng({ ten, laDangChon, biKhoa, onPress }: NutChonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nutNhom, laDangChon ? styles.nutDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      {laDangChon ? <Ionicons name="checkmark" size={14} color={colors.primary} /> : null}
      <Text style={[styles.chuNhom, laDangChon ? styles.chuNutDangChon : null]}>{ten}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  tieuDeThe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nhanO: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  hangHaiNut: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  nutGioiTinh: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  nutDonVi: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chuPhuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  hangHaiO: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oNuaHang: {
    flex: 1,
  },
  nutDangChon: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chuNut: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuNutDangChon: {
    color: colors.primary,
  },
  luaChonCoMoTa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.medium,
    padding: spacing.medium,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: spacing.small,
  },
  cotChu: {
    flex: 1,
  },
  hangBaNut: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  nutMucTieu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  hangNhom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  nutNhom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chuNhom: {
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chuPhuDauThe: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: -spacing.small,
    marginBottom: spacing.medium,
  },
  thanhDuoi: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  mo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
