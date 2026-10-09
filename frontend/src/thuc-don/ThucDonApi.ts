import type { LoaiBua } from '../bua-an/BuaAnApi';
import { callApi } from '../shared/apiClient';

export type CachAn = 'an_ngoai' | 'tu_nau';

// Một món trong thực đơn; món ăn ngoài thì nguyên liệu và cách nấu rỗng
export type MonThucDon = {
  loai_bua: LoaiBua;
  cach_an: CachAn;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguyen_lieu: string[];
  cach_nau: string[];
};

// Thực đơn một ngày; chưa tạo thì danh sách món là null
export type ThucDonNgay = {
  ngay: string;
  muc_tieu_calo: number | null;
  tong_calo: number;
  mon: MonThucDon[] | null;
};

// Lấy thực đơn của một ngày, ví dụ ngay = "2026-10-09"
export async function layThucDon(ngay: string): Promise<ThucDonNgay> {
  const ketQua = await callApi('GET', `/thuc-don/ngay/${ngay}`);
  return ketQua as ThucDonNgay;
}

// Nhờ AI tạo (hoặc tạo lại) thực đơn cho một ngày
export async function taoThucDon(ngay: string): Promise<ThucDonNgay> {
  const ketQua = await callApi('POST', '/thuc-don', { ngay: ngay });
  return ketQua as ThucDonNgay;
}
