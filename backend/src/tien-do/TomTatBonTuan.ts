import type { CaloMotNgay } from '../bua-an/BuaAnQueries.ts';
import { doiRaSoNgay } from './TinhXuHuongCanNang.ts';
import type { DiemCanNang } from './TinhXuHuongCanNang.ts';

// Ba con số của thẻ "4 tuần qua", gửi thẳng về app
export type TomTatBonTuan = {
  so_ngay: number;
  so_ngay_co_ghi: number;
  calo_trung_binh: number | null;
  thay_doi_kg_moi_thang: number | null;
  danh_gia_toc_do: 'nhanh_qua' | 'trong_khoang' | 'cham_hon' | null;
};

// Đầu vào: số liệu của đúng khoảng ngày cần tóm tắt, cùng các con số lấy từ Service và bảng quy_dinh
export type DauVaoTomTat = {
  caloCacNgay: CaloMotNgay[];
  diemCanNang: DiemCanNang[];
  mucTieu: 'giam' | 'giu' | 'tang' | null;
  soNgay: number;
  soNgayToiThieu: number;
  soNgayMotThang: number;
  giamCanKgMoiThangThap: number;
  giamCanKgMoiThangCao: number;
};

// Làm tròn 1 số lẻ
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Tóm tắt các ngày gần đây: calo trung bình, số ngày có ghi món, cân thay đổi mỗi tháng và so với QĐ 2892 khi đang giảm cân
export function tomTatBonTuan(dauVao: DauVaoTomTat): TomTatBonTuan {
  // Calo trung bình chỉ tính những ngày có ghi món
  let tongCalo = 0;
  for (const motNgay of dauVao.caloCacNgay) {
    tongCalo = tongCalo + motNgay.tong_calo;
  }
  const soNgayCoGhi = dauVao.caloCacNgay.length;
  let caloTrungBinh: number | null = null;
  if (soNgayCoGhi > 0) {
    caloTrungBinh = Math.round(tongCalo / soNgayCoGhi);
  }

  // Cân thay đổi mỗi tháng: so điểm xu hướng đầu và cuối; phải trải dài đủ soNgayToiThieu ngày mới tính
  let thayDoiKgMoiThang: number | null = null;
  const diem = dauVao.diemCanNang;
  if (diem.length >= 2) {
    const diemDau = diem[0];
    const diemCuoi = diem[diem.length - 1];
    const soNgayTraiDai = doiRaSoNgay(diemCuoi.ngay) - doiRaSoNgay(diemDau.ngay);
    if (soNgayTraiDai >= dauVao.soNgayToiThieu) {
      thayDoiKgMoiThang = lamTronMotSoLe(((diemCuoi.xu_huong_kg - diemDau.xu_huong_kg) / soNgayTraiDai) * dauVao.soNgayMotThang);
    }
  }

  // Chỉ người đang giảm cân mới so với QĐ 2892; số kg giảm là số dương
  let danhGiaTocDo: 'nhanh_qua' | 'trong_khoang' | 'cham_hon' | null = null;
  if (dauVao.mucTieu === 'giam' && thayDoiKgMoiThang !== null) {
    const soKgGiam = -thayDoiKgMoiThang;
    if (soKgGiam > dauVao.giamCanKgMoiThangCao) {
      danhGiaTocDo = 'nhanh_qua';
    } else if (soKgGiam >= dauVao.giamCanKgMoiThangThap) {
      danhGiaTocDo = 'trong_khoang';
    } else {
      danhGiaTocDo = 'cham_hon';
    }
  }

  return {
    so_ngay: dauVao.soNgay,
    so_ngay_co_ghi: soNgayCoGhi,
    calo_trung_binh: caloTrungBinh,
    thay_doi_kg_moi_thang: thayDoiKgMoiThang,
    danh_gia_toc_do: danhGiaTocDo,
  };
}
