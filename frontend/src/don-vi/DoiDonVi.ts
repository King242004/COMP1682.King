// Hai lựa chọn đơn vị: Mét (kg, cm, g) hoặc Anh-Mỹ (lb, ft-in, oz)
export type DonVi = 'met' | 'anh_my';

// Bốn số đổi, server lấy từ bảng quy_dinh (NIST Handbook 44, Phụ lục C)
export type HeSoDonVi = {
  kgMoiPound: number;
  cmMoiInch: number;
  inchMoiFoot: number;
  gamMoiOunce: number;
};

// Ba loại số có giới hạn nhập: cân nặng, chiều cao, lượng thức ăn
type LoaiGioiHan = 'can_nang' | 'chieu_cao' | 'khoi_luong';

// Tên đơn vị gốc (Mét) của từng loại
const TEN_DON_VI_MET: Record<LoaiGioiHan, string> = { can_nang: 'kg', chieu_cao: 'cm', khoi_luong: 'g' };

// Làm tròn 1 số lẻ rồi viết kiểu Việt Nam, ví dụ 110,2
function vietMotSoLe(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Đọc số người dùng gõ (nhận dấu phẩy); trống hoặc không phải số thì null
function docSo(chu: string): number | null {
  if (chu.trim() === '') {
    return null;
  }
  const so = Number(chu.replace(',', '.'));
  if (Number.isNaN(so)) {
    return null;
  }
  return so;
}

// Tách tổng số inch thành số ft và số in, ví dụ 67 in thành 5 ft 7 in
function tachFeetInch(tongInch: number, heSo: HeSoDonVi): { feet: number; inch: number } {
  const feet = Math.floor(tongInch / heSo.inchMoiFoot);
  return { feet: feet, inch: tongInch - feet * heSo.inchMoiFoot };
}

// Viết tổng số inch thành "5 ft 7 in"
function vietFeetInch(tongInch: number, heSo: HeSoDonVi): string {
  const feetInch = tachFeetInch(tongInch, heSo);
  return `${feetInch.feet} ft ${feetInch.inch} in`;
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
    return vietFeetInch(Math.round(cm / heSo.cmMoiInch), heSo);
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

// Số cân theo đơn vị (làm tròn 1 số lẻ), để điền sẵn ô và vẽ trục biểu đồ
export function doiKgRaDonVi(kg: number, donVi: DonVi, heSo: HeSoDonVi | null): number {
  if (donVi === 'anh_my' && heSo !== null) {
    return Math.round((kg / heSo.kgMoiPound) * 10) / 10;
  }
  return Math.round(kg * 10) / 10;
}

// Đổi cm ra số ft và số in để điền 2 ô chiều cao; làm tròn tổng số inch trước rồi mới tách ft
export function doiCmRaFeetInch(cm: number, heSo: HeSoDonVi): { feet: number; inch: number } {
  return tachFeetInch(Math.round(cm / heSo.cmMoiInch), heSo);
}

// Số lượng thức ăn theo đơn vị (oz làm tròn 1 số lẻ), để điền sẵn ô
export function doiGamRaDonVi(gam: number, donVi: DonVi, heSo: HeSoDonVi | null): number {
  if (donVi === 'anh_my' && heSo !== null) {
    return Math.round((gam / heSo.gamMoiOunce) * 10) / 10;
  }
  return gam;
}

// Đọc cân nặng người dùng gõ (kg hoặc lb) ra kg; không làm tròn để kiểm giới hạn cho đúng
export function docCanNang(chu: string, donVi: DonVi, heSo: HeSoDonVi | null): number | null {
  const so = docSo(chu);
  if (so === null) {
    return null;
  }
  if (donVi === 'anh_my' && heSo !== null) {
    return so * heSo.kgMoiPound;
  }
  return so;
}

// Đọc chiều cao 2 ô ft và in ra cm (1 số lẻ); inch trống là 0; ft phải là số nguyên, inch từ 0 đến 11
export function docChieuCaoFeetInch(feet: string, inch: string, heSo: HeSoDonVi): number | null {
  const feetSo = docSo(feet);
  let inchSo: number | null = 0;
  if (inch.trim() !== '') {
    inchSo = docSo(inch);
  }
  if (feetSo === null || inchSo === null || !Number.isInteger(feetSo) || feetSo < 0) {
    return null;
  }
  if (!Number.isInteger(inchSo) || inchSo < 0 || inchSo >= heSo.inchMoiFoot) {
    return null;
  }
  return Math.round((feetSo * heSo.inchMoiFoot + inchSo) * heSo.cmMoiInch * 10) / 10;
}

// Đọc lượng thức ăn người dùng gõ (g hoặc oz) ra g; oz đổi ra g làm tròn 1 số lẻ
export function docKhoiLuong(chu: string, donVi: DonVi, heSo: HeSoDonVi | null): number | null {
  const so = docSo(chu);
  if (so === null) {
    return null;
  }
  if (donVi === 'anh_my' && heSo !== null) {
    return Math.round(so * heSo.gamMoiOunce * 10) / 10;
  }
  return so;
}

// Giới hạn nhập viết theo đơn vị, ví dụ "từ 66,2 đến 661,3 lb"; cận dưới làm tròn lên, cận trên làm tròn xuống để số hiện ra luôn hợp lệ
export function vietGioiHan(nhoNhatGoc: number, lonNhatGoc: number, loai: LoaiGioiHan, donVi: DonVi, heSo: HeSoDonVi | null): string {
  if (donVi === 'met' || heSo === null) {
    return `từ ${nhoNhatGoc.toLocaleString('vi-VN')} đến ${lonNhatGoc.toLocaleString('vi-VN')} ${TEN_DON_VI_MET[loai]}`;
  }

  // Chiều cao: làm tròn theo số inch nguyên rồi viết ft-in
  if (loai === 'chieu_cao') {
    const inchNhoNhat = Math.ceil(nhoNhatGoc / heSo.cmMoiInch);
    const inchLonNhat = Math.floor(lonNhatGoc / heSo.cmMoiInch);
    return `từ ${vietFeetInch(inchNhoNhat, heSo)} đến ${vietFeetInch(inchLonNhat, heSo)}`;
  }

  // Cân nặng ra lb, lượng thức ăn ra oz, 1 số lẻ
  let heSoDoi = heSo.gamMoiOunce;
  let tenDonVi = 'oz';
  if (loai === 'can_nang') {
    heSoDoi = heSo.kgMoiPound;
    tenDonVi = 'lb';
  }
  const nhoNhat = Math.ceil((nhoNhatGoc / heSoDoi) * 10) / 10;
  const lonNhat = Math.floor((lonNhatGoc / heSoDoi) * 10) / 10;
  return `từ ${nhoNhat.toLocaleString('vi-VN')} đến ${lonNhat.toLocaleString('vi-VN')} ${tenDonVi}`;
}
