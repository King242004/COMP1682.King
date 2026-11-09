import { layMucTieuVaGioiHan, tongHopNgay } from '../bua-an/BuaAnService.ts';
import type { GioiHanNenHanChe, TongHop } from '../bua-an/BuaAnService.ts';
import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { doiRaSoNgay } from '../tien-do/TienDoService.ts';
import { layMucTieuNuoc } from '../uong-nuoc/UongNuocService.ts';
import { layMonTrongKhoang, layNuocTrongKhoang } from './BaoCaoQueries.ts';
import type { MonTrongKhoang, NuocMotNgay } from './BaoCaoQueries.ts';

// Một lần xem nhiều nhất 31 ngày (tháng dài nhất); là lựa chọn giao diện, không phải luật dinh dưỡng
const SO_NGAY_TOI_DA = 31;

// Ngày phải có dạng 2026-10-27 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Mọi thứ màn Báo cáo dinh dưỡng cần cho một tuần hoặc một tháng
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

// Các con số tóm tắt cả khoảng ngày, gửi thẳng về app
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

// Số kcal mỗi gam và tỷ lệ năng lượng khuyến nghị (%), lấy từ bảng quy_dinh
export type QuyDinhBaoCao = {
  kcalMoiGDam: number;
  kcalMoiGTinhBot: number;
  kcalMoiGBeo: number;
  tyLeTinhBotThap: number;
  tyLeTinhBotCao: number;
  tyLeBeoThap: number;
  tyLeBeoCao: number;
};

// Khoảng ngày phải đúng dạng, ngày đầu không sau ngày cuối, và dài không quá soNgayToiDa ngày
export function kiemTraKhoangNgay(tuNgay: string, denNgay: string, soNgayToiDa: number): void {
  if (!DANG_NGAY.test(tuNgay) || !DANG_NGAY.test(denNgay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const soNgay = doiRaSoNgay(denNgay) - doiRaSoNgay(tuNgay) + 1;
  if (soNgay < 1 || soNgay > soNgayToiDa) {
    throw new HttpError(400, `Chỉ xem được từ 1 đến ${soNgayToiDa} ngày`);
  }
}

// Gom món theo ngày, cộng tổng từng ngày, rồi xét ngày đó có vượt không (vượt là lớn hơn hẳn, bằng thì không tính)
export function tongHopCacNgay(danhSachMon: MonTrongKhoang[], mucTieuCalo: number, gioiHan: GioiHanNenHanChe): NgayBaoCao[] {
  // Gom món cùng ngày vào một nhóm; danh sách đã xếp theo ngày nên các ngày giữ đúng thứ tự
  const monTheoNgay = new Map<string, MonTrongKhoang[]>();
  for (const mon of danhSachMon) {
    const monCuaNgay = monTheoNgay.get(mon.ngay);
    if (monCuaNgay === undefined) {
      monTheoNgay.set(mon.ngay, [mon]);
    } else {
      monCuaNgay.push(mon);
    }
  }

  // Mỗi ngày cộng tổng bằng tongHopNgay như trang chủ, rồi so với mục tiêu calo và giới hạn
  const cacNgay: NgayBaoCao[] = [];
  for (const [ngay, monCuaNgay] of monTheoNgay) {
    const tongHop = tongHopNgay(monCuaNgay, mucTieuCalo);
    cacNgay.push({
      ngay: ngay,
      tong_hop: tongHop,
      ten_mon: monCuaNgay.map((mon) => mon.ten_mon),
      vuot_calo: tongHop.tong_calo > mucTieuCalo,
      vuot_muoi: tongHop.tong_muoi_g > gioiHan.muoi_g_toi_da,
      vuot_duong: tongHop.tong_duong_g > gioiHan.duong_g_toi_da,
      vuot_beo_no: tongHop.tong_beo_no_g > gioiHan.beo_no_g_toi_da,
    });
  }
  return cacNgay;
}

// Tóm tắt các ngày có ghi: calo và đạm trung bình, % năng lượng từ 3 chất so với khuyến nghị, đếm ngày vượt
export function tomTatBaoCao(cacNgay: NgayBaoCao[], damGToiThieu: number, quyDinh: QuyDinhBaoCao): TomTatBaoCao {
  // Cộng calo, 3 chất và đếm ngày vượt qua mọi ngày
  let tongCalo = 0;
  let tongDam = 0;
  let tongTinhBot = 0;
  let tongBeo = 0;
  let soNgayKhongVuot = 0;
  let soNgayVuotMuoi = 0;
  let soNgayVuotDuong = 0;
  let soNgayVuotBeoNo = 0;
  for (const motNgay of cacNgay) {
    tongCalo = tongCalo + motNgay.tong_hop.tong_calo;
    tongDam = tongDam + motNgay.tong_hop.tong_dam_g;
    tongTinhBot = tongTinhBot + motNgay.tong_hop.tong_tinh_bot_g;
    tongBeo = tongBeo + motNgay.tong_hop.tong_beo_g;
    if (!motNgay.vuot_calo) {
      soNgayKhongVuot = soNgayKhongVuot + 1;
    }
    if (motNgay.vuot_muoi) {
      soNgayVuotMuoi = soNgayVuotMuoi + 1;
    }
    if (motNgay.vuot_duong) {
      soNgayVuotDuong = soNgayVuotDuong + 1;
    }
    if (motNgay.vuot_beo_no) {
      soNgayVuotBeoNo = soNgayVuotBeoNo + 1;
    }
  }

  // Trung bình chỉ chia cho số ngày có ghi; chưa ghi ngày nào thì để null
  const soNgayCoGhi = cacNgay.length;
  let caloTrungBinh: number | null = null;
  let damGTrungBinh: number | null = null;
  if (soNgayCoGhi > 0) {
    caloTrungBinh = Math.round(tongCalo / soNgayCoGhi);
    damGTrungBinh = Math.round(tongDam / soNgayCoGhi);
  }

  // Năng lượng từ từng chất, và tổng năng lượng của 3 chất
  const nangLuongDam = tongDam * quyDinh.kcalMoiGDam;
  const nangLuongTinhBot = tongTinhBot * quyDinh.kcalMoiGTinhBot;
  const nangLuongBeo = tongBeo * quyDinh.kcalMoiGBeo;
  const tongNangLuong = nangLuongDam + nangLuongTinhBot + nangLuongBeo;

  // % của từng chất trên tổng 3 chất; xét đạt bằng số chưa làm tròn, khoảng gồm cả hai đầu; chưa có số chất nào thì để null
  let phanTramDam: number | null = null;
  let phanTramTinhBot: number | null = null;
  let phanTramBeo: number | null = null;
  let damDat: boolean | null = null;
  let tinhBotDat: boolean | null = null;
  let beoDat: boolean | null = null;
  if (tongNangLuong > 0) {
    const tyLeTinhBot = (nangLuongTinhBot / tongNangLuong) * 100;
    const tyLeBeo = (nangLuongBeo / tongNangLuong) * 100;
    phanTramDam = Math.round((nangLuongDam / tongNangLuong) * 100);
    phanTramTinhBot = Math.round(tyLeTinhBot);
    phanTramBeo = Math.round(tyLeBeo);
    damDat = tongDam / soNgayCoGhi >= damGToiThieu;
    tinhBotDat = tyLeTinhBot >= quyDinh.tyLeTinhBotThap && tyLeTinhBot <= quyDinh.tyLeTinhBotCao;
    beoDat = tyLeBeo >= quyDinh.tyLeBeoThap && tyLeBeo <= quyDinh.tyLeBeoCao;
  }

  return {
    so_ngay_co_ghi: soNgayCoGhi,
    so_ngay_khong_vuot: soNgayKhongVuot,
    calo_trung_binh: caloTrungBinh,
    dam_g_trung_binh: damGTrungBinh,
    phan_tram_dam: phanTramDam,
    phan_tram_tinh_bot: phanTramTinhBot,
    phan_tram_beo: phanTramBeo,
    dam_dat: damDat,
    tinh_bot_dat: tinhBotDat,
    beo_dat: beoDat,
    so_ngay_vuot_muoi: soNgayVuotMuoi,
    so_ngay_vuot_duong: soNgayVuotDuong,
    so_ngay_vuot_beo_no: soNgayVuotBeoNo,
  };
}

// Lấy báo cáo dinh dưỡng từ tuNgay tới denNgay: từng ngày có ghi món và phần tóm tắt cả khoảng
export async function xemBaoCaoDinhDuong(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<BaoCaoDinhDuong> {
  kiemTraKhoangNgay(tuNgay, denNgay, SO_NGAY_TOI_DA);
  const hoSo = await layHoSo(nguoiDungId);
  if (hoSo.muc_tieu_calo === null || hoSo.can_nang_kg === null) {
    throw new HttpError(400, 'Hãy thiết lập hồ sơ trước để có mục tiêu calo');
  }

  // Hệ số và tỷ lệ năng lượng khuyến nghị từ bảng quy_dinh, giống trang chủ
  const kcalMoiGDam = await layQuyDinh('kcal_moi_g_dam');
  const kcalMoiGTinhBot = await layQuyDinh('kcal_moi_g_tinh_bot');
  const kcalMoiGBeo = await layQuyDinh('kcal_moi_g_beo');
  const tyLeTinhBotThap = await layQuyDinh('ty_le_nang_luong_tinh_bot_thap');
  const tyLeTinhBotCao = await layQuyDinh('ty_le_nang_luong_tinh_bot_cao');
  const tyLeBeoThap = await layQuyDinh('ty_le_nang_luong_beo_thap');
  const tyLeBeoCao = await layQuyDinh('ty_le_nang_luong_beo_cao');

  // Mức đạm tối thiểu và giới hạn muối, đường, béo no mỗi ngày, lấy bằng đúng hàm của trang chủ
  const mucTieuVaGioiHan = await layMucTieuVaGioiHan(hoSo.muc_tieu_calo, hoSo.can_nang_kg);

  // Cộng từng ngày rồi tóm tắt cả khoảng
  const danhSachMon = await layMonTrongKhoang(nguoiDungId, tuNgay, denNgay);
  const cacNgay = tongHopCacNgay(danhSachMon, hoSo.muc_tieu_calo, mucTieuVaGioiHan.gioi_han_nen_han_che);
  const tomTat = tomTatBaoCao(cacNgay, mucTieuVaGioiHan.muc_tieu_chat.dam_g_toi_thieu, {
    kcalMoiGDam: kcalMoiGDam,
    kcalMoiGTinhBot: kcalMoiGTinhBot,
    kcalMoiGBeo: kcalMoiGBeo,
    tyLeTinhBotThap: tyLeTinhBotThap,
    tyLeTinhBotCao: tyLeTinhBotCao,
    tyLeBeoThap: tyLeBeoThap,
    tyLeBeoCao: tyLeBeoCao,
  });

  return {
    tu_ngay: tuNgay,
    den_ngay: denNgay,
    muc_tieu_calo: hoSo.muc_tieu_calo,
    ty_le_tinh_bot_thap: tyLeTinhBotThap,
    ty_le_tinh_bot_cao: tyLeTinhBotCao,
    ty_le_beo_thap: tyLeBeoThap,
    ty_le_beo_cao: tyLeBeoCao,
    cac_ngay: cacNgay,
    tom_tat: tomTat,
  };
}

// Các con số tóm tắt uống nước cả khoảng ngày, gửi thẳng về app
export type TomTatUongNuoc = {
  so_ngay_co_ghi: number;
  so_ngay_dat: number;
  ml_trung_binh: number | null;
};

// Mọi thứ màn Báo cáo uống nước cần cho một tuần hoặc một tháng
export type BaoCaoUongNuoc = {
  tu_ngay: string;
  den_ngay: string;
  muc_tieu_ml: number;
  cac_ngay: NuocMotNgay[];
  tom_tat: TomTatUongNuoc;
};

// Tóm tắt uống nước: đếm ngày đạt (từ mục tiêu trở lên) và trung bình ml, chỉ chia cho số ngày có ghi
export function tomTatUongNuoc(cacNgay: NuocMotNgay[], mucTieuMl: number): TomTatUongNuoc {
  let tongMl = 0;
  let soNgayDat = 0;
  for (const motNgay of cacNgay) {
    tongMl = tongMl + motNgay.so_ml;
    if (motNgay.so_ml >= mucTieuMl) {
      soNgayDat = soNgayDat + 1;
    }
  }

  // Chưa ghi ngày nào thì không có gì để chia
  const soNgayCoGhi = cacNgay.length;
  let mlTrungBinh: number | null = null;
  if (soNgayCoGhi > 0) {
    mlTrungBinh = Math.round(tongMl / soNgayCoGhi);
  }

  return {
    so_ngay_co_ghi: soNgayCoGhi,
    so_ngay_dat: soNgayDat,
    ml_trung_binh: mlTrungBinh,
  };
}

// Lấy báo cáo uống nước từ tuNgay tới denNgay: từng ngày có uống, mục tiêu hiện tại và phần tóm tắt
export async function xemBaoCaoUongNuoc(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<BaoCaoUongNuoc> {
  kiemTraKhoangNgay(tuNgay, denNgay, SO_NGAY_TOI_DA);
  const mucTieu = await layMucTieuNuoc(nguoiDungId, denNgay);
  const cacNgay = await layNuocTrongKhoang(nguoiDungId, tuNgay, denNgay);

  return {
    tu_ngay: tuNgay,
    den_ngay: denNgay,
    muc_tieu_ml: mucTieu.muc_tieu_ml,
    cac_ngay: cacNgay,
    tom_tat: tomTatUongNuoc(cacNgay, mucTieu.muc_tieu_ml),
  };
}
