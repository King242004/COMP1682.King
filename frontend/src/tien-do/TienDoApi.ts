import { callApi } from '../shared/apiClient';

// Một điểm trên biểu đồ: cân ngày đó và cân theo đường xu hướng 7 ngày
export type DiemCanNang = {
  ngay: string;
  can_nang_kg: number;
  xu_huong_kg: number;
};

// Ba con số của thẻ "4 tuần qua"
export type TomTatBonTuan = {
  so_ngay: number;
  so_ngay_co_ghi: number;
  calo_trung_binh: number | null;
  thay_doi_kg_moi_thang: number | null;
  danh_gia_toc_do: 'nhanh_qua' | 'trong_khoang' | 'cham_hon' | null;
};

// Mọi thứ tab Tiến độ cần
export type TienDo = {
  ngay: string;
  can_nang: DiemCanNang[];
  can_nang_xu_huong: number | null;
  muc_tieu: 'giam' | 'giu' | 'tang' | null;
  muc_tieu_calo: number | null;
  tom_tat: TomTatBonTuan;
  giam_can_kg_moi_thang_thap: number;
  giam_can_kg_moi_thang_cao: number;
};

// Lấy tiến độ tính tới một ngày, ví dụ ngay = "2026-10-06"
export async function layTienDo(ngay: string): Promise<TienDo> {
  const ketQua = await callApi('GET', `/tien-do/ngay/${ngay}`);
  return ketQua as TienDo;
}

// Ghi cân của một ngày (ghi lại trong ngày thì đè), nhận lại tiến độ mới
export async function ghiCanNang(ngay: string, canNangKg: number): Promise<TienDo> {
  const ketQua = await callApi('PUT', '/tien-do/can-nang', { ngay: ngay, can_nang_kg: canNangKg });
  return ketQua as TienDo;
}
