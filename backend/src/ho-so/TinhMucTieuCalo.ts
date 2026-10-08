export type MucTieu = 'giam' | 'giu' | 'tang';

// Thông tin cơ thể và mục tiêu của người dùng
export type ThongTinTinhCalo = {
  tuoi: number;
  chieuCaoCm: number;
  canNangKg: number;
  mucTieu: MucTieu;
};

// Các con số lấy từ database, đã chọn đúng theo giới, tuổi và mức vận động của người này
export type HeSoTinhCalo = {
  ganpuleHeSoCan: number;
  ganpuleHeSoChieuCao: number;
  ganpuleHeSoTuoi: number;
  ganpuleHangSo: number;
  kjMoiKcal: number;
  heSoVanDong: number;
  bmiLyTuong: number;
  giamCanKcalMoiKg: number;
  giamCanKcalCatToiDa: number;
};

// Chuyển hóa cơ bản theo công thức Ganpule (kcal/ngày); công thức ra MJ nên nhân 1000 ra kJ rồi đổi sang kcal
function tinhChuyenHoaCoBan(canNangKg: number, chieuCaoCm: number, tuoi: number, heSo: HeSoTinhCalo): number {
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

  // Giảm cân: lấy số lớn hơn giữa mức của QĐ 2892 và mức giữ cân trừ đi phần cắt tối đa
  if (thongTin.mucTieu === 'giam') {
    const mucQd2892 = canNangLyTuong * heSo.giamCanKcalMoiKg;
    const mucCatToiDa = giuCan - heSo.giamCanKcalCatToiDa;
    return Math.round(Math.max(mucQd2892, mucCatToiDa));
  }

  // Tăng cân: ăn như người đã ở cân nặng lý tưởng (chuyển hóa cơ bản tính bằng cân nặng lý tưởng)
  const chuyenHoaCoBanLyTuong = tinhChuyenHoaCoBan(canNangLyTuong, thongTin.chieuCaoCm, thongTin.tuoi, heSo);
  return Math.round(chuyenHoaCoBanLyTuong * heSo.heSoVanDong);
}
