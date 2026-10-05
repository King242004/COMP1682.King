import { layHeSoVanDong, layKcalMoiKg, layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layHoSo, luuHoSo } from './HoSoQueries.ts';
import type { HoSo, HoSoDeLuu } from './HoSoQueries.ts';
import { phanLoaiBmi, tinhBmi } from './TinhBmi.ts';
import { tinhMucTieuCalo } from './TinhMucTieuCalo.ts';
import { xacDinhMucVanDong } from './XacDinhMucVanDong.ts';

// Tuổi nhỏ nhất được dùng app
const TUOI_TOI_THIEU = 18;

// Hồ sơ gửi về app: các cột đã lưu, kèm BMI
type HoSoHienThi = HoSo & {
  bmi: number | null;
  phan_loai_bmi: string | null;
};

// Những lựa chọn màn hồ sơ cần: hai ngưỡng BMI để làm mờ lựa chọn mục tiêu
type LuaChonHoSo = {
  bmi_thieu_can: number;
  bmi_ly_tuong: number;
};

// Lấy hồ sơ kèm BMI và phân loại; chưa thiết lập thì BMI là null
export async function xemHoSo(nguoiDungId: number): Promise<HoSoHienThi> {
  const hoSo = await layHoSo(nguoiDungId);

  if (hoSo.chieu_cao_cm === null || hoSo.can_nang_kg === null) {
    return { ...hoSo, bmi: null, phan_loai_bmi: null };
  }

  const bmi = tinhBmi(hoSo.can_nang_kg, hoSo.chieu_cao_cm);
  const nguong = {
    thieuCan: await layQuyDinh('bmi_thieu_can'),
    thuaCan: await layQuyDinh('bmi_thua_can'),
    beoPhiDo1: await layQuyDinh('bmi_beo_phi_do_1'),
    beoPhiDo2: await layQuyDinh('bmi_beo_phi_do_2'),
  };
  return { ...hoSo, bmi: bmi, phan_loai_bmi: phanLoaiBmi(bmi, nguong) };
}

// Lấy các lựa chọn cho màn thiết lập / sửa hồ sơ
export async function xemLuaChonHoSo(): Promise<LuaChonHoSo> {
  return {
    bmi_thieu_can: await layQuyDinh('bmi_thieu_can'),
    bmi_ly_tuong: await layQuyDinh('bmi_ly_tuong'),
  };
}

// Kiểm tra dữ liệu app gửi lên, tính mức vận động và mục tiêu calo, rồi lưu
export async function capNhatHoSo(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<HoSoHienThi> {
  // Bước 1. Kiểm tra từng trường
  const gioiTinh = duLieu.gioi_tinh;
  if (gioiTinh !== 'nam' && gioiTinh !== 'nu') {
    throw new HttpError(400, 'Giới tính không hợp lệ');
  }

  const namSinh = duLieu.nam_sinh;
  const namHienTai = new Date().getFullYear();
  if (typeof namSinh !== 'number' || !Number.isInteger(namSinh) || namHienTai - namSinh < TUOI_TOI_THIEU) {
    throw new HttpError(400, 'Năm sinh không hợp lệ');
  }
  const tuoi = namHienTai - namSinh;

  const chieuCaoCm = duLieu.chieu_cao_cm;
  const canNangKg = duLieu.can_nang_kg;
  if (typeof chieuCaoCm !== 'number' || typeof canNangKg !== 'number') {
    throw new HttpError(400, 'Chiều cao và cân nặng phải là số');
  }

  const congViec = duLieu.cong_viec;
  if (congViec !== 'ngoi_nhieu' && congViec !== 'di_lai_nhieu' && congViec !== 'lao_dong_nang') {
    throw new HttpError(400, 'Công việc không hợp lệ');
  }

  const soBuoiTap = duLieu.so_buoi_tap;
  if (typeof soBuoiTap !== 'number' || !Number.isInteger(soBuoiTap) || soBuoiTap < 0 || soBuoiTap > 7) {
    throw new HttpError(400, 'Số buổi tập không hợp lệ');
  }

  // Không tập thì không cần số phút và cảm nhận
  let soPhutMoiBuoi: number | null = null;
  let camNhanKhiTap: 'nhe' | 'vua' | 'nang' | null = null;
  if (soBuoiTap > 0) {
    const soPhut = duLieu.so_phut_moi_buoi;
    if (typeof soPhut !== 'number' || !Number.isInteger(soPhut) || soPhut <= 0) {
      throw new HttpError(400, 'Số phút mỗi buổi không hợp lệ');
    }
    const camNhan = duLieu.cam_nhan_khi_tap;
    if (camNhan !== 'nhe' && camNhan !== 'vua' && camNhan !== 'nang') {
      throw new HttpError(400, 'Cảm nhận khi tập không hợp lệ');
    }
    soPhutMoiBuoi = soPhut;
    camNhanKhiTap = camNhan;
  }

  const mucTieu = duLieu.muc_tieu;
  if (mucTieu !== 'giam' && mucTieu !== 'giu' && mucTieu !== 'tang') {
    throw new HttpError(400, 'Mục tiêu không hợp lệ');
  }

  // Bước 2. Rào an toàn theo BMI, giống lựa chọn bị làm mờ ở app
  const bmi = tinhBmi(canNangKg, chieuCaoCm);
  const bmiThieuCan = await layQuyDinh('bmi_thieu_can');
  const bmiLyTuong = await layQuyDinh('bmi_ly_tuong');
  if (mucTieu === 'giam' && bmi < bmiThieuCan) {
    throw new HttpError(400, `Giảm cân chỉ dành cho BMI từ ${bmiThieuCan.toLocaleString('vi-VN')} trở lên`);
  }
  if (mucTieu === 'tang' && bmi >= bmiLyTuong) {
    throw new HttpError(400, `Tăng cân chỉ dành cho BMI dưới ${bmiLyTuong.toLocaleString('vi-VN')}`);
  }

  // Bước 3. Xác định mức vận động từ bốn câu trả lời
  const mucVanDong = xacDinhMucVanDong(
    { congViec: congViec, soBuoiTap: soBuoiTap, soPhutMoiBuoi: soPhutMoiBuoi, camNhanKhiTap: camNhanKhiTap },
    {
      phutKhuyenNghi: await layQuyDinh('phut_van_dong_khuyen_nghi'),
      heSoPhutMucNang: await layQuyDinh('he_so_phut_muc_nang'),
    },
  );

  // Bước 4. Tính mục tiêu calo bằng các hệ số đúng tuổi, giới, mức vận động
  const mucTieuCalo = tinhMucTieuCalo(
    { canNangKg: canNangKg, chieuCaoCm: chieuCaoCm, mucTieu: mucTieu },
    {
      kcalMoiKg: await layKcalMoiKg(gioiTinh, tuoi),
      heSoVanDong: await layHeSoVanDong(mucVanDong, tuoi),
      bmiLyTuong: bmiLyTuong,
      giamCanKcalMoiKg: await layQuyDinh(`giam_can_kcal_moi_kg_${mucVanDong}`),
    },
  );

  // Bước 5. Lưu rồi trả về hồ sơ mới
  const hoSoDeLuu: HoSoDeLuu = {
    gioi_tinh: gioiTinh,
    nam_sinh: namSinh,
    chieu_cao_cm: chieuCaoCm,
    can_nang_kg: canNangKg,
    cong_viec: congViec,
    so_buoi_tap: soBuoiTap,
    so_phut_moi_buoi: soPhutMoiBuoi,
    cam_nhan_khi_tap: camNhanKhiTap,
    muc_van_dong: mucVanDong,
    muc_tieu: mucTieu,
    muc_tieu_calo: mucTieuCalo,
  };
  await luuHoSo(nguoiDungId, hoSoDeLuu);
  return xemHoSo(nguoiDungId);
}
