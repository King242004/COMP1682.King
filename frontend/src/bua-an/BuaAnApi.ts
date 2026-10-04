import { callApi } from '../shared/apiClient';

export type LoaiBua = 'sang' | 'trua' | 'toi' | 'phu';

// Một món đã ăn server gửi về
export type BuaAn = {
  id: number;
  ngay: string;
  loai_bua: LoaiBua;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
};

// Phần tổng hợp của một ngày; con_lai âm là đã ăn vượt mục tiêu
export type TongHop = {
  tong_calo: number;
  con_lai: number | null;
  tong_dam_g: number;
  tong_tinh_bot_g: number;
  tong_beo_g: number;
  so_mon_thieu_chat: number;
};

// Mọi thứ trang chủ cần cho một ngày
export type NhatKyNgay = {
  ngay: string;
  muc_tieu_calo: number | null;
  bua_an: BuaAn[];
  tong_hop: TongHop;
};

// Một món trong danh sách "món hay ăn"
export type MonHayAn = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
};

// Dữ liệu gửi lên khi thêm hoặc sửa một món
export type BuaAnGuiLen = {
  ngay: string;
  loai_bua: LoaiBua;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
};

// Lấy nhật ký một ngày, ví dụ ngay = "2026-10-04"
export async function layNhatKyNgay(ngay: string): Promise<NhatKyNgay> {
  const ketQua = await callApi('GET', `/bua-an/ngay/${ngay}`);
  return ketQua as NhatKyNgay;
}

// Lấy các món người dùng hay ăn
export async function layMonHayAn(): Promise<MonHayAn[]> {
  const ketQua = await callApi('GET', '/bua-an/hay-an');
  return ketQua as MonHayAn[];
}

// Lấy một món để sửa
export async function layMotBuaAn(buaAnId: string): Promise<BuaAn> {
  const ketQua = await callApi('GET', `/bua-an/${buaAnId}`);
  return ketQua as BuaAn;
}

// Thêm một món
export async function themBuaAn(buaAn: BuaAnGuiLen): Promise<BuaAn> {
  const ketQua = await callApi('POST', '/bua-an', buaAn);
  return ketQua as BuaAn;
}

// Sửa một món
export async function suaBuaAn(buaAnId: string, buaAn: BuaAnGuiLen): Promise<BuaAn> {
  const ketQua = await callApi('PUT', `/bua-an/${buaAnId}`, buaAn);
  return ketQua as BuaAn;
}

// Xóa một món
export async function xoaBuaAn(buaAnId: string): Promise<void> {
  await callApi('DELETE', `/bua-an/${buaAnId}`);
}
