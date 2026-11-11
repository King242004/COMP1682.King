import { callApi } from '../shared/apiClient';

// Một điểm trên biểu đồ: cân ngày đó và cân theo đường xu hướng 7 ngày
export type DiemCanNang = {
  ngay: string;
  can_nang_kg: number;
  xu_huong_kg: number;
};

// Ba con số của thẻ "Kết quả 4 tuần"
export type TomTatBonTuan = {
  so_ngay: number;
  so_ngay_co_ghi: number;
  calo_trung_binh: number | null;
  thay_doi_kg_moi_thang: number | null;
  danh_gia_toc_do: 'nhanh_qua' | 'trong_khoang' | 'cham_hon' | null;
};

// Mọi thứ màn Báo cáo cân nặng cần
export type BaoCaoCanNang = {
  ngay: string;
  can_nang: DiemCanNang[];
  can_nang_xu_huong: number | null;
  muc_tieu: 'giam' | 'giu' | 'tang' | null;
  muc_tieu_calo: number | null;
  tom_tat: TomTatBonTuan;
  giam_can_kg_moi_thang_thap: number;
  giam_can_kg_moi_thang_cao: number;
};

// Lấy báo cáo cân nặng tính tới một ngày, ví dụ ngay = "2026-10-06"
export async function layBaoCaoCanNang(ngay: string): Promise<BaoCaoCanNang> {
  const ketQua = await callApi('GET', `/can-nang/ngay/${ngay}`);
  return ketQua as BaoCaoCanNang;
}

// Ghi cân của một ngày (ghi lại trong ngày thì đè), nhận lại báo cáo cân nặng mới
export async function ghiCanNang(ngay: string, canNangKg: number): Promise<BaoCaoCanNang> {
  const ketQua = await callApi('PUT', '/can-nang', { ngay: ngay, can_nang_kg: canNangKg });
  return ketQua as BaoCaoCanNang;
}
