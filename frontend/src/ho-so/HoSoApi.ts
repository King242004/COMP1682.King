import { callApi } from '../shared/apiClient';

export type GioiTinh = 'nam' | 'nu';
export type MucVanDong = 'nhe' | 'trung_binh' | 'nang';
export type MucTieu = 'giam' | 'giu' | 'tang';

// Hồ sơ server gửi về; chưa thiết lập thì các trường là null
export type HoSo = {
  gioi_tinh: GioiTinh | null;
  nam_sinh: number | null;
  chieu_cao_cm: number | null;
  can_nang_kg: number | null;
  muc_van_dong: MucVanDong | null;
  muc_tieu: MucTieu | null;
  muc_tieu_calo: number | null;
  di_ung_kieng_an: string;
  bmi: number | null;
  phan_loai_bmi: string | null;
};

// Dữ liệu gửi lên khi lưu hồ sơ
export type HoSoGuiLen = {
  gioi_tinh: GioiTinh;
  nam_sinh: number;
  chieu_cao_cm: number;
  can_nang_kg: number;
  muc_van_dong: MucVanDong;
  muc_tieu: MucTieu;
  di_ung_kieng_an: string;
};

// Các con số màn hồ sơ cần để làm mờ lựa chọn: ngưỡng BMI và ngưỡng tuổi
export type LuaChonHoSo = {
  bmi_thieu_can: number;
  bmi_ly_tuong: number;
  tuoi_cao_tuoi: number;
  bmi_thieu_can_cao_tuoi: number;
  tuoi_khong_co_muc_nang: number;
};

// Lấy hồ sơ của người đang đăng nhập
export async function layHoSo(): Promise<HoSo> {
  const ketQua = await callApi('GET', '/ho-so');
  return ketQua as HoSo;
}

// Lấy ngưỡng BMI và ngưỡng tuổi
export async function layLuaChonHoSo(): Promise<LuaChonHoSo> {
  const ketQua = await callApi('GET', '/ho-so/lua-chon');
  return ketQua as LuaChonHoSo;
}

// Lưu hồ sơ, server tính mục tiêu calo rồi gửi hồ sơ mới về
export async function luuHoSo(hoSo: HoSoGuiLen): Promise<HoSo> {
  const ketQua = await callApi('PUT', '/ho-so', hoSo);
  return ketQua as HoSo;
}
