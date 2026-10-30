import { callApi } from '../shared/apiClient';

export type GioiTinh = 'nam' | 'nu';
export type MucVanDong = 'nhe' | 'trung_binh' | 'nang';
export type MucTieu = 'giam' | 'giu' | 'tang';

// Hồ sơ server gửi về; chưa thiết lập thì các trường là null
export type HoSo = {
  gioi_tinh: GioiTinh | null;
  // Ngày sinh dạng năm-tháng-ngày, ví dụ '2004-11-24'
  ngay_sinh: string | null;
  chieu_cao_cm: number | null;
  can_nang_kg: number | null;
  muc_van_dong: MucVanDong | null;
  muc_tieu: MucTieu | null;
  muc_tieu_calo: number | null;
  di_ung_kieng_an: string;
  nhom_di_ung_da_chon: NhomDiUng[];
  bmi: number | null;
  phan_loai_bmi: string | null;
  // BMR (chuyển hóa cơ bản) và TDEE (năng lượng để giữ cân), kcal mỗi ngày
  chuyen_hoa_co_ban: number | null;
  nang_luong_giu_can: number | null;
};

// Một nhóm dị ứng chọn được ở hồ sơ
export type NhomDiUng = {
  ma: string;
  ten: string;
};

// Dữ liệu gửi lên khi lưu hồ sơ
export type HoSoGuiLen = {
  gioi_tinh: GioiTinh;
  ngay_sinh: string;
  chieu_cao_cm: number;
  can_nang_kg: number;
  muc_van_dong: MucVanDong;
  muc_tieu: MucTieu;
  ma_nhom_di_ung: string[];
  di_ung_kieng_an: string;
};

// Những thứ màn hồ sơ cần: ngưỡng BMI và ngưỡng tuổi để làm mờ lựa chọn, 9 nhóm dị ứng để chọn
export type LuaChonHoSo = {
  bmi_thieu_can: number;
  bmi_ly_tuong: number;
  tuoi_cao_tuoi: number;
  bmi_thieu_can_cao_tuoi: number;
  tuoi_khong_co_muc_nang: number;
  danh_sach_nhom_di_ung: NhomDiUng[];
};

// Lấy hồ sơ của người đang đăng nhập
export async function layHoSo(): Promise<HoSo> {
  const ketQua = await callApi('GET', '/ho-so');
  return ketQua as HoSo;
}

// Lấy ngưỡng BMI, ngưỡng tuổi và 9 nhóm dị ứng
export async function layLuaChonHoSo(): Promise<LuaChonHoSo> {
  const ketQua = await callApi('GET', '/ho-so/lua-chon');
  return ketQua as LuaChonHoSo;
}

// Lưu hồ sơ, server tính mục tiêu calo rồi gửi hồ sơ mới về
export async function luuHoSo(hoSo: HoSoGuiLen): Promise<HoSo> {
  const ketQua = await callApi('PUT', '/ho-so', hoSo);
  return ketQua as HoSo;
}
