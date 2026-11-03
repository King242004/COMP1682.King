import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { lamMoiMucTieuNeuQuaSinhNhat } from '../ho-so/HoSoService.ts';
import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { congNuoc, layCaiDatNuoc, layGioNhac, laySoMlNgay, luuCaiDatNuoc, truNuoc } from './UongNuocQueries.ts';
import type { CaiDatNuoc } from './UongNuocQueries.ts';

// Ngày phải có dạng 2026-11-03 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Giới hạn chặn gõ nhầm; là lựa chọn giao diện, không phải luật dinh dưỡng (giống CHECK trong 035_uong_nuoc.sql)
const ML_MOI_LAN_NHO_NHAT = 50;
const ML_MOI_LAN_LON_NHAT = 1000;
const MUC_TIEU_NHO_NHAT = 500;
const MUC_TIEU_LON_NHAT = 5000;
const SO_GIO_NHAC_TOI_DA = 12;

// Giờ nhắc phải có dạng 08:00 (giờ 00 tới 23, phút 00 tới 59)
const DANG_GIO = /^([01]\d|2[0-3]):[0-5]\d$/;

// Số ml nước mỗi kg cân nặng và mốc tuổi, lấy từ bảng quy_dinh
export type QuyDinhNuoc = {
  mlMoiKg: number;
  mlMoiKgTrenMocTuoi: number;
  mocTuoi: number;
};

// Mục tiêu nước gợi ý: cân nặng nhân số ml mỗi kg; người trên mốc tuổi dùng mức thấp hơn (Viện Dinh dưỡng 2016, Bảng 44)
export function tinhMucTieuNuoc(canNangKg: number, tuoi: number, quyDinh: QuyDinhNuoc): number {
  let mlMoiKg = quyDinh.mlMoiKg;
  if (tuoi > quyDinh.mocTuoi) {
    mlMoiKg = quyDinh.mlMoiKgTrenMocTuoi;
  }
  return Math.round(canNangKg * mlMoiKg);
}

// Kiểm tra cài đặt app gửi lên: số ml là số nguyên trong giới hạn, giờ nhắc đúng dạng, không trùng, không quá nhiều
export function kiemTraCaiDatNuoc(duLieu: Record<string, unknown>): CaiDatNuoc {
  const nuocMlMoiLan = duLieu.nuoc_ml_moi_lan;
  if (
    typeof nuocMlMoiLan !== 'number' || !Number.isInteger(nuocMlMoiLan) ||
    nuocMlMoiLan < ML_MOI_LAN_NHO_NHAT || nuocMlMoiLan > ML_MOI_LAN_LON_NHAT
  ) {
    throw new HttpError(400, `Mỗi lần ghi từ ${ML_MOI_LAN_NHO_NHAT} đến ${ML_MOI_LAN_LON_NHAT} ml`);
  }

  // Mục tiêu để trống là dùng gợi ý; có thì phải nằm trong giới hạn
  let mucTieuMl: number | null = null;
  if (duLieu.muc_tieu_ml !== null && duLieu.muc_tieu_ml !== undefined) {
    const mucTieu = duLieu.muc_tieu_ml;
    if (typeof mucTieu !== 'number' || !Number.isInteger(mucTieu) || mucTieu < MUC_TIEU_NHO_NHAT || mucTieu > MUC_TIEU_LON_NHAT) {
      throw new HttpError(400, `Mục tiêu từ ${MUC_TIEU_NHO_NHAT} đến ${MUC_TIEU_LON_NHAT} ml`);
    }
    mucTieuMl = mucTieu;
  }

  const nhacUongNuoc = duLieu.nhac_uong_nuoc;
  if (typeof nhacUongNuoc !== 'boolean') {
    throw new HttpError(400, 'Bật nhắc không hợp lệ');
  }

  // Giờ nhắc: một danh sách chữ dạng 08:00, không trùng, tối đa SO_GIO_NHAC_TOI_DA giờ
  const gioNhac = duLieu.gio_nhac;
  if (!Array.isArray(gioNhac) || gioNhac.length > SO_GIO_NHAC_TOI_DA) {
    throw new HttpError(400, `Tối đa ${SO_GIO_NHAC_TOI_DA} giờ nhắc`);
  }
  const danhSachGio: string[] = [];
  for (const gio of gioNhac) {
    if (typeof gio !== 'string' || !DANG_GIO.test(gio)) {
      throw new HttpError(400, 'Giờ nhắc không hợp lệ');
    }
    if (danhSachGio.includes(gio)) {
      throw new HttpError(400, 'Giờ nhắc bị trùng');
    }
    danhSachGio.push(gio);
  }

  return {
    nuoc_ml_moi_lan: nuocMlMoiLan,
    muc_tieu_ml: mucTieuMl,
    nhac_uong_nuoc: nhacUongNuoc,
    gio_nhac: danhSachGio,
  };
}

// Mục tiêu nước đang dùng: số người dùng tự đặt, không có thì số gợi ý; gửi kèm cả số gợi ý để app hiện nút "Dùng gợi ý"
export type MucTieuNuoc = {
  muc_tieu_ml: number;
  muc_tieu_goi_y_ml: number;
  la_muc_tieu_tu_dat: boolean;
};

// Mọi thứ màn Uống nước và thẻ ở Trang chủ cần cho một ngày
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

// Đọc ngày app gửi lên trong body; sai dạng thì báo lỗi
function docNgay(duLieu: Record<string, unknown>): string {
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  return ngay;
}

// Lấy mục tiêu nước của một người: tính gợi ý từ cân nặng và tuổi, rồi xem có số tự đặt không
export async function layMucTieuNuoc(nguoiDungId: number): Promise<MucTieuNuoc> {
  // Qua sinh nhật thì tính lại trước, để tuổi đã dùng cho mục tiêu là tuổi hôm nay
  await lamMoiMucTieuNeuQuaSinhNhat(nguoiDungId);
  const hoSo = await layHoSo(nguoiDungId);
  if (hoSo.can_nang_kg === null || hoSo.tuoi_tinh_muc_tieu === null) {
    throw new HttpError(400, 'Hãy thiết lập hồ sơ trước để có mục tiêu uống nước');
  }

  const mucTieuGoiY = tinhMucTieuNuoc(hoSo.can_nang_kg, hoSo.tuoi_tinh_muc_tieu, {
    mlMoiKg: await layQuyDinh('nuoc_ml_moi_kg'),
    mlMoiKgTrenMocTuoi: await layQuyDinh('nuoc_ml_moi_kg_tren_moc_tuoi'),
    mocTuoi: await layQuyDinh('nuoc_moc_tuoi'),
  });

  // Người dùng tự đặt thì dùng số đó
  const caiDat = await layCaiDatNuoc(nguoiDungId);
  if (caiDat.muc_tieu_nuoc_ml !== null) {
    return { muc_tieu_ml: caiDat.muc_tieu_nuoc_ml, muc_tieu_goi_y_ml: mucTieuGoiY, la_muc_tieu_tu_dat: true };
  }
  return { muc_tieu_ml: mucTieuGoiY, muc_tieu_goi_y_ml: mucTieuGoiY, la_muc_tieu_tu_dat: false };
}

// Lấy lượng nước đã uống của một ngày cùng mục tiêu và cài đặt
export async function xemUongNuocNgay(nguoiDungId: number, ngay: string): Promise<UongNuocNgay> {
  if (!DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const mucTieu = await layMucTieuNuoc(nguoiDungId);
  const caiDat = await layCaiDatNuoc(nguoiDungId);

  return {
    ngay: ngay,
    so_ml: await laySoMlNgay(nguoiDungId, ngay),
    muc_tieu_ml: mucTieu.muc_tieu_ml,
    muc_tieu_goi_y_ml: mucTieu.muc_tieu_goi_y_ml,
    la_muc_tieu_tu_dat: mucTieu.la_muc_tieu_tu_dat,
    nuoc_ml_moi_lan: caiDat.nuoc_ml_moi_lan,
    nhac_uong_nuoc: caiDat.nhac_uong_nuoc,
    gio_nhac: await layGioNhac(nguoiDungId),
  };
}

// Bấm "+": cộng thêm đúng số ml mỗi lần ghi vào ngày đó
export async function themNuoc(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<UongNuocNgay> {
  const ngay = docNgay(duLieu);
  const caiDat = await layCaiDatNuoc(nguoiDungId);
  await congNuoc(nguoiDungId, ngay, caiDat.nuoc_ml_moi_lan);
  return xemUongNuocNgay(nguoiDungId, ngay);
}

// Bấm "−": trừ bớt đúng số ml mỗi lần ghi, không xuống dưới 0
export async function botNuoc(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<UongNuocNgay> {
  const ngay = docNgay(duLieu);
  const caiDat = await layCaiDatNuoc(nguoiDungId);
  await truNuoc(nguoiDungId, ngay, caiDat.nuoc_ml_moi_lan);
  return xemUongNuocNgay(nguoiDungId, ngay);
}

// Kiểm tra rồi lưu cài đặt uống nước, trả về ngày đó với cài đặt mới
export async function capNhatCaiDatNuoc(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<UongNuocNgay> {
  const ngay = docNgay(duLieu);
  await luuCaiDatNuoc(nguoiDungId, kiemTraCaiDatNuoc(duLieu));
  return xemUongNuocNgay(nguoiDungId, ngay);
}
