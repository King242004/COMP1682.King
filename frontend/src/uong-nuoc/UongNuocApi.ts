import { callApi } from '../shared/apiClient';

// Mọi thứ màn Uống nước và thẻ ở Trang chủ cần cho một ngày; gio_nhac dạng "08:00", giờ sớm trước
export type UongNuocNgay = {
  ngay: string;
  so_ml: number;
  muc_tieu_ml: number;
  muc_tieu_goi_y_ml: number;
  la_muc_tieu_tu_dat: boolean;
  nuoc_ml_moi_lan: number;
  nhac_uong_nuoc: boolean;
  gio_nhac: string[];
};

// Cài đặt gửi lên server; muc_tieu_ml null là dùng mục tiêu gợi ý
export type CaiDatNuoc = {
  nuoc_ml_moi_lan: number;
  muc_tieu_ml: number | null;
  nhac_uong_nuoc: boolean;
  gio_nhac: string[];
};

// Lấy lượng nước đã uống của một ngày, ví dụ ngay = "2026-11-03"
export async function layUongNuocNgay(ngay: string): Promise<UongNuocNgay> {
  const ketQua = await callApi('GET', `/uong-nuoc/ngay/${ngay}`);
  return ketQua as UongNuocNgay;
}

// Bấm "+": cộng thêm số ml mỗi lần ghi vào ngày đó
export async function themNuoc(ngay: string): Promise<UongNuocNgay> {
  const ketQua = await callApi('POST', '/uong-nuoc/them', { ngay: ngay });
  return ketQua as UongNuocNgay;
}

// Bấm "−": trừ bớt số ml mỗi lần ghi, không xuống dưới 0
export async function botNuoc(ngay: string): Promise<UongNuocNgay> {
  const ketQua = await callApi('POST', '/uong-nuoc/bot', { ngay: ngay });
  return ketQua as UongNuocNgay;
}

// Lưu cài đặt uống nước, nhận lại ngày đó với cài đặt mới
export async function luuCaiDatNuoc(ngay: string, caiDat: CaiDatNuoc): Promise<UongNuocNgay> {
  const ketQua = await callApi('PUT', '/uong-nuoc/cai-dat', { ngay: ngay, ...caiDat });
  return ketQua as UongNuocNgay;
}
