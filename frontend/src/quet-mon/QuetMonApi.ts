import { callApi } from '../shared/apiClient';

// Một khả năng AI đoán, số liệu cho cả phần ăn nhìn thấy
export type KhaNang = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  do_tin_cay: number;
};

// Kết quả nhận món; la_mon_an = false là AI thấy không phải đồ ăn
export type KetQuaNhanMon = {
  la_mon_an: boolean;
  kha_nang: KhaNang[];
};

// Sản phẩm tra được qua mã vạch, số liệu trên 100 g
export type SanPhamMaVach = {
  ten_san_pham: string;
  kcal_100g: number;
  dam_100g: number | null;
  tinh_bot_100g: number | null;
  beo_100g: number | null;
  muoi_100g: number | null;
  duong_100g: number | null;
  beo_no_100g: number | null;
  khoi_luong_1_phan_g: number | null;
};

// Nhờ AI ước tính theo tên món và khẩu phần
export async function uocTinhTheoTen(tenMon: string, khauPhan: string): Promise<KetQuaNhanMon> {
  const ketQua = await callApi('POST', '/quet-mon/ten', { ten_mon: tenMon, khau_phan: khauPhan });
  return ketQua as KetQuaNhanMon;
}

// Gửi ảnh cho AI nhận món, kèm ghi chú không bắt buộc
export async function nhanMonTuAnh(anhBase64: string, kieuAnh: string, ghiChu: string): Promise<KetQuaNhanMon> {
  const ketQua = await callApi('POST', '/quet-mon/anh', { anh_base64: anhBase64, kieu_anh: kieuAnh, ghi_chu: ghiChu });
  return ketQua as KetQuaNhanMon;
}

// Tra mã vạch
export async function traMaVach(maVach: string): Promise<SanPhamMaVach> {
  const ketQua = await callApi('GET', `/quet-mon/ma-vach/${maVach}`);
  return ketQua as SanPhamMaVach;
}
