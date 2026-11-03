import type { TongHop } from '../bua-an/BuaAnApi';
import { callApi } from '../shared/apiClient';

// Một ngày có ghi món: tổng hợp, tên các món, và ngày đó có vượt calo, muối, đường, béo no không
export type NgayBaoCao = {
  ngay: string;
  tong_hop: TongHop;
  ten_mon: string[];
  vuot_calo: boolean;
  vuot_muoi: boolean;
  vuot_duong: boolean;
  vuot_beo_no: boolean;
};

// Các con số tóm tắt cả tuần hoặc cả tháng; chưa ghi ngày nào thì số trung bình và % là null
export type TomTatBaoCao = {
  so_ngay_co_ghi: number;
  so_ngay_khong_vuot: number;
  calo_trung_binh: number | null;
  dam_g_trung_binh: number | null;
  phan_tram_dam: number | null;
  phan_tram_tinh_bot: number | null;
  phan_tram_beo: number | null;
  dam_dat: boolean | null;
  tinh_bot_dat: boolean | null;
  beo_dat: boolean | null;
  so_ngay_vuot_muoi: number;
  so_ngay_vuot_duong: number;
  so_ngay_vuot_beo_no: number;
};

// Mọi thứ màn Báo cáo dinh dưỡng cần; cac_ngay chỉ có ngày có ghi món, ngày cũ trước
export type BaoCaoDinhDuong = {
  tu_ngay: string;
  den_ngay: string;
  muc_tieu_calo: number;
  ty_le_tinh_bot_thap: number;
  ty_le_tinh_bot_cao: number;
  ty_le_beo_thap: number;
  ty_le_beo_cao: number;
  cac_ngay: NgayBaoCao[];
  tom_tat: TomTatBaoCao;
};

// Lấy báo cáo dinh dưỡng từ ngày này tới ngày kia, ví dụ "2026-10-27" tới "2026-11-02"
export async function layBaoCaoDinhDuong(tuNgay: string, denNgay: string): Promise<BaoCaoDinhDuong> {
  const ketQua = await callApi('GET', `/bao-cao/tu/${tuNgay}/den/${denNgay}`);
  return ketQua as BaoCaoDinhDuong;
}

// Tổng ml nước của một ngày có uống
export type NuocMotNgay = {
  ngay: string;
  so_ml: number;
};

// Các con số tóm tắt uống nước cả tuần hoặc cả tháng; chưa ghi ngày nào thì trung bình là null
export type TomTatUongNuoc = {
  so_ngay_co_ghi: number;
  so_ngay_dat: number;
  ml_trung_binh: number | null;
};

// Mọi thứ màn Báo cáo uống nước cần; cac_ngay chỉ có ngày có uống, ngày cũ trước
export type BaoCaoUongNuoc = {
  tu_ngay: string;
  den_ngay: string;
  muc_tieu_ml: number;
  cac_ngay: NuocMotNgay[];
  tom_tat: TomTatUongNuoc;
};

// Lấy báo cáo uống nước từ ngày này tới ngày kia, ví dụ "2026-10-26" tới "2026-11-01"
export async function layBaoCaoUongNuoc(tuNgay: string, denNgay: string): Promise<BaoCaoUongNuoc> {
  const ketQua = await callApi('GET', `/bao-cao/uong-nuoc/tu/${tuNgay}/den/${denNgay}`);
  return ketQua as BaoCaoUongNuoc;
}
