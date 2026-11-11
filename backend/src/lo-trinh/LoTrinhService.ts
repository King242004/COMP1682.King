import { phanLoaiBmi, tinhBmi, xemHoSo } from '../ho-so/HoSoService.ts';
import type { MucTieu } from '../ho-so/HoSoService.ts';
import { layQuyDinh } from '../quy-dinh/QuyDinhQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { layCanXuHuongGanNhat, SO_NGAY_XU_HUONG } from '../can-nang/CanNangQueries.ts';

// Mức mỡ bụng theo tỉ lệ vòng eo / chiều cao (NICE NG246)
export type MucEo = 'trong_khuyen_nghi' | 'cao' | 'rat_cao';

// Trạng thái một mốc: cân gần nhất đã tới, mốc đang nhắm tới, hay mốc còn ở sau
type TrangThaiMoc = 'da_dat' | 'dang_toi' | 'chua_toi';

// Một mốc của lộ trình giảm cân: tháng thứ mấy và cân nên đạt
export type MocLoTrinh = {
  thang: number;
  can_kg: number;
  trang_thai: TrangThaiMoc;
};

// Đã đi được bao nhiêu kg trên tổng số kg cần đi, kèm phần trăm
export type TienDoLoTrinh = {
  so_kg_da_di: number;
  so_kg_can_di: number;
  phan_tram: number;
};

// Cân gần đây so với khoảng giữ cân: trong khoảng, cao hơn hay thấp hơn
type TrangThaiGiuCan = 'trong_khoang' | 'cao_hon' | 'thap_hon';

// Khoảng giữ cân: giữ quanh cân nào, cân thấp nhất và cao nhất của khoảng, cân gần đây đang ở đâu
export type KhoangGiuCan = {
  can_giu_quanh_kg: number;
  thap_nhat_kg: number;
  cao_nhat_kg: number;
  trang_thai: TrangThaiGiuCan;
};

// Lộ trình gửi về app: thể trạng, đích, tiến độ, các mốc và các số để viết phần ưu tiên
type LoTrinh = {
  muc_tieu: MucTieu;
  // Cân theo xu hướng (trung bình 7 ngày tới lần cân gần nhất); chưa cân lần nào thì bằng cân trong hồ sơ
  can_gan_nhat_kg: number;
  chieu_cao_cm: number;
  bmi: number;
  phan_loai_bmi: string;
  bmi_binh_thuong: boolean;
  vong_eo_cm: number | null;
  // Tỉ lệ vòng eo / chiều cao, 2 số lẻ; null khi chưa nhập vòng eo hoặc BMI từ bmi_toi_da_dung_eo
  ti_le_eo: number | null;
  muc_eo: MucEo | null;
  bmi_toi_da_dung_eo: number;
  cau_nhan_xet: string;
  can_canh_bao: boolean;
  vong_eo_dich_cm: number;
  can_muc_tieu_kg: number | null;
  can_bat_dau_kg: number | null;
  // Chỉ có khi giảm / tăng và đã đặt cân mục tiêu; số tháng và các mốc chỉ có khi giảm cân
  tien_do: TienDoLoTrinh | null;
  so_thang: number | null;
  cac_moc: MocLoTrinh[];
  // Chỉ có khi giữ cân
  khoang_giu: KhoangGiuCan | null;
  kg_moi_thang: number;
  muc_tieu_calo: number;
  phut_van_dong_moi_ngay: number;
};

// Chữ của từng mức eo khi ghép vào câu nhận xét
const CHU_MUC_EO: Record<MucEo, string> = {
  trong_khuyen_nghi: 'vòng eo trong khuyến nghị',
  cao: 'mỡ bụng cao hơn khuyến nghị',
  rat_cao: 'mỡ bụng rất cao',
};

// Gọi tên mức mỡ bụng theo tỉ lệ vòng eo / chiều cao
export function phanLoaiEo(tiLeEo: number, nguong: { cao: number; ratCao: number }): MucEo {
  if (tiLeEo >= nguong.ratCao) {
    return 'rat_cao';
  }
  if (tiLeEo >= nguong.cao) {
    return 'cao';
  }
  return 'trong_khuyen_nghi';
}

// Câu nhận xét = nhãn BMI + nhãn eo; "Bình thường" đứng một mình không thành câu nên viết rõ là cân nặng
export function vietCauNhanXet(phanLoaiBmi: string, mucEo: MucEo | null): string {
  let nhanBmi = phanLoaiBmi;
  if (phanLoaiBmi === 'Bình thường') {
    nhanBmi = 'Cân nặng bình thường';
  }
  if (mucEo === null) {
    return nhanBmi;
  }
  return `${nhanBmi}, ${CHU_MUC_EO[mucEo]}`;
}

// Tốc độ giảm cân thật (kg mỗi tháng): phần calo bớt so với giữ cân chia số kcal ứng với 1 kg/tháng, làm tròn 1 số lẻ
export function tinhSoKgGiamMoiThang(giuCan: number, mucTieuCalo: number, soKcalBotChoMoiKg: number): number {
  const kcalBot = Math.max(giuCan - mucTieuCalo, 0);
  return Math.round((kcalBot / soKcalBotChoMoiKg) * 10) / 10;
}

// Số tháng giảm cân: số kg cần giảm chia tốc độ, làm tròn lên; tốc độ bằng 0 thì không tính được
export function tinhSoThang(soKg: number, kgMoiThang: number): number | null {
  if (kgMoiThang <= 0) {
    return null;
  }
  return Math.ceil(soKg / kgMoiThang);
}

// Các mốc giảm cân theo tháng: mỗi tháng trừ kgMoiThang, mốc cuối là cân mục tiêu
export function tinhCacMoc(canBatDauKg: number, canMucTieuKg: number, canGanNhatKg: number, kgMoiThang: number): MocLoTrinh[] {
  // Cân của từng mốc, làm tròn 2 số lẻ như cân trong database
  const cacCan: number[] = [];
  let canMoc = Math.round((canBatDauKg - kgMoiThang) * 100) / 100;
  while (canMoc > canMucTieuKg) {
    cacCan.push(canMoc);
    canMoc = Math.round((canMoc - kgMoiThang) * 100) / 100;
  }
  cacCan.push(canMucTieuKg);

  // Mốc đạt khi cân gần nhất đã xuống tới mốc; mốc chưa đạt đầu tiên là mốc đang tới
  const cacMoc: MocLoTrinh[] = [];
  let daCoMocDangToi = false;
  let thang = 1;
  for (const canKg of cacCan) {
    let trangThai: TrangThaiMoc = 'chua_toi';
    if (canGanNhatKg <= canKg) {
      trangThai = 'da_dat';
    } else if (!daCoMocDangToi) {
      trangThai = 'dang_toi';
      daCoMocDangToi = true;
    }
    cacMoc.push({ thang: thang, can_kg: canKg, trang_thai: trangThai });
    thang = thang + 1;
  }
  return cacMoc;
}

// Tiến độ từ cân lúc bắt đầu tới cân gần nhất, tính theo hướng giảm hay tăng
export function tinhTienDo(mucTieu: 'giam' | 'tang', canBatDauKg: number, canMucTieuKg: number, canGanNhatKg: number): TienDoLoTrinh {
  let soKgCanDi = canBatDauKg - canMucTieuKg;
  let soKgDaDi = canBatDauKg - canGanNhatKg;
  if (mucTieu === 'tang') {
    soKgCanDi = canMucTieuKg - canBatDauKg;
    soKgDaDi = canGanNhatKg - canBatDauKg;
  }

  // Đi ngược hướng thì là 0, đi quá đích thì bằng số kg cần đi
  soKgDaDi = Math.min(Math.max(soKgDaDi, 0), soKgCanDi);
  return {
    so_kg_da_di: Math.round(soKgDaDi * 100) / 100,
    so_kg_can_di: Math.round(soKgCanDi * 100) / 100,
    phan_tram: Math.round((soKgDaDi / soKgCanDi) * 100),
  };
}

// Khoảng giữ cân = cân giữ quanh cộng trừ tỉ lệ dao động, làm tròn 2 số lẻ; cân gần đây ra ngoài khoảng là cao hơn hoặc thấp hơn
export function tinhKhoangGiu(canGiuQuanhKg: number, canGanNhatKg: number, tyLeDaoDong: number): KhoangGiuCan {
  const thapNhatKg = Math.round(canGiuQuanhKg * (1 - tyLeDaoDong) * 100) / 100;
  const caoNhatKg = Math.round(canGiuQuanhKg * (1 + tyLeDaoDong) * 100) / 100;
  let trangThai: TrangThaiGiuCan = 'trong_khoang';
  if (canGanNhatKg > caoNhatKg) {
    trangThai = 'cao_hon';
  }
  if (canGanNhatKg < thapNhatKg) {
    trangThai = 'thap_hon';
  }
  return {
    can_giu_quanh_kg: canGiuQuanhKg,
    thap_nhat_kg: thapNhatKg,
    cao_nhat_kg: caoNhatKg,
    trang_thai: trangThai,
  };
}

// Tính lộ trình của một người từ hồ sơ và các số trong bảng quy_dinh
export async function xemLoTrinh(nguoiDungId: number): Promise<LoTrinh> {
  // Hồ sơ kèm TDEE (năng lượng giữ cân) để tính tốc độ thật
  const hoSo = await xemHoSo(nguoiDungId);
  if (hoSo.chieu_cao_cm === null || hoSo.can_nang_kg === null || hoSo.muc_tieu === null || hoSo.muc_tieu_calo === null) {
    throw new HttpError(400, 'Hãy thiết lập hồ sơ trước để có lộ trình');
  }

  // BMI và tên mức theo chuẩn người châu Á, giống màn Hồ sơ
  const bmi = tinhBmi(hoSo.can_nang_kg, hoSo.chieu_cao_cm);
  const nguongBmi = {
    thieuCan: await layQuyDinh('bmi_thieu_can'),
    thuaCan: await layQuyDinh('bmi_thua_can'),
    beoPhiDo1: await layQuyDinh('bmi_beo_phi_do_1'),
    beoPhiDo2: await layQuyDinh('bmi_beo_phi_do_2'),
  };
  const phanLoai = phanLoaiBmi(bmi, nguongBmi);
  const bmiBinhThuong = bmi >= nguongBmi.thieuCan && bmi < nguongBmi.thuaCan;

  // Tỉ lệ vòng eo / chiều cao chỉ dùng khi đã nhập vòng eo và BMI dưới mức NICE cho phép
  const bmiToiDaDungEo = await layQuyDinh('bmi_toi_da_dung_eo');
  const eoChieuCaoCao = await layQuyDinh('eo_chieu_cao_cao');
  let tiLeEo: number | null = null;
  let mucEo: MucEo | null = null;
  if (hoSo.vong_eo_cm !== null && bmi < bmiToiDaDungEo) {
    tiLeEo = Math.round((hoSo.vong_eo_cm / hoSo.chieu_cao_cm) * 100) / 100;
    mucEo = phanLoaiEo(tiLeEo, { cao: eoChieuCaoCao, ratCao: await layQuyDinh('eo_chieu_cao_rat_cao') });
  }

  // Tô màu cảnh báo khi BMI ngoài mức bình thường hoặc mỡ bụng cao
  const canCanhBao = !bmiBinhThuong || mucEo === 'cao' || mucEo === 'rat_cao';

  // Cân gần đây theo xu hướng để tính tiến độ, mốc và giữ cân; chưa cân lần nào thì dùng cân trong hồ sơ
  let canGanNhatKg = hoSo.can_nang_kg;
  const canXuHuongKg = await layCanXuHuongGanNhat(nguoiDungId, SO_NGAY_XU_HUONG);
  if (canXuHuongKg !== null) {
    canGanNhatKg = canXuHuongKg;
  }

  // Lộ trình chỉ có khi giảm / tăng và đã đặt cân mục tiêu; riêng giảm cân có số tháng và các mốc
  // Tốc độ thật lấy từ phần calo bớt thật, nên luôn khớp mục tiêu calo (kể cả khi mức tối thiểu QĐ 2892 chặn)
  let kgMoiThang = 0;
  if (hoSo.muc_tieu === 'giam' && hoSo.nang_luong_giu_can !== null) {
    kgMoiThang = tinhSoKgGiamMoiThang(hoSo.nang_luong_giu_can, hoSo.muc_tieu_calo, await layQuyDinh('giam_can_kcal_bot_cho_moi_kg'));
  }
  let tienDo: TienDoLoTrinh | null = null;
  let soThang: number | null = null;
  let cacMoc: MocLoTrinh[] = [];
  if (hoSo.muc_tieu !== 'giu' && hoSo.can_muc_tieu_kg !== null && hoSo.can_bat_dau_kg !== null) {
    tienDo = tinhTienDo(hoSo.muc_tieu, hoSo.can_bat_dau_kg, hoSo.can_muc_tieu_kg, canGanNhatKg);
    if (hoSo.muc_tieu === 'giam') {
      soThang = tinhSoThang(tienDo.so_kg_can_di, kgMoiThang);
      if (kgMoiThang > 0) {
        cacMoc = tinhCacMoc(hoSo.can_bat_dau_kg, hoSo.can_muc_tieu_kg, canGanNhatKg, kgMoiThang);
      }
    }
  }

  // Giữ cân: khoảng ±tỉ lệ quanh cân giữ quanh
  let khoangGiu: KhoangGiuCan | null = null;
  if (hoSo.muc_tieu === 'giu' && hoSo.can_giu_quanh_kg !== null) {
    khoangGiu = tinhKhoangGiu(hoSo.can_giu_quanh_kg, canGanNhatKg, await layQuyDinh('giu_can_ty_le_dao_dong'));
  }

  return {
    muc_tieu: hoSo.muc_tieu,
    can_gan_nhat_kg: canGanNhatKg,
    chieu_cao_cm: hoSo.chieu_cao_cm,
    bmi: bmi,
    phan_loai_bmi: phanLoai,
    bmi_binh_thuong: bmiBinhThuong,
    vong_eo_cm: hoSo.vong_eo_cm,
    ti_le_eo: tiLeEo,
    muc_eo: mucEo,
    bmi_toi_da_dung_eo: bmiToiDaDungEo,
    cau_nhan_xet: vietCauNhanXet(phanLoai, mucEo),
    can_canh_bao: canCanhBao,
    vong_eo_dich_cm: Math.round(hoSo.chieu_cao_cm * eoChieuCaoCao * 10) / 10,
    can_muc_tieu_kg: hoSo.can_muc_tieu_kg,
    can_bat_dau_kg: hoSo.can_bat_dau_kg,
    tien_do: tienDo,
    so_thang: soThang,
    cac_moc: cacMoc,
    khoang_giu: khoangGiu,
    kg_moi_thang: kgMoiThang,
    muc_tieu_calo: hoSo.muc_tieu_calo,
    phut_van_dong_moi_ngay: await layQuyDinh('phut_van_dong_moi_ngay'),
  };
}
