import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layDonVi, luuDonVi } from './DonViQueries.ts';

// Hai lựa chọn đơn vị: Mét (kg, cm, g) hoặc Anh-Mỹ (lb, ft-in, oz)
export type DonVi = 'met' | 'anh_my';

// Bốn số đổi, lấy từ bảng quy_dinh (NIST Handbook 44, Phụ lục C)
export type HeSoDonVi = {
  kgMoiPound: number;
  cmMoiInch: number;
  inchMoiFoot: number;
  gamMoiOunce: number;
};

// Làm tròn 1 số lẻ rồi viết kiểu Việt Nam, ví dụ 110,2
function vietMotSoLe(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Đọc đơn vị app gửi lên: chỉ nhận đúng 2 giá trị, còn lại trả null
export function docDonVi(giaTri: unknown): DonVi | null {
  if (giaTri === 'met' || giaTri === 'anh_my') {
    return giaTri;
  }
  return null;
}

// Cân nặng theo đơn vị: "50 kg" hoặc "110,2 lb"; chưa có hệ số thì viết theo Mét
export function vietCanNang(kg: number, donVi: DonVi, heSo: HeSoDonVi | null): string {
  if (donVi === 'anh_my' && heSo !== null) {
    return `${vietMotSoLe(kg / heSo.kgMoiPound)} lb`;
  }
  return `${vietMotSoLe(kg)} kg`;
}

// Cân thay đổi có dấu: "+0,9 lb", "−1 kg", "0 kg"
export function vietThayDoiCanNang(kg: number, donVi: DonVi, heSo: HeSoDonVi | null): string {
  let soDoi = kg;
  let tenDonVi = 'kg';
  if (donVi === 'anh_my' && heSo !== null) {
    soDoi = kg / heSo.kgMoiPound;
    tenDonVi = 'lb';
  }
  const soLamTron = Math.round(soDoi * 10) / 10;
  if (soLamTron > 0) {
    return `+${soLamTron.toLocaleString('vi-VN')} ${tenDonVi}`;
  }
  if (soLamTron < 0) {
    return `−${Math.abs(soLamTron).toLocaleString('vi-VN')} ${tenDonVi}`;
  }
  return `0 ${tenDonVi}`;
}

// Chiều cao theo đơn vị: "170 cm" hoặc "5 ft 7 in"; làm tròn tổng số inch trước rồi mới tách ft, nên không có "12 in"
export function vietChieuCao(cm: number, donVi: DonVi, heSo: HeSoDonVi | null): string {
  if (donVi === 'anh_my' && heSo !== null) {
    const tongInch = Math.round(cm / heSo.cmMoiInch);
    const feet = Math.floor(tongInch / heSo.inchMoiFoot);
    const inch = tongInch - feet * heSo.inchMoiFoot;
    return `${feet} ft ${inch} in`;
  }
  return `${vietMotSoLe(cm)} cm`;
}

// Lượng thức ăn theo đơn vị: "150 g" hoặc "5,3 oz"
export function vietKhoiLuong(gam: number, donVi: DonVi, heSo: HeSoDonVi | null): string {
  if (donVi === 'anh_my' && heSo !== null) {
    return `${vietMotSoLe(gam / heSo.gamMoiOunce)} oz`;
  }
  return `${vietMotSoLe(gam)} g`;
}

// Câu dặn AI viết theo đơn vị Anh-Mỹ; Mét thì không cần dặn
export function vietLoiDanDonViChoAi(donVi: DonVi): string {
  if (donVi === 'anh_my') {
    return 'Người dùng dùng đơn vị Anh-Mỹ: khi viết cân nặng dùng lb, chiều cao dùng ft và in, lượng thức ăn và nguyên liệu dùng oz; đạm, tinh bột, béo, muối, đường vẫn ghi g; năng lượng ghi kcal.';
  }
  return '';
}

// Đơn vị đang chọn kèm 4 số đổi, gửi về app
type DonViHienThi = {
  don_vi: DonVi;
  he_so: HeSoDonVi;
};

// Lấy 4 số đổi từ bảng quy_dinh
export async function layHeSoDonVi(): Promise<HeSoDonVi> {
  return {
    kgMoiPound: await layQuyDinh('kg_moi_pound'),
    cmMoiInch: await layQuyDinh('cm_moi_inch'),
    inchMoiFoot: await layQuyDinh('inch_moi_foot'),
    gamMoiOunce: await layQuyDinh('gam_moi_ounce'),
  };
}

// Xem đơn vị của người dùng và 4 số đổi
export async function xemDonVi(nguoiDungId: number): Promise<DonViHienThi> {
  return { don_vi: await layDonVi(nguoiDungId), he_so: await layHeSoDonVi() };
}

// Đổi đơn vị: chỉ nhận met hoặc anh_my
export async function capNhatDonVi(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<DonViHienThi> {
  const donVi = docDonVi(duLieu.don_vi);
  if (donVi === null) {
    throw new HttpError(400, 'Đơn vị không hợp lệ');
  }
  await luuDonVi(nguoiDungId, donVi);
  return xemDonVi(nguoiDungId);
}
