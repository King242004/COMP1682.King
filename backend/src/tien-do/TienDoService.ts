import { layTongCaloCacNgay } from '../bua-an/BuaAnQueries.ts';
import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { capNhatCanNangHoSo } from '../ho-so/HoSoService.ts';
import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layCanNangCacNgay, luuCanNang } from './TienDoQueries.ts';
import { doiRaSoNgay, tinhXuHuongCanNang } from './TinhXuHuongCanNang.ts';
import type { DiemCanNang } from './TinhXuHuongCanNang.ts';
import { tomTatBonTuan } from './TomTatBonTuan.ts';
import type { TomTatBonTuan } from './TomTatBonTuan.ts';

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
