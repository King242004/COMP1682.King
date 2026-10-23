import { layTongCaloCacNgay } from '../bua-an/BuaAnQueries.ts';
import type { CaloMotNgay } from '../bua-an/BuaAnQueries.ts';
import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { capNhatCanNangHoSo } from '../ho-so/HoSoService.ts';
import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layCanNangCacNgay, luuCanNang } from './TienDoQueries.ts';
import type { LanCan } from './TienDoQueries.ts';

// Số ngày của biểu đồ, của đường xu hướng, của thẻ "4 tuần qua"; là lựa chọn giao diện, không phải luật dinh dưỡng
const SO_NGAY_BIEU_DO = 30;
const SO_NGAY_XU_HUONG = 7;
const SO_NGAY_TOM_TAT = 28;

// Cân phải trải dài ít nhất 14 ngày mới tính tốc độ; quy ước 1 tháng = 30 ngày
const SO_NGAY_TOI_THIEU_TINH_TOC_DO = 14;
const SO_NGAY_MOT_THANG = 30;

// Giới hạn cân nặng, giống hồ sơ (CHECK trong 004_ho_so.sql và 010_can_nang.sql)
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

// Ngày phải có dạng 2026-10-06 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Mọi thứ tab Tiến độ và coach cần
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

// Một điểm trên biểu đồ: cân ngày đó và cân theo đường xu hướng
export type DiemCanNang = {
  ngay: string;
  can_nang_kg: number;
  xu_huong_kg: number;
};

// Số mili giây trong một ngày, để đổi ngày ra số
const MILI_GIAY_MOT_NGAY = 24 * 60 * 60 * 1000;

// Làm tròn 1 số lẻ
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Đổi ngày "2026-10-06" ra số thứ tự của ngày, để trừ hai ngày cho nhau ra số ngày cách nhau
export function doiRaSoNgay(ngay: string): number {
  const phan = ngay.split('-');
  const nam = Number(phan[0]);
  const thang = Number(phan[1]);
  const ngayTrongThang = Number(phan[2]);
  return Date.UTC(nam, thang - 1, ngayTrongThang) / MILI_GIAY_MOT_NGAY;
}

// Đường xu hướng: mỗi lần cân lấy trung bình các lần cân trong soNgayXuHuong ngày tính tới ngày đó (gồm cả ngày đó)
export function tinhXuHuongCanNang(danhSachLanCan: LanCan[], soNgayXuHuong: number): DiemCanNang[] {
  const danhSachDiem: DiemCanNang[] = [];
  for (const lanCan of danhSachLanCan) {
    const ngayNay = doiRaSoNgay(lanCan.ngay);

    // Cộng các lần cân nằm trong cửa sổ ngày
    let tongCan = 0;
    let soLanCan = 0;
    for (const lanKhac of danhSachLanCan) {
      const ngayKhac = doiRaSoNgay(lanKhac.ngay);
      if (ngayKhac <= ngayNay && ngayKhac > ngayNay - soNgayXuHuong) {
        tongCan = tongCan + lanKhac.can_nang_kg;
        soLanCan = soLanCan + 1;
      }
    }

    danhSachDiem.push({
      ngay: lanCan.ngay,
      can_nang_kg: lanCan.can_nang_kg,
      xu_huong_kg: lamTronMotSoLe(tongCan / soLanCan),
    });
  }
  return danhSachDiem;
}

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

// Lấy tiến độ tính tới một ngày: các điểm cân 30 ngày, cân theo xu hướng, tóm tắt 4 tuần
export async function xemTienDo(nguoiDungId: number, ngay: string): Promise<TienDo> {
  if (!DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }

  // Lấy thêm 6 ngày trước biểu đồ để điểm đầu tiên cũng đủ 7 ngày tính trung bình
  const danhSachLanCan = await layCanNangCacNgay(nguoiDungId, ngay, SO_NGAY_BIEU_DO + SO_NGAY_XU_HUONG - 1);
  const tatCaDiem = tinhXuHuongCanNang(danhSachLanCan, SO_NGAY_XU_HUONG);

  // Giữ lại điểm nằm trong 30 ngày cho biểu đồ, trong 28 ngày cho tóm tắt
  const ngayCuoi = doiRaSoNgay(ngay);
  const diemBieuDo = tatCaDiem.filter((diem) => doiRaSoNgay(diem.ngay) > ngayCuoi - SO_NGAY_BIEU_DO);
  const diemTomTat = tatCaDiem.filter((diem) => doiRaSoNgay(diem.ngay) > ngayCuoi - SO_NGAY_TOM_TAT);

  // Cân theo xu hướng là điểm cuối của đường xu hướng
  let canNangXuHuong: number | null = null;
  if (diemBieuDo.length > 0) {
    canNangXuHuong = diemBieuDo[diemBieuDo.length - 1].xu_huong_kg;
  }

  const hoSo = await layHoSo(nguoiDungId);
  const giamCanKgMoiThangThap = await layQuyDinh('giam_can_kg_moi_thang_thap');
  const giamCanKgMoiThangCao = await layQuyDinh('giam_can_kg_moi_thang_cao');
  const tomTat = tomTatBonTuan({
    caloCacNgay: await layTongCaloCacNgay(nguoiDungId, ngay, SO_NGAY_TOM_TAT),
    diemCanNang: diemTomTat,
    mucTieu: hoSo.muc_tieu,
    soNgay: SO_NGAY_TOM_TAT,
    soNgayToiThieu: SO_NGAY_TOI_THIEU_TINH_TOC_DO,
    soNgayMotThang: SO_NGAY_MOT_THANG,
    giamCanKgMoiThangThap: giamCanKgMoiThangThap,
    giamCanKgMoiThangCao: giamCanKgMoiThangCao,
  });

  return {
    ngay: ngay,
    can_nang: diemBieuDo,
    can_nang_xu_huong: canNangXuHuong,
    muc_tieu: hoSo.muc_tieu,
    muc_tieu_calo: hoSo.muc_tieu_calo,
    tom_tat: tomTat,
    giam_can_kg_moi_thang_thap: giamCanKgMoiThangThap,
    giam_can_kg_moi_thang_cao: giamCanKgMoiThangCao,
  };
}

// Ghi cân của một ngày, cập nhật hồ sơ và mục tiêu calo, rồi trả về tiến độ mới
export async function ghiCanNang(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<TienDo> {
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const canNangKg = duLieu.can_nang_kg;
  if (typeof canNangKg !== 'number' || canNangKg < CAN_NANG_NHO_NHAT || canNangKg > CAN_NANG_LON_NHAT) {
    throw new HttpError(400, `Cân nặng từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`);
  }

  // Làm tròn 1 số lẻ cho khớp cột NUMERIC(4, 1)
  const canNangLamTron = Math.round(canNangKg * 10) / 10;
  await luuCanNang(nguoiDungId, ngay, canNangLamTron);
  await capNhatCanNangHoSo(nguoiDungId, canNangLamTron);
  return xemTienDo(nguoiDungId, ngay);
}
