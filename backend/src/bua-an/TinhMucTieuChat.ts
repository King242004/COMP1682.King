// Số gam đạm mỗi kg cân nặng, tỷ lệ năng lượng khuyến nghị (%) và số kcal mỗi gam, lấy từ bảng quy_dinh
export type QuyDinhChat = {
  damGMoiKg: number;
  tyLeTinhBotThap: number;
  tyLeTinhBotCao: number;
  tyLeBeoThap: number;
  tyLeBeoCao: number;
  kcalMoiGTinhBot: number;
  kcalMoiGBeo: number;
};

// Mục tiêu mỗi ngày cho từng chất, gửi thẳng về app: đạm là mức tối thiểu, tinh bột và béo là khoảng
export type MucTieuChat = {
  dam_g_toi_thieu: number;
  tinh_bot_g_thap: number;
  tinh_bot_g_cao: number;
  beo_g_thap: number;
  beo_g_cao: number;
};

// Đạm tính theo cân nặng; tinh bột và béo đổi từ mục tiêu calo theo tỷ lệ năng lượng (ThuatToan.md bước 12-13)
export function tinhMucTieuChat(mucTieuCalo: number, canNangKg: number, quyDinh: QuyDinhChat): MucTieuChat {
  return {
    dam_g_toi_thieu: Math.round(canNangKg * quyDinh.damGMoiKg),
    tinh_bot_g_thap: Math.round((mucTieuCalo * quyDinh.tyLeTinhBotThap) / 100 / quyDinh.kcalMoiGTinhBot),
    tinh_bot_g_cao: Math.round((mucTieuCalo * quyDinh.tyLeTinhBotCao) / 100 / quyDinh.kcalMoiGTinhBot),
    beo_g_thap: Math.round((mucTieuCalo * quyDinh.tyLeBeoThap) / 100 / quyDinh.kcalMoiGBeo),
    beo_g_cao: Math.round((mucTieuCalo * quyDinh.tyLeBeoCao) / 100 / quyDinh.kcalMoiGBeo),
  };
}
