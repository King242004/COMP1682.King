import type { MucTieu } from '../ho-so/HoSoApi';
import { callApi } from '../shared/apiClient';

// Mức mỡ bụng theo tỉ lệ vòng eo / chiều cao
export type MucEo = 'trong_khuyen_nghi' | 'cao' | 'rat_cao';

// Một mốc của lộ trình giảm cân: tháng thứ mấy, cân nên đạt, đã đạt / đang tới / chưa tới
export type MocLoTrinh = {
  thang: number;
  can_kg: number;
  trang_thai: 'da_dat' | 'dang_toi' | 'chua_toi';
};

// Đã đi được bao nhiêu kg trên tổng số kg cần đi, kèm phần trăm
export type TienDoLoTrinh = {
  so_kg_da_di: number;
  so_kg_can_di: number;
  phan_tram: number;
};

// Cân gần đây so với khoảng giữ cân: trong khoảng, cao hơn hay thấp hơn
export type TrangThaiGiuCan = 'trong_khoang' | 'cao_hon' | 'thap_hon';

// Khoảng giữ cân: giữ quanh cân nào, cân thấp nhất và cao nhất của khoảng, cân gần đây đang ở đâu
export type KhoangGiu = {
  can_giu_quanh_kg: number;
  thap_nhat_kg: number;
  cao_nhat_kg: number;
  trang_thai: TrangThaiGiuCan;
};

// Lộ trình server gửi về; cân theo kg, vòng eo theo cm
export type LoTrinh = {
  muc_tieu: MucTieu;
  // Cân theo xu hướng (trung bình 7 ngày tới lần cân gần nhất); chưa cân lần nào thì bằng cân trong hồ sơ
  can_gan_nhat_kg: number;
  chieu_cao_cm: number;
  bmi: number;
  phan_loai_bmi: string;
  bmi_binh_thuong: boolean;
  vong_eo_cm: number | null;
  // Tỉ lệ vòng eo / chiều cao; null khi chưa nhập vòng eo hoặc BMI từ bmi_toi_da_dung_eo
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
  khoang_giu: KhoangGiu | null;
  // Số kg giảm mỗi tháng app ước tính khi giảm cân
  kg_moi_thang: number;
  muc_tieu_calo: number;
  phut_van_dong_moi_ngay: number;
};

// Lấy lộ trình của người đang đăng nhập
export async function layLoTrinh(): Promise<LoTrinh> {
  const ketQua = await callApi('GET', '/lo-trinh');
  return ketQua as LoTrinh;
}
