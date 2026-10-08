import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { ChonNamSinh } from '../../src/ho-so/sua/ChonNamSinh';
import { layHoSo, layLuaChonHoSo, luuHoSo } from '../../src/ho-so/HoSoApi';
import type { GioiTinh, LuaChonHoSo, MucTieu, MucVanDong } from '../../src/ho-so/HoSoApi';
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

// Ô dị ứng hoặc kiêng ăn tối đa bao nhiêu ký tự (giống backend)
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
  const [mucVanDong, setMucVanDong] = useState<MucVanDong | null>(null);
  const [mucTieu, setMucTieu] = useState<MucTieu>('giu');
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
        setNamSinh(hoSo.nam_sinh);
        setChieuCao(String(hoSo.chieu_cao_cm));
        setCanNang(String(hoSo.can_nang_kg));
        setMucVanDong(hoSo.muc_van_dong);
        setMucTieu(hoSo.muc_tieu ?? 'giu');
        setDiUngKiengAn(hoSo.di_ung_kieng_an);
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

  // Tuổi tính ngay khi đã chọn năm sinh; người cao tuổi có ngưỡng BMI giảm cân riêng và không có mức vận động nặng
  let tuoi: number | null = null;
  if (namSinh !== null) {
    tuoi = new Date().getFullYear() - namSinh;
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

  // Mục tiêu đang chọn bị làm mờ (vì vừa sửa cân nặng hoặc năm sinh) thì quay về "Giữ cân"
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
    if (mucVanDong === null) {
      loiMoi.mucVanDong = 'Hãy chọn mức vận động';
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0 || gioiTinh === null || namSinh === null || mucVanDong === null) {
      return;
    }

    // Bước 2. Gửi lên server
    setLoiServer('');
    setDangLuu(true);
    try {
      await luuHoSo({
        gioi_tinh: gioiTinh,
        nam_sinh: namSinh,
        chieu_cao_cm: chieuCaoSo,
        can_nang_kg: canNangSo,
        muc_van_dong: mucVanDong,
        muc_tieu: mucTieu,
        di_ung_kieng_an: diUngKiengAn.trim(),
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

        {/* Vận động: một câu, ba mức; từ tuổi không còn mức nặng thì "Nặng" bị làm mờ kèm một dòng lý do */}
        <Text style={styles.nhanNhom}>Một ngày bình thường của bạn</Text>
        {LUA_CHON_MUC_VAN_DONG.map((luaChonMuc) => (
          <View key={luaChonMuc.giaTri} style={styles.dongMucVanDong}>
            <Chip
              label={luaChonMuc.ten}
              isSelected={mucVanDong === luaChonMuc.giaTri}
              isDisabled={luaChonMuc.giaTri === 'nang' && !choPhepNang}
              onPress={() => setMucVanDong(luaChonMuc.giaTri)}
            />
            <Text style={styles.chuPhu}>{luaChonMuc.moTa}</Text>
          </View>
        ))}
        {!choPhepNang ? (
          <Text style={styles.chuPhu}>Từ {luaChon.tuoi_khong_co_muc_nang} tuổi chỉ chọn Nhẹ hoặc Trung bình</Text>
        ) : null}
        {loiNhap.mucVanDong ? <Text style={styles.chuLoi}>{loiNhap.mucVanDong}</Text> : null}

        {/* Mục tiêu: lựa chọn không hợp với BMI thì làm mờ kèm một dòng lý do */}
        <Text style={styles.nhanNhom}>Mục tiêu</Text>
        <View style={styles.hangChip}>
          <Chip label="Giảm cân" isSelected={mucTieu === 'giam'} isDisabled={!choPhepGiam} onPress={() => setMucTieu('giam')} />
          <Chip label="Giữ cân" isSelected={mucTieu === 'giu'} onPress={() => setMucTieu('giu')} />
          <Chip label="Tăng cân" isSelected={mucTieu === 'tang'} isDisabled={!choPhepTang} onPress={() => setMucTieu('tang')} />
        </View>
        {!choPhepGiam ? (
          <Text style={styles.chuPhu}>Giảm cân dành cho BMI từ {nguongGiamCan.toLocaleString('vi-VN')} trở lên</Text>
        ) : null}
        {!choPhepTang ? (
          <Text style={styles.chuPhu}>Tăng cân dành cho BMI dưới {luaChon.bmi_ly_tuong.toLocaleString('vi-VN')}</Text>
        ) : null}

        {/* Dị ứng hoặc kiêng ăn: không bắt buộc, chỉ coach dùng */}
        <View style={styles.khoiDiUng}>
          <TextField
            label="Dị ứng hoặc kiêng ăn (không bắt buộc)"
            value={diUngKiengAn}
            onChangeText={setDiUngKiengAn}
            error=""
            placeholder="Ví dụ: tôm, cua, đậu phộng, ăn chay"
            maxLength={DI_UNG_KIENG_AN_DAI_NHAT}
          />
          <Text style={styles.chuPhuDiUng}>Coach sẽ tránh gợi ý món có những thứ này</Text>
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
  dongMucVanDong: {
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
  khoiDiUng: {
    marginTop: 16,
  },
  chuPhuDiUng: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -6,
  },
});
