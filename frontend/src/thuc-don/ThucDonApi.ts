import type { LoaiBua } from '../bua-an/BuaAnApi';
import { callApi } from '../shared/apiClient';
import type { NhomMon } from '../tra-mon/TraMonApi';

// Một món trong thực đơn. "mon_vien": 1 suất Viện Dinh dưỡng đã cân (có mã món, ảnh); "com_nha": mâm cơm nhà AI ghép, số AI ước tính, khẩu phần ghi các món trong mâm
// Thực đơn tạo trước 24/10/2026 không có kieu, ma_so, anh_url và số là AI ước tính
export type MonThucDon = {
  loai_bua: LoaiBua;
  kieu: 'mon_vien' | 'com_nha';
  ma_so: string | null;
  anh_url: string | null;
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

// Bữa có thể ăn cơm gia đình (bữa phụ thì không)
export type BuaChinh = 'sang' | 'trua' | 'toi';

// Những thứ có thể chọn cho mâm cơm nhà
export type ThuTrongMam = 'ca' | 'thit_heo' | 'thit_bo' | 'ga' | 'tom' | 'trung' | 'dau_phu' | 'rau' | 'canh';

export type UuTien = 'khong' | 'giau_dam' | 'it_calo';

// Cài đặt người dùng chọn trong tấm "Tạo thực đơn hôm nay"
export type CaiDatThucDon = {
  bua_com_nha: BuaChinh[];
  so_mon_com_nha: number;
  thu_trong_mam: ThuTrongMam[];
  co_bua_phu: boolean;
  // Rỗng là thích tất cả các nhóm
  nhom_mon: NhomMon[];
  uu_tien: UuTien;
  ghi_chu: string;
};

// Lấy thực đơn của một ngày, ví dụ ngay = "2026-10-09"
export async function layThucDon(ngay: string): Promise<ThucDonNgay> {
  const ketQua = await callApi('GET', `/thuc-don/ngay/${ngay}`);
  return ketQua as ThucDonNgay;
}

// Nhờ AI tạo (hoặc tạo lại) thực đơn cho một ngày theo cài đặt
export async function taoThucDon(ngay: string, caiDat: CaiDatThucDon): Promise<ThucDonNgay> {
  const ketQua = await callApi('POST', '/thuc-don', { ngay: ngay, ...caiDat });
  return ketQua as ThucDonNgay;
}
