import { layHeSoVanDong, layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layHoSo, luuHoSo } from './HoSoQueries.ts';
import type { HoSo, HoSoDeLuu } from './HoSoQueries.ts';
import { phanLoaiBmi, tinhBmi } from './TinhBmi.ts';
import { tinhMucTieuCalo } from './TinhMucTieuCalo.ts';

// Tuổi nhỏ nhất được dùng app
const TUOI_TOI_THIEU = 18;

// Giới hạn chiều cao, cân nặng để chặn gõ nhầm (giống CHECK trong 004_ho_so.sql)
const CHIEU_CAO_NHO_NHAT = 100;
const CHIEU_CAO_LON_NHAT = 250;
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

// Ô dị ứng hoặc kiêng ăn tối đa bao nhiêu ký tự (giống CHECK trong 009_di_ung_kieng_an.sql)
const DI_UNG_KIENG_AN_DAI_NHAT = 200;

// Hồ sơ gửi về app: các cột đã lưu, kèm BMI
type HoSoHienThi = HoSo & {
  bmi: number | null;
  phan_loai_bmi: string | null;
};

// Những con số màn hồ sơ cần để làm mờ lựa chọn: ngưỡng BMI và ngưỡng tuổi
type LuaChonHoSo = {
  bmi_thieu_can: number;
  bmi_ly_tuong: number;
  tuoi_cao_tuoi: number;
  bmi_thieu_can_cao_tuoi: number;
  tuoi_khong_co_muc_nang: number;
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
    tuoi_cao_tuoi: await layQuyDinh('tuoi_cao_tuoi'),
    bmi_thieu_can_cao_tuoi: await layQuyDinh('bmi_thieu_can_cao_tuoi'),
    tuoi_khong_co_muc_nang: await layQuyDinh('tuoi_khong_co_muc_nang'),
  };
}

// BMI thấp nhất được chọn giảm cân: người cao tuổi có ngưỡng riêng, cao hơn
async function layNguongGiamCan(tuoi: number): Promise<number> {
  if (tuoi >= (await layQuyDinh('tuoi_cao_tuoi'))) {
    return layQuyDinh('bmi_thieu_can_cao_tuoi');
  }
  return layQuyDinh('bmi_thieu_can');
}

// Kiểm tra dữ liệu app gửi lên, tính mục tiêu calo, rồi lưu
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
  if (typeof chieuCaoCm !== 'number' || chieuCaoCm < CHIEU_CAO_NHO_NHAT || chieuCaoCm > CHIEU_CAO_LON_NHAT) {
    throw new HttpError(400, `Chiều cao từ ${CHIEU_CAO_NHO_NHAT} đến ${CHIEU_CAO_LON_NHAT} cm`);
  }

  const canNangKg = duLieu.can_nang_kg;
  if (typeof canNangKg !== 'number' || canNangKg < CAN_NANG_NHO_NHAT || canNangKg > CAN_NANG_LON_NHAT) {
    throw new HttpError(400, `Cân nặng từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`);
  }

  const mucVanDong = duLieu.muc_van_dong;
  if (mucVanDong !== 'nhe' && mucVanDong !== 'trung_binh' && mucVanDong !== 'nang') {
    throw new HttpError(400, 'Mức vận động không hợp lệ');
  }

  const mucTieu = duLieu.muc_tieu;
  if (mucTieu !== 'giam' && mucTieu !== 'giu' && mucTieu !== 'tang') {
    throw new HttpError(400, 'Mục tiêu không hợp lệ');
  }

  // Dị ứng hoặc kiêng ăn không bắt buộc: không gửi là để trống
  let diUngKiengAn = '';
  if (duLieu.di_ung_kieng_an !== undefined && duLieu.di_ung_kieng_an !== null) {
    if (typeof duLieu.di_ung_kieng_an !== 'string' || duLieu.di_ung_kieng_an.trim().length > DI_UNG_KIENG_AN_DAI_NHAT) {
      throw new HttpError(400, `Dị ứng hoặc kiêng ăn tối đa ${DI_UNG_KIENG_AN_DAI_NHAT} ký tự`);
    }
    diUngKiengAn = duLieu.di_ung_kieng_an.trim();
  }

  // Bước 2. Rào an toàn theo BMI và tuổi, giống lựa chọn bị làm mờ ở app
  const bmi = tinhBmi(canNangKg, chieuCaoCm);
  const nguongGiamCan = await layNguongGiamCan(tuoi);
  const bmiLyTuong = await layQuyDinh('bmi_ly_tuong');
  if (mucTieu === 'giam' && bmi < nguongGiamCan) {
    throw new HttpError(400, `Giảm cân chỉ dành cho BMI từ ${nguongGiamCan.toLocaleString('vi-VN')} trở lên`);
  }
  if (mucTieu === 'tang' && bmi >= bmiLyTuong) {
    throw new HttpError(400, `Tăng cân chỉ dành cho BMI dưới ${bmiLyTuong.toLocaleString('vi-VN')}`);
  }
  const tuoiKhongCoMucNang = await layQuyDinh('tuoi_khong_co_muc_nang');
  if (mucVanDong === 'nang' && tuoi >= tuoiKhongCoMucNang) {
    throw new HttpError(400, `Từ ${tuoiKhongCoMucNang} tuổi chỉ chọn mức vận động nhẹ hoặc trung bình`);
  }

  // Bước 3. Tính mục tiêu calo bằng các con số đúng giới, tuổi, mức vận động (ThuatToan.md bước 6-10)
  const mucTieuCalo = tinhMucTieuCalo(
    { tuoi: tuoi, chieuCaoCm: chieuCaoCm, canNangKg: canNangKg, mucTieu: mucTieu },
    {
      ganpuleHeSoCan: await layQuyDinh('ganpule_he_so_can'),
      ganpuleHeSoChieuCao: await layQuyDinh('ganpule_he_so_chieu_cao'),
      ganpuleHeSoTuoi: await layQuyDinh('ganpule_he_so_tuoi'),
      ganpuleHangSo: await layQuyDinh(`ganpule_hang_so_${gioiTinh}`),
      kjMoiKcal: await layQuyDinh('kj_moi_kcal'),
      heSoVanDong: await layHeSoVanDong(mucVanDong, tuoi),
      bmiLyTuong: bmiLyTuong,
      giamCanKcalMoiKg: await layQuyDinh(`giam_can_kcal_moi_kg_${mucVanDong}`),
      giamCanKcalCatToiDa: await layQuyDinh('giam_can_kcal_cat_toi_da'),
    },
  );

  // Bước 4. Lưu rồi trả về hồ sơ mới
  const hoSoDeLuu: HoSoDeLuu = {
    gioi_tinh: gioiTinh,
    nam_sinh: namSinh,
    chieu_cao_cm: chieuCaoCm,
    can_nang_kg: canNangKg,
    muc_van_dong: mucVanDong,
    muc_tieu: mucTieu,
    muc_tieu_calo: mucTieuCalo,
    di_ung_kieng_an: diUngKiengAn,
  };
  await luuHoSo(nguoiDungId, hoSoDeLuu);
  return xemHoSo(nguoiDungId);
}

// Ghi cân mới thì cập nhật cân nặng trong hồ sơ và tính lại mục tiêu calo; lựa chọn nào không còn hợp thì về lựa chọn gần nhất
export async function capNhatCanNangHoSo(nguoiDungId: number, canNangKg: number): Promise<void> {
  const hoSo = await layHoSo(nguoiDungId);

  // Chưa thiết lập hồ sơ thì chưa có gì để tính lại
  if (
    hoSo.gioi_tinh === null || hoSo.nam_sinh === null || hoSo.chieu_cao_cm === null ||
    hoSo.muc_van_dong === null || hoSo.muc_tieu === null
  ) {
    return;
  }
  const tuoi = new Date().getFullYear() - hoSo.nam_sinh;

  // Giống lựa chọn bị làm mờ ở màn hồ sơ: cân mới làm mục tiêu không còn hợp thì về giữ cân
  const bmi = tinhBmi(canNangKg, hoSo.chieu_cao_cm);
  let mucTieu = hoSo.muc_tieu;
  if (mucTieu === 'giam' && bmi < (await layNguongGiamCan(tuoi))) {
    mucTieu = 'giu';
  }
  if (mucTieu === 'tang' && bmi >= (await layQuyDinh('bmi_ly_tuong'))) {
    mucTieu = 'giu';
  }

  // Đã tới tuổi không còn mức vận động nặng thì về trung bình
  let mucVanDong = hoSo.muc_van_dong;
  if (mucVanDong === 'nang' && tuoi >= (await layQuyDinh('tuoi_khong_co_muc_nang'))) {
    mucVanDong = 'trung_binh';
  }

  // Lưu lại bằng đúng đường lưu hồ sơ, nên mục tiêu calo được tính lại theo cân mới
  await capNhatHoSo(nguoiDungId, {
    gioi_tinh: hoSo.gioi_tinh,
    nam_sinh: hoSo.nam_sinh,
    chieu_cao_cm: hoSo.chieu_cao_cm,
    can_nang_kg: canNangKg,
    muc_van_dong: mucVanDong,
    muc_tieu: mucTieu,
    di_ung_kieng_an: hoSo.di_ung_kieng_an,
  });
}
