import { layNhomDiUng, layNhomDiUngCuaNguoiDung } from '../di-ung/DiUngQueries.ts';
import type { NhomDiUng } from '../di-ung/DiUngQueries.ts';
import { layHeSoVanDong, layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layCanXuHuongGanNhat, SO_NGAY_XU_HUONG } from '../can-nang/CanNangQueries.ts';
import { layHoSo, luuHoSo } from './HoSoQueries.ts';
import type { HoSo, HoSoDeLuu } from './HoSoQueries.ts';

// Tuổi nhỏ nhất và lớn nhất được dùng app (giống danh sách năm sinh ở app: 83 năm tính từ 18 tuổi)
const TUOI_TOI_THIEU = 18;
const TUOI_TOI_DA = 100;

// Giới hạn chiều cao, cân nặng để chặn gõ nhầm (giống CHECK trong 002_nguoi_dung.sql)
const CHIEU_CAO_NHO_NHAT = 100;
const CHIEU_CAO_LON_NHAT = 250;
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;

// Giới hạn vòng eo để chặn gõ nhầm (giống CHECK trong 002_nguoi_dung.sql)
const VONG_EO_NHO_NHAT = 40;
const VONG_EO_LON_NHAT = 200;

// Dạng ngày năm-tháng-ngày, ví dụ 2004-11-24
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Ô kiêng ăn khác tối đa bao nhiêu ký tự (giống CHECK trong 002_nguoi_dung.sql)
const DI_UNG_KIENG_AN_DAI_NHAT = 200;

// Hồ sơ gửi về app: các cột đã lưu, kèm nhóm dị ứng đã chọn, BMI, BMR (chuyển hóa cơ bản) và TDEE (năng lượng giữ cân)
// Kèm các cờ cho màn Lộ trình làm mờ lựa chọn không hợp (giống rào khi lưu) và cân lý tưởng để điền sẵn cân mục tiêu
type HoSoHienThi = HoSo & {
  nhom_di_ung_da_chon: NhomDiUng[];
  bmi: number | null;
  phan_loai_bmi: string | null;
  chuyen_hoa_co_ban: number | null;
  nang_luong_giu_can: number | null;
  duoc_chon_giam: boolean;
  duoc_chon_tang: boolean;
  duoc_chon_nang: boolean;
  duoc_chon_nhanh_theo_muc: Record<MucVanDong, boolean>;
  can_ly_tuong_kg: number | null;
};

// Những thứ màn hồ sơ cần: ngưỡng BMI và ngưỡng tuổi để làm mờ lựa chọn, 9 nhóm dị ứng để chọn
type LuaChonHoSo = {
  bmi_thieu_can: number;
  bmi_ly_tuong: number;
  tuoi_cao_tuoi: number;
  bmi_thieu_can_cao_tuoi: number;
  tuoi_khong_co_muc_nang: number;
  giam_can_kg_moi_thang_thap: number;
  giam_can_kg_moi_thang_cao: number;
  danh_sach_nhom_di_ung: NhomDiUng[];
};

// Các ngưỡng BMI, lấy từ bảng quy_dinh
export type NguongBmi = {
  thieuCan: number;
  thuaCan: number;
  beoPhiDo1: number;
  beoPhiDo2: number;
};

// BMI = cân nặng (kg) chia bình phương chiều cao (m), làm tròn 1 số lẻ
export function tinhBmi(canNangKg: number, chieuCaoCm: number): number {
  const chieuCaoMet = chieuCaoCm / 100;
  const bmi = canNangKg / (chieuCaoMet * chieuCaoMet);
  return Math.round(bmi * 10) / 10;
}

// Gọi tên mức BMI theo chuẩn cho người châu Á
export function phanLoaiBmi(bmi: number, nguong: NguongBmi): string {
  if (bmi < nguong.thieuCan) {
    return 'Thiếu cân';
  }
  if (bmi < nguong.thuaCan) {
    return 'Bình thường';
  }
  if (bmi < nguong.beoPhiDo1) {
    return 'Thừa cân';
  }
  if (bmi < nguong.beoPhiDo2) {
    return 'Béo phì độ I';
  }
  return 'Béo phì độ II';
}

export type MucTieu = 'giam' | 'giu' | 'tang';

// Thông tin cơ thể và mục tiêu của người dùng
export type ThongTinTinhCalo = {
  tuoi: number;
  chieuCaoCm: number;
  canNangKg: number;
  mucTieu: MucTieu;
};

// Các con số của công thức Ganpule, lấy từ database; hằng số đã chọn đúng theo giới
export type HeSoGanpule = {
  ganpuleHeSoCan: number;
  ganpuleHeSoChieuCao: number;
  ganpuleHeSoTuoi: number;
  ganpuleHangSo: number;
  kjMoiKcal: number;
};

// Các con số lấy từ database, đã chọn đúng theo giới, tuổi, mức vận động và tốc độ giảm cân của người này
export type HeSoTinhCalo = {
  ganpuleHeSoCan: number;
  ganpuleHeSoChieuCao: number;
  ganpuleHeSoTuoi: number;
  ganpuleHangSo: number;
  kjMoiKcal: number;
  heSoVanDong: number;
  bmiLyTuong: number;
  giamCanKcalMoiKg: number;
  // Số kg giảm mỗi tháng theo tốc độ đã chọn (Vừa 2, Nhanh 3) và số kcal bớt mỗi ngày cho mỗi kg/tháng
  soKgGiamMoiThang: number;
  soKcalBotChoMoiKg: number;
};

// Chuyển hóa cơ bản theo công thức Ganpule (kcal/ngày); công thức ra MJ nên nhân 1000 ra kJ rồi đổi sang kcal
export function tinhChuyenHoaCoBan(canNangKg: number, chieuCaoCm: number, tuoi: number, heSo: HeSoGanpule): number {
  const megajoule =
    heSo.ganpuleHeSoCan * canNangKg + heSo.ganpuleHeSoChieuCao * chieuCaoCm - heSo.ganpuleHeSoTuoi * tuoi - heSo.ganpuleHangSo;
  return (megajoule * 1000) / heSo.kjMoiKcal;
}

// Tính mục tiêu calo mỗi ngày (ThuatToan.md bước 6-10), làm tròn tới 1 kcal
export function tinhMucTieuCalo(thongTin: ThongTinTinhCalo, heSo: HeSoTinhCalo): number {
  // Giữ cân: chuyển hóa cơ bản tính theo cân thật x hệ số vận động
  const chuyenHoaCoBan = tinhChuyenHoaCoBan(thongTin.canNangKg, thongTin.chieuCaoCm, thongTin.tuoi, heSo);
  const giuCan = chuyenHoaCoBan * heSo.heSoVanDong;

  // Cân nặng lý tưởng = chiều cao (m) bình phương x BMI lý tưởng
  const chieuCaoMet = thongTin.chieuCaoCm / 100;
  const canNangLyTuong = chieuCaoMet * chieuCaoMet * heSo.bmiLyTuong;

  if (thongTin.mucTieu === 'giu') {
    return Math.round(giuCan);
  }

  // Giảm cân: lấy số lớn hơn giữa mức của QĐ 2892 và mức giữ cân trừ phần bớt theo tốc độ, nhưng không cao hơn mức giữ cân
  if (thongTin.mucTieu === 'giam') {
    const mucQd2892 = canNangLyTuong * heSo.giamCanKcalMoiKg;
    const caloSauKhiBot = giuCan - heSo.soKcalBotChoMoiKg * heSo.soKgGiamMoiThang;
    const mucGiamCan = Math.max(mucQd2892, caloSauKhiBot);
    return Math.round(Math.min(mucGiamCan, giuCan));
  }

  // Tăng cân: ăn như người đã ở cân nặng lý tưởng (chuyển hóa cơ bản tính bằng cân nặng lý tưởng)
  const chuyenHoaCoBanLyTuong = tinhChuyenHoaCoBan(canNangLyTuong, thongTin.chieuCaoCm, thongTin.tuoi, heSo);
  return Math.round(chuyenHoaCoBanLyTuong * heSo.heSoVanDong);
}

export type MucVanDong = 'nhe' | 'trung_binh' | 'nang';

export type TocDoGiamCan = 'vua' | 'nhanh';

// Chọn tốc độ giảm cân để lưu: không gửi thì giữ tốc độ cũ (chưa có thì Vừa); mục tiêu lưu không phải giảm cân thì không có tốc độ
export function chonTocDoGiamCan(tocDoCu: TocDoGiamCan | null, tocDoGuiLen: unknown, mucTieuGuiLen: MucTieu, mucTieuLuu: MucTieu): TocDoGiamCan | null {
  let tocDo: TocDoGiamCan = tocDoCu ?? 'vua';
  if (tocDoGuiLen !== undefined && mucTieuGuiLen === 'giam') {
    if (tocDoGuiLen !== 'vua' && tocDoGuiLen !== 'nhanh') {
      throw new HttpError(400, 'Tốc độ giảm cân không hợp lệ');
    }
    tocDo = tocDoGuiLen;
  }
  if (mucTieuLuu !== 'giam') {
    return null;
  }
  return tocDo;
}

// Nút "Nhanh" chọn được khi bớt đủ số kcal của tốc độ nhanh mà vẫn ăn từ mức tối thiểu (QĐ 2892) trở lên
export function duocChonNhanh(giuCan: number, mucToiThieu: number, kgMoiThangNhanh: number, soKcalBotChoMoiKg: number): boolean {
  return giuCan - mucToiThieu >= kgMoiThangNhanh * soKcalBotChoMoiKg;
}

// Số năm tròn từ ngày sinh tới một ngày (cả hai dạng năm-tháng-ngày); chưa tới sinh nhật năm đó thì trừ 1
export function tinhTuoi(ngaySinh: string, ngay: string): number {
  const [namSinh, thangSinh, ngayTrongThangSinh] = ngaySinh.split('-').map(Number);
  const [nam, thang, ngayTrongThang] = ngay.split('-').map(Number);
  let tuoi = nam - namSinh;
  if (thang < thangSinh || (thang === thangSinh && ngayTrongThang < ngayTrongThangSinh)) {
    tuoi = tuoi - 1;
  }
  return tuoi;
}

// Đọc ngày sinh app gửi lên: phải đúng dạng năm-tháng-ngày và là ngày có thật (không có 30/2); sai thì trả null
export function docNgaySinh(giaTri: unknown): string | null {
  if (typeof giaTri !== 'string' || !DANG_NGAY.test(giaTri)) {
    return null;
  }
  const [nam, thang, ngay] = giaTri.split('-').map(Number);
  const ngayThat = new Date(Date.UTC(nam, thang - 1, ngay));
  if (ngayThat.getUTCMonth() !== thang - 1 || ngayThat.getUTCDate() !== ngay) {
    return null;
  }
  return giaTri;
}

// Ngày hôm nay của server dạng năm-tháng-ngày, theo múi giờ ở biến TZ (giờ Việt Nam)
function layNgayHomNay(): string {
  return new Date().toLocaleDateString('sv-SE');
}

// Đã tới tuổi không còn mức vận động nặng thì tính như trung bình; mức khác giữ nguyên
export function chonMucVanDongTheoTuoi(mucVanDong: MucVanDong, tuoi: number, tuoiKhongCoMucNang: number): MucVanDong {
  if (mucVanDong === 'nang' && tuoi >= tuoiKhongCoMucNang) {
    return 'trung_binh';
  }
  return mucVanDong;
}

// Đọc các mã nhóm dị ứng app gửi lên: không gửi là chưa chọn nhóm nào; sai dạng, mã lạ hoặc trùng thì trả null
export function docMaNhomDiUng(giaTri: unknown, maHopLe: string[]): string[] | null {
  if (giaTri === undefined || giaTri === null) {
    return [];
  }
  if (!Array.isArray(giaTri)) {
    return null;
  }
  const maDaDoc: string[] = [];
  for (const ma of giaTri) {
    if (typeof ma !== 'string' || !maHopLe.includes(ma) || maDaDoc.includes(ma)) {
      return null;
    }
    maDaDoc.push(ma);
  }
  return maDaDoc;
}

// Ngưỡng BMI để kiểm cân mục tiêu: sàn khi giảm cân (người cao tuổi cao hơn) và BMI lý tưởng (trần khi tăng cân)
export type NguongCanMucTieu = {
  bmiSanGiamCan: number;
  bmiLyTuong: number;
};

// Kiểm cân mục tiêu theo hướng giảm / tăng; sai thì trả lời lỗi, đúng thì trả null
export function kiemTraCanMucTieu(
  canMucTieuKg: number,
  mucTieu: 'giam' | 'tang',
  canNangKg: number,
  chieuCaoCm: number,
  nguong: NguongCanMucTieu,
): string | null {
  if (canMucTieuKg < CAN_NANG_NHO_NHAT || canMucTieuKg > CAN_NANG_LON_NHAT) {
    return `Cân mục tiêu từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`;
  }
  const chieuCaoMet = chieuCaoCm / 100;

  // Giảm cân: nhỏ hơn cân hiện tại, không dưới cân ứng với BMI sàn (số trong lời lỗi làm tròn lên để luôn hợp lệ)
  if (mucTieu === 'giam') {
    if (canMucTieuKg >= canNangKg) {
      return 'Cân mục tiêu phải nhỏ hơn cân hiện tại';
    }
    const canSanKg = nguong.bmiSanGiamCan * chieuCaoMet * chieuCaoMet;
    if (canMucTieuKg < canSanKg) {
      const canSanLamTron = Math.ceil(canSanKg * 10) / 10;
      return `Cân mục tiêu thấp nhất là ${canSanLamTron.toLocaleString('vi-VN')} kg`;
    }
    return null;
  }

  // Tăng cân: lớn hơn cân hiện tại, không quá cân lý tưởng (số trong lời lỗi làm tròn xuống để luôn hợp lệ)
  if (canMucTieuKg <= canNangKg) {
    return 'Cân mục tiêu phải lớn hơn cân hiện tại';
  }
  const canLyTuongKg = nguong.bmiLyTuong * chieuCaoMet * chieuCaoMet;
  if (canMucTieuKg > canLyTuongKg) {
    const canLyTuongLamTron = Math.floor(canLyTuongKg * 10) / 10;
    return `Cân mục tiêu cao nhất là ${canLyTuongLamTron.toLocaleString('vi-VN')} kg`;
  }
  return null;
}

// Cân lúc bắt đầu lộ trình: giữ số cũ khi vẫn cùng mục tiêu và cùng cân mục tiêu, đổi thì tính lại từ cân hiện tại
export function chonCanBatDau(
  hoSoCu: HoSo,
  mucTieuMoi: MucTieu,
  canMucTieuMoiKg: number | null,
  canNangHienTaiKg: number,
): number | null {
  if (mucTieuMoi === 'giu' || canMucTieuMoiKg === null) {
    return null;
  }
  if (hoSoCu.muc_tieu === mucTieuMoi && hoSoCu.can_muc_tieu_kg === canMucTieuMoiKg && hoSoCu.can_bat_dau_kg !== null) {
    return hoSoCu.can_bat_dau_kg;
  }
  return canNangHienTaiKg;
}

// Cân giữ quanh khi giữ cân: đang giữ cân từ trước thì giữ số cũ, mới chuyển sang giữ cân thì lấy cân lúc này; không giữ cân thì không có
export function chonCanGiuQuanh(hoSoCu: HoSo, mucTieuMoi: MucTieu, canNangHienTaiKg: number): number | null {
  if (mucTieuMoi !== 'giu') {
    return null;
  }
  if (hoSoCu.muc_tieu === 'giu' && hoSoCu.can_giu_quanh_kg !== null) {
    return hoSoCu.can_giu_quanh_kg;
  }
  return canNangHienTaiKg;
}

// Lấy hồ sơ kèm BMI, phân loại, BMR, TDEE và các nhóm dị ứng đã chọn; chưa thiết lập thì các số này là null
export async function xemHoSo(nguoiDungId: number): Promise<HoSoHienThi> {
  const hoSo = await layHoSo(nguoiDungId);
  const nhomDiUngDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);

  if (
    hoSo.gioi_tinh === null || hoSo.ngay_sinh === null || hoSo.chieu_cao_cm === null ||
    hoSo.can_nang_kg === null || hoSo.muc_van_dong === null
  ) {
    return {
      ...hoSo,
      nhom_di_ung_da_chon: nhomDiUngDaChon,
      bmi: null,
      phan_loai_bmi: null,
      chuyen_hoa_co_ban: null,
      nang_luong_giu_can: null,
      duoc_chon_giam: true,
      duoc_chon_tang: true,
      duoc_chon_nang: true,
      duoc_chon_nhanh_theo_muc: { nhe: true, trung_binh: true, nang: true },
      can_ly_tuong_kg: null,
    };
  }

  const bmi = tinhBmi(hoSo.can_nang_kg, hoSo.chieu_cao_cm);
  const nguong = {
    thieuCan: await layQuyDinh('bmi_thieu_can'),
    thuaCan: await layQuyDinh('bmi_thua_can'),
    beoPhiDo1: await layQuyDinh('bmi_beo_phi_do_1'),
    beoPhiDo2: await layQuyDinh('bmi_beo_phi_do_2'),
  };

  // BMR theo Ganpule, cùng công thức với mục tiêu calo
  const tuoi = tinhTuoi(hoSo.ngay_sinh, layNgayHomNay());
  const chuyenHoaCoBan = tinhChuyenHoaCoBan(hoSo.can_nang_kg, hoSo.chieu_cao_cm, tuoi, {
    ganpuleHeSoCan: await layQuyDinh('ganpule_he_so_can'),
    ganpuleHeSoChieuCao: await layQuyDinh('ganpule_he_so_chieu_cao'),
    ganpuleHeSoTuoi: await layQuyDinh('ganpule_he_so_tuoi'),
    ganpuleHangSo: await layQuyDinh(`ganpule_hang_so_${hoSo.gioi_tinh}`),
    kjMoiKcal: await layQuyDinh('kj_moi_kcal'),
  });

  // TDEE = BMR x hệ số vận động; đã tới tuổi không còn mức nặng thì tính như trung bình (giống lúc ghi cân)
  const tuoiKhongCoMucNang = await layQuyDinh('tuoi_khong_co_muc_nang');
  const mucVanDong = chonMucVanDongTheoTuoi(hoSo.muc_van_dong, tuoi, tuoiKhongCoMucNang);
  const nangLuongGiuCan = chuyenHoaCoBan * (await layHeSoVanDong(mucVanDong, tuoi));

  // Cờ làm mờ lựa chọn, cùng rào với lúc lưu hồ sơ
  const bmiLyTuong = await layQuyDinh('bmi_ly_tuong');
  const chieuCaoMet = hoSo.chieu_cao_cm / 100;
  const canLyTuongKg = chieuCaoMet * chieuCaoMet * bmiLyTuong;

  // Nút "Nhanh" theo từng mức vận động, vì đổi mức vận động thì giữ cân và mức tối thiểu cùng đổi
  const kgMoiThangNhanh = await layQuyDinh('giam_can_kg_moi_thang_cao');
  const soKcalBotChoMoiKg = await layQuyDinh('giam_can_kcal_bot_cho_moi_kg');
  const duocChonNhanhTheoMuc: Record<MucVanDong, boolean> = { nhe: false, trung_binh: false, nang: false };
  const cacMucVanDong: MucVanDong[] = ['nhe', 'trung_binh', 'nang'];
  for (const muc of cacMucVanDong) {
    if (muc === 'nang' && tuoi >= tuoiKhongCoMucNang) {
      continue;
    }
    const giuCanTheoMuc = chuyenHoaCoBan * (await layHeSoVanDong(muc, tuoi));
    const mucToiThieu = canLyTuongKg * (await layQuyDinh(`giam_can_kcal_moi_kg_${muc}`));
    duocChonNhanhTheoMuc[muc] = duocChonNhanh(giuCanTheoMuc, mucToiThieu, kgMoiThangNhanh, soKcalBotChoMoiKg);
  }

  return {
    ...hoSo,
    nhom_di_ung_da_chon: nhomDiUngDaChon,
    bmi: bmi,
    phan_loai_bmi: phanLoaiBmi(bmi, nguong),
    chuyen_hoa_co_ban: Math.round(chuyenHoaCoBan),
    nang_luong_giu_can: Math.round(nangLuongGiuCan),
    duoc_chon_giam: bmi >= (await layNguongGiamCan(tuoi)),
    duoc_chon_tang: bmi < bmiLyTuong,
    duoc_chon_nang: tuoi < tuoiKhongCoMucNang,
    duoc_chon_nhanh_theo_muc: duocChonNhanhTheoMuc,
    can_ly_tuong_kg: Math.round(canLyTuongKg * 10) / 10,
  };
}

// Lấy các lựa chọn cho màn thiết lập / sửa hồ sơ
export async function xemLuaChonHoSo(): Promise<LuaChonHoSo> {
  return {
    bmi_thieu_can: await layQuyDinh('bmi_thieu_can'),
    bmi_ly_tuong: await layQuyDinh('bmi_ly_tuong'),
    tuoi_cao_tuoi: await layQuyDinh('tuoi_cao_tuoi'),
    bmi_thieu_can_cao_tuoi: await layQuyDinh('bmi_thieu_can_cao_tuoi'),
    tuoi_khong_co_muc_nang: await layQuyDinh('tuoi_khong_co_muc_nang'),
    giam_can_kg_moi_thang_thap: await layQuyDinh('giam_can_kg_moi_thang_thap'),
    giam_can_kg_moi_thang_cao: await layQuyDinh('giam_can_kg_moi_thang_cao'),
    danh_sach_nhom_di_ung: await layNhomDiUng(),
  };
}

// BMI thấp nhất được chọn giảm cân: người cao tuổi có ngưỡng riêng, cao hơn
async function layNguongGiamCan(tuoi: number): Promise<number> {
  if (tuoi >= (await layQuyDinh('tuoi_cao_tuoi'))) {
    return layQuyDinh('bmi_thieu_can_cao_tuoi');
  }
  return layQuyDinh('bmi_thieu_can');
}

// Kiểm tra dữ liệu app gửi lên, tính mục tiêu calo, rồi lưu
export async function capNhatHoSo(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<HoSoHienThi> {
  // Bước 1. Kiểm tra từng trường
  const gioiTinh = duLieu.gioi_tinh;
  if (gioiTinh !== 'nam' && gioiTinh !== 'nu') {
    throw new HttpError(400, 'Giới tính không hợp lệ');
  }

  const ngaySinh = docNgaySinh(duLieu.ngay_sinh);
  if (ngaySinh === null) {
    throw new HttpError(400, 'Ngày sinh không hợp lệ');
  }
  const tuoi = tinhTuoi(ngaySinh, layNgayHomNay());
  if (tuoi < TUOI_TOI_THIEU || tuoi > TUOI_TOI_DA) {
    throw new HttpError(400, `Chỉ dành cho người từ ${TUOI_TOI_THIEU} đến ${TUOI_TOI_DA} tuổi`);
  }

  const chieuCaoCm = duLieu.chieu_cao_cm;
  if (typeof chieuCaoCm !== 'number' || chieuCaoCm < CHIEU_CAO_NHO_NHAT || chieuCaoCm > CHIEU_CAO_LON_NHAT) {
    throw new HttpError(400, `Chiều cao từ ${CHIEU_CAO_NHO_NHAT} đến ${CHIEU_CAO_LON_NHAT} cm`);
  }

  const canNangKg = duLieu.can_nang_kg;
  if (typeof canNangKg !== 'number' || canNangKg < CAN_NANG_NHO_NHAT || canNangKg > CAN_NANG_LON_NHAT) {
    throw new HttpError(400, `Cân nặng từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`);
  }

  const mucVanDong = duLieu.muc_van_dong;
  if (mucVanDong !== 'nhe' && mucVanDong !== 'trung_binh' && mucVanDong !== 'nang') {
    throw new HttpError(400, 'Mức vận động không hợp lệ');
  }

  const mucTieu = duLieu.muc_tieu;
  if (mucTieu !== 'giam' && mucTieu !== 'giu' && mucTieu !== 'tang') {
    throw new HttpError(400, 'Mục tiêu không hợp lệ');
  }

  // Kiêng ăn khác (ô chữ) không bắt buộc: không gửi là để trống
  let diUngKiengAn = '';
  if (duLieu.di_ung_kieng_an !== undefined && duLieu.di_ung_kieng_an !== null) {
    if (typeof duLieu.di_ung_kieng_an !== 'string' || duLieu.di_ung_kieng_an.trim().length > DI_UNG_KIENG_AN_DAI_NHAT) {
      throw new HttpError(400, `Kiêng ăn khác tối đa ${DI_UNG_KIENG_AN_DAI_NHAT} ký tự`);
    }
    diUngKiengAn = duLieu.di_ung_kieng_an.trim();
  }

  // Nhóm dị ứng không bắt buộc: chỉ nhận mã có trong bảng nhom_di_ung, không trùng
  const maHopLe = (await layNhomDiUng()).map((nhom) => nhom.ma);
  const maNhomDiUng = docMaNhomDiUng(duLieu.ma_nhom_di_ung, maHopLe);
  if (maNhomDiUng === null) {
    throw new HttpError(400, 'Nhóm dị ứng không hợp lệ');
  }

  // Bước 2. Rào an toàn theo BMI và tuổi, giống lựa chọn bị làm mờ ở app
  const bmi = tinhBmi(canNangKg, chieuCaoCm);
  const nguongGiamCan = await layNguongGiamCan(tuoi);
  const bmiLyTuong = await layQuyDinh('bmi_ly_tuong');
  if (mucTieu === 'giam' && bmi < nguongGiamCan) {
    throw new HttpError(400, `Giảm cân chỉ dành cho BMI từ ${nguongGiamCan.toLocaleString('vi-VN')} trở lên`);
  }
  if (mucTieu === 'tang' && bmi >= bmiLyTuong) {
    throw new HttpError(400, `Tăng cân chỉ dành cho BMI dưới ${bmiLyTuong.toLocaleString('vi-VN')}`);
  }
  const tuoiKhongCoMucNang = await layQuyDinh('tuoi_khong_co_muc_nang');
  if (mucVanDong === 'nang' && tuoi >= tuoiKhongCoMucNang) {
    throw new HttpError(400, `Từ ${tuoiKhongCoMucNang} tuổi chỉ chọn mức vận động nhẹ hoặc trung bình`);
  }

  // Bước 2b. Vòng eo và cân mục tiêu chỉ gửi từ phần "Mục tiêu"; không gửi thì giữ số cũ
  const hoSoCu = await layHoSo(nguoiDungId);
  const nguongCanMucTieu = { bmiSanGiamCan: nguongGiamCan, bmiLyTuong: bmiLyTuong };
  let mucTieuLuu: MucTieu = mucTieu;

  // Cân theo xu hướng (trung bình 7 ngày tới lần cân gần nhất) để xét chạm đích và cân giữ quanh; chưa cân lần nào thì dùng cân vừa gửi
  let canXuHuongKg = canNangKg;
  const canXuHuongDaLuuKg = await layCanXuHuongGanNhat(nguoiDungId, SO_NGAY_XU_HUONG);
  if (canXuHuongDaLuuKg !== null) {
    canXuHuongKg = canXuHuongDaLuuKg;
  }

  // Vòng eo không bắt buộc: gửi null là xóa
  let vongEoCm = hoSoCu.vong_eo_cm;
  if (duLieu.vong_eo_cm !== undefined) {
    vongEoCm = null;
    if (duLieu.vong_eo_cm !== null) {
      if (typeof duLieu.vong_eo_cm !== 'number' || duLieu.vong_eo_cm < VONG_EO_NHO_NHAT || duLieu.vong_eo_cm > VONG_EO_LON_NHAT) {
        throw new HttpError(400, `Vòng eo từ ${VONG_EO_NHO_NHAT} đến ${VONG_EO_LON_NHAT} cm`);
      }
      vongEoCm = duLieu.vong_eo_cm;
    }
  }

  // Cân mục tiêu có gửi: giảm / tăng thì bắt buộc; làm tròn 2 số lẻ như cột trong database rồi mới kiểm hướng
  let canMucTieuKg = hoSoCu.can_muc_tieu_kg;
  if (duLieu.can_muc_tieu_kg !== undefined && mucTieu !== 'giu') {
    if (typeof duLieu.can_muc_tieu_kg !== 'number') {
      throw new HttpError(400, 'Hãy nhập cân mục tiêu');
    }
    canMucTieuKg = Math.round(duLieu.can_muc_tieu_kg * 100) / 100;
    const loiCanMucTieu = kiemTraCanMucTieu(canMucTieuKg, mucTieu, canNangKg, chieuCaoCm, nguongCanMucTieu);
    if (loiCanMucTieu !== null) {
      throw new HttpError(400, loiCanMucTieu);
    }
  }

  // Cân mục tiêu cũ (không gửi) không còn hợp: cân theo xu hướng chạm đích, đổi chiều cao, qua 65 tuổi; thì về giữ cân như lúc ghi cân
  if (duLieu.can_muc_tieu_kg === undefined && mucTieu !== 'giu' && canMucTieuKg !== null) {
    if (kiemTraCanMucTieu(canMucTieuKg, mucTieu, canXuHuongKg, chieuCaoCm, nguongCanMucTieu) !== null) {
      mucTieuLuu = 'giu';
    }
  }

  // Giữ cân thì không có cân mục tiêu; cân lúc bắt đầu giữ nguyên hay tính lại
  if (mucTieuLuu === 'giu') {
    canMucTieuKg = null;
  }

  // Tốc độ giảm cân: không gửi thì giữ tốc độ cũ, chưa có thì Vừa; mục tiêu khác giảm cân thì không có tốc độ
  const tocDoGiamCan = chonTocDoGiamCan(hoSoCu.toc_do_giam_can, duLieu.toc_do_giam_can, mucTieu, mucTieuLuu);
  let kgMoiThang = await layQuyDinh('giam_can_kg_moi_thang_thap');
  if (tocDoGiamCan === 'nhanh') {
    kgMoiThang = await layQuyDinh('giam_can_kg_moi_thang_cao');
  }
  const canBatDauKg = chonCanBatDau(hoSoCu, mucTieuLuu, canMucTieuKg, canNangKg);
  const canGiuQuanhKg = chonCanGiuQuanh(hoSoCu, mucTieuLuu, canXuHuongKg);

  // Bước 3. Tính mục tiêu calo bằng các con số đúng giới, tuổi, mức vận động (ThuatToan.md bước 6-10)
  const mucTieuCalo = tinhMucTieuCalo(
    { tuoi: tuoi, chieuCaoCm: chieuCaoCm, canNangKg: canNangKg, mucTieu: mucTieuLuu },
    {
      ganpuleHeSoCan: await layQuyDinh('ganpule_he_so_can'),
      ganpuleHeSoChieuCao: await layQuyDinh('ganpule_he_so_chieu_cao'),
      ganpuleHeSoTuoi: await layQuyDinh('ganpule_he_so_tuoi'),
      ganpuleHangSo: await layQuyDinh(`ganpule_hang_so_${gioiTinh}`),
      kjMoiKcal: await layQuyDinh('kj_moi_kcal'),
      heSoVanDong: await layHeSoVanDong(mucVanDong, tuoi),
      bmiLyTuong: bmiLyTuong,
      giamCanKcalMoiKg: await layQuyDinh(`giam_can_kcal_moi_kg_${mucVanDong}`),
      soKgGiamMoiThang: kgMoiThang,
      soKcalBotChoMoiKg: await layQuyDinh('giam_can_kcal_bot_cho_moi_kg'),
    },
  );

  // Bước 4. Lưu rồi trả về hồ sơ mới
  const hoSoDeLuu: HoSoDeLuu = {
    gioi_tinh: gioiTinh,
    ngay_sinh: ngaySinh,
    chieu_cao_cm: chieuCaoCm,
    can_nang_kg: canNangKg,
    muc_van_dong: mucVanDong,
    muc_tieu: mucTieuLuu,
    muc_tieu_calo: mucTieuCalo,
    di_ung_kieng_an: diUngKiengAn,
    vong_eo_cm: vongEoCm,
    can_muc_tieu_kg: canMucTieuKg,
    can_bat_dau_kg: canBatDauKg,
    can_giu_quanh_kg: canGiuQuanhKg,
    toc_do_giam_can: tocDoGiamCan,
    ma_nhom_di_ung: maNhomDiUng,
  };
  await luuHoSo(nguoiDungId, hoSoDeLuu);
  return xemHoSo(nguoiDungId);
}

// Ghi cân mới thì cập nhật cân nặng trong hồ sơ và tính lại mục tiêu calo; lựa chọn nào không còn hợp thì về lựa chọn gần nhất
export async function capNhatCanNangHoSo(nguoiDungId: number, canNangKg: number): Promise<void> {
  const hoSo = await layHoSo(nguoiDungId);

  // Chưa thiết lập hồ sơ thì chưa có gì để tính lại
  if (
    hoSo.gioi_tinh === null || hoSo.ngay_sinh === null || hoSo.chieu_cao_cm === null ||
    hoSo.muc_van_dong === null || hoSo.muc_tieu === null
  ) {
    return;
  }
  const tuoi = tinhTuoi(hoSo.ngay_sinh, layNgayHomNay());

  // Giống lựa chọn bị làm mờ ở màn hồ sơ: cân mới làm mục tiêu không còn hợp thì về giữ cân
  const bmi = tinhBmi(canNangKg, hoSo.chieu_cao_cm);
  let mucTieu = hoSo.muc_tieu;
  if (mucTieu === 'giam' && bmi < (await layNguongGiamCan(tuoi))) {
    mucTieu = 'giu';
  }
  if (mucTieu === 'tang' && bmi >= (await layQuyDinh('bmi_ly_tuong'))) {
    mucTieu = 'giu';
  }

  // Đã tới tuổi không còn mức vận động nặng thì về trung bình
  const mucVanDong = chonMucVanDongTheoTuoi(hoSo.muc_van_dong, tuoi, await layQuyDinh('tuoi_khong_co_muc_nang'));

  // Lưu lại bằng đúng đường lưu hồ sơ, nên mục tiêu calo được tính lại theo cân mới; gửi kèm nhóm dị ứng để không bị xóa
  const nhomDiUngDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  await capNhatHoSo(nguoiDungId, {
    gioi_tinh: hoSo.gioi_tinh,
    ngay_sinh: hoSo.ngay_sinh,
    chieu_cao_cm: hoSo.chieu_cao_cm,
    can_nang_kg: canNangKg,
    muc_van_dong: mucVanDong,
    muc_tieu: mucTieu,
    di_ung_kieng_an: hoSo.di_ung_kieng_an,
    ma_nhom_di_ung: nhomDiUngDaChon.map((nhom) => nhom.ma),
  });
}
