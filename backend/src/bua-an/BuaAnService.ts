import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layBuaAnTheoNgay, layMonHayAn, layMotBuaAn, suaBuaAn, themBuaAn, xoaBuaAn } from './BuaAnQueries.ts';
import type { BuaAn, DuLieuBuaAn, MonHayAn } from './BuaAnQueries.ts';
import { tongHopNgay } from './TongHopNgay.ts';
import type { TongHop } from './TongHopNgay.ts';

// Giới hạn độ dài và calo để chặn gõ nhầm; là lựa chọn giao diện, không phải luật dinh dưỡng (giống CHECK trong 005_bua_an.sql)
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const CALO_LON_NHAT = 10000;

// Số món hiện trong danh sách "món hay ăn"
const SO_MON_HAY_AN = 6;

// Ngày phải có dạng 2026-10-04
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Mọi thứ trang chủ cần cho một ngày
type NhatKyNgay = {
  ngay: string;
  muc_tieu_calo: number | null;
  bua_an: BuaAn[];
  tong_hop: TongHop;
};

// Đổi id trên đường dẫn thành số; sai dạng thì coi như không tìm thấy
function docBuaAnId(buaAnIdChu: string): number {
  const buaAnId = Number(buaAnIdChu);
  if (!Number.isInteger(buaAnId) || buaAnId <= 0) {
    throw new HttpError(404, 'Không tìm thấy món ăn');
  }
  return buaAnId;
}

// Đọc một ô đạm / tinh bột / béo: để trống là null, có thì phải là số không âm
function docSoGam(giaTri: unknown, tenO: string): number | null {
  if (giaTri === null || giaTri === undefined) {
    return null;
  }
  if (typeof giaTri !== 'number' || giaTri < 0) {
    throw new HttpError(400, `${tenO} phải là số không âm`);
  }
  return giaTri;
}

// Kiểm tra dữ liệu một món app gửi lên, dùng chung cho thêm và sửa
function kiemTraDuLieuBuaAn(duLieu: Record<string, unknown>): DuLieuBuaAn {
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }

  const loaiBua = duLieu.loai_bua;
  if (loaiBua !== 'sang' && loaiBua !== 'trua' && loaiBua !== 'toi' && loaiBua !== 'phu') {
    throw new HttpError(400, 'Bữa không hợp lệ');
  }

  const tenMon = duLieu.ten_mon;
  if (typeof tenMon !== 'string' || tenMon.trim() === '' || tenMon.trim().length > TEN_MON_DAI_NHAT) {
    throw new HttpError(400, `Tên món cần từ 1 đến ${TEN_MON_DAI_NHAT} ký tự`);
  }

  let khauPhan = '';
  if (duLieu.khau_phan !== undefined && duLieu.khau_phan !== null) {
    if (typeof duLieu.khau_phan !== 'string' || duLieu.khau_phan.trim().length > KHAU_PHAN_DAI_NHAT) {
      throw new HttpError(400, `Khẩu phần tối đa ${KHAU_PHAN_DAI_NHAT} ký tự`);
    }
    khauPhan = duLieu.khau_phan.trim();
  }

  const soCalo = duLieu.so_calo;
  if (typeof soCalo !== 'number' || !Number.isInteger(soCalo) || soCalo < 0 || soCalo > CALO_LON_NHAT) {
    throw new HttpError(400, `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT}`);
  }

  return {
    ngay: ngay,
    loai_bua: loaiBua,
    ten_mon: tenMon.trim(),
    khau_phan: khauPhan,
    so_calo: soCalo,
    dam_g: docSoGam(duLieu.dam_g, 'Đạm'),
    tinh_bot_g: docSoGam(duLieu.tinh_bot_g, 'Tinh bột'),
    beo_g: docSoGam(duLieu.beo_g, 'Béo'),
  };
}

// Lấy nhật ký một ngày: các món, mục tiêu calo và phần tổng hợp
export async function xemNhatKyNgay(nguoiDungId: number, ngay: string): Promise<NhatKyNgay> {
  if (!DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const danhSachBuaAn = await layBuaAnTheoNgay(nguoiDungId, ngay);
  const hoSo = await layHoSo(nguoiDungId);
  return {
    ngay: ngay,
    muc_tieu_calo: hoSo.muc_tieu_calo,
    bua_an: danhSachBuaAn,
    tong_hop: tongHopNgay(danhSachBuaAn, hoSo.muc_tieu_calo),
  };
}

// Lấy các món người này hay ăn, để bấm điền sẵn
export async function xemMonHayAn(nguoiDungId: number): Promise<MonHayAn[]> {
  return layMonHayAn(nguoiDungId, SO_MON_HAY_AN);
}

// Lấy một món để sửa
export async function xemMotBuaAn(nguoiDungId: number, buaAnIdChu: string): Promise<BuaAn> {
  const buaAn = await layMotBuaAn(docBuaAnId(buaAnIdChu), nguoiDungId);
  if (!buaAn) {
    throw new HttpError(404, 'Không tìm thấy món ăn');
  }
  return buaAn;
}

// Kiểm tra rồi thêm một món
export async function ghiBuaAn(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<BuaAn> {
  return themBuaAn(nguoiDungId, kiemTraDuLieuBuaAn(duLieu));
}

// Kiểm tra rồi sửa một món; món không phải của người này thì báo không tìm thấy
export async function capNhatBuaAn(nguoiDungId: number, buaAnIdChu: string, duLieu: Record<string, unknown>): Promise<BuaAn> {
  const buaAn = await suaBuaAn(docBuaAnId(buaAnIdChu), nguoiDungId, kiemTraDuLieuBuaAn(duLieu));
  if (!buaAn) {
    throw new HttpError(404, 'Không tìm thấy món ăn');
  }
  return buaAn;
}

// Xóa một món; món không phải của người này thì báo không tìm thấy
export async function boBuaAn(nguoiDungId: number, buaAnIdChu: string): Promise<void> {
  const daXoa = await xoaBuaAn(docBuaAnId(buaAnIdChu), nguoiDungId);
  if (!daXoa) {
    throw new HttpError(404, 'Không tìm thấy món ăn');
  }
}
