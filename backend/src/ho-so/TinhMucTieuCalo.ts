export type MucTieu = 'giam' | 'giu' | 'tang';

// Thông tin cơ thể và mục tiêu của người dùng
export type ThongTinTinhCalo = {
  canNangKg: number;
  chieuCaoCm: number;
  mucTieu: MucTieu;
};

// Các con số lấy từ database, đã chọn đúng theo tuổi, giới và mức vận động của người này
export type HeSoTinhCalo = {
  kcalMoiKg: number;
  heSoVanDong: number;
  bmiLyTuong: number;
  giamCanKcalMoiKg: number;
};

// Tính mục tiêu calo mỗi ngày theo Bộ Y tế 2016 (giữ cân) và QĐ 2892 (giảm cân), làm tròn tới 1 kcal
export function tinhMucTieuCalo(thongTin: ThongTinTinhCalo, heSo: HeSoTinhCalo): number {
  // Năng lượng cơ thể cần khi nằm yên
  const chuyenHoaCoBan = heSo.kcalMoiKg * thongTin.canNangKg;

  // Cân nặng lý tưởng = chiều cao (m) bình phương x BMI lý tưởng
  const chieuCaoMet = thongTin.chieuCaoCm / 100;
  const canNangLyTuong = chieuCaoMet * chieuCaoMet * heSo.bmiLyTuong;

  // Giữ cân: chuyển hóa cơ bản x hệ số vận động
  if (thongTin.mucTieu === 'giu') {
    return Math.round(chuyenHoaCoBan * heSo.heSoVanDong);
  }

  // Giảm cân: cân nặng lý tưởng x kcal cho mỗi kg (QĐ 2892)
  if (thongTin.mucTieu === 'giam') {
    return Math.round(canNangLyTuong * heSo.giamCanKcalMoiKg);
  }

  // Tăng cân: ăn theo nhu cầu giữ cân của cân nặng lý tưởng
  return Math.round(heSo.kcalMoiKg * canNangLyTuong * heSo.heSoVanDong);
}
