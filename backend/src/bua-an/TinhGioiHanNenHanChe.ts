// Giới hạn muối và tỷ lệ năng lượng tối đa (%), số kcal mỗi gam, lấy từ bảng quy_dinh
export type QuyDinhNenHanChe = {
  muoiToiDaG: number;
  tyLeDuongToiDa: number;
  tyLeBeoNoToiDa: number;
  kcalMoiGDuong: number;
  kcalMoiGBeo: number;
};

// Số gam tối đa mỗi ngày cho muối, đường, béo no, gửi thẳng về app
export type GioiHanNenHanChe = {
  muoi_g_toi_da: number;
  duong_g_toi_da: number;
  beo_no_g_toi_da: number;
};

// Muối có giới hạn cố định; đường và béo no tính theo % mục tiêu calo rồi đổi ra gam
export function tinhGioiHanNenHanChe(mucTieuCalo: number, quyDinh: QuyDinhNenHanChe): GioiHanNenHanChe {
  return {
    muoi_g_toi_da: quyDinh.muoiToiDaG,
    duong_g_toi_da: Math.round((mucTieuCalo * quyDinh.tyLeDuongToiDa) / 100 / quyDinh.kcalMoiGDuong),
    beo_no_g_toi_da: Math.round((mucTieuCalo * quyDinh.tyLeBeoNoToiDa) / 100 / quyDinh.kcalMoiGBeo),
  };
}
