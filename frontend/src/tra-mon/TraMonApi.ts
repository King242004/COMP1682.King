import { callApi } from '../shared/apiClient';

// Một món Viện Dinh dưỡng đã cân; số liệu là của 1 suất
export type MonTraCuu = {
  ma_so: string;
  ten_mon: string;
  ten_khong_dau: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number;
  anh_url: string;
  // Tên bỏ số lượng hoặc giá ở cuối, ví dụ "Bánh gối" của "Bánh gối 3 cái"; phần cắt ra nằm ở ghi_chu_suat
  ten_goc: string;
  ghi_chu_suat: string | null;
  // Khám phá chỉ hiện 1 bản cho mỗi món; kính lúp ở màn thêm món thấy đủ
  hien_o_kham_pha: boolean;
  // Nhóm để lọc ở Khám phá, xếp theo chữ đầu tên món
  nhom_mon: NhomMon;
};

export type NhomMon = 'bun_pho' | 'com_chao_xoi' | 'che_do_uong' | 'banh' | 'mon_khac';

// Một dòng trong bảng "Trong 1 suất có", chép từ bảng thành phần Viện in trong ảnh suất; ô Viện để trống (không cân) là null
export type ThanhPhanSuat = {
  thu_tu: number;
  ten_thanh_phan: string;
  so_gam: number | null;
  so_calo: number | null;
};

// Lấy tất cả món Viện Dinh dưỡng đã cân
export async function layTatCaMon(): Promise<MonTraCuu[]> {
  const ketQua = await callApi('GET', '/tra-mon');
  return ketQua as MonTraCuu[];
}

// Một thực phẩm trong kho Viện Dinh dưỡng 2025; số trên 100 g, chất Viện chưa có số là null
export type ThucPham = {
  ma_so: string;
  ten_thuc_pham: string;
  ten_khong_dau: string;
  kcal_100g: number;
  dam_100g: number | null;
  tinh_bot_100g: number | null;
  beo_100g: number | null;
  muoi_100g: number | null;
  duong_100g: number | null;
  beo_no_100g: number | null;
};

// Lấy cả kho thực phẩm Viện Dinh dưỡng 2025
export async function layTatCaThucPham(): Promise<ThucPham[]> {
  const ketQua = await callApi('GET', '/tra-mon/thuc-pham');
  return ketQua as ThucPham[];
}

// Lấy bảng "Trong 1 suất có" của một món; món chưa có bảng thì trả mảng rỗng
export async function layThanhPhanSuat(maSo: string): Promise<ThanhPhanSuat[]> {
  const ketQua = await callApi('GET', `/tra-mon/${maSo}/thanh-phan`);
  return ketQua as ThanhPhanSuat[];
}
