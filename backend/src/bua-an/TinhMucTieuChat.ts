// Tỷ lệ năng lượng khuyến nghị (%) và số kcal mỗi gam, lấy từ bảng quy_dinh
export type QuyDinhChat = {
  tyLeDamThap: number;
  tyLeDamCao: number;
  tyLeBeoThap: number;
  tyLeBeoCao: number;
  kcalMoiGDam: number;
  kcalMoiGTinhBot: number;
  kcalMoiGBeo: number;
};

// Khoảng gam nên ăn mỗi ngày cho từng chất, gửi thẳng về app
export type MucTieuChat = {
  dam_g_thap: number;
  dam_g_cao: number;
  tinh_bot_g_thap: number;
  tinh_bot_g_cao: number;
  beo_g_thap: number;
  beo_g_cao: number;
};

// Đổi mục tiêu calo thành khoảng gam đạm, tinh bột, béo; tinh bột là phần năng lượng còn lại sau đạm và béo
export function tinhMucTieuChat(mucTieuCalo: number, quyDinh: QuyDinhChat): MucTieuChat {
  // Tinh bột thấp nhất khi đạm và béo ở mức cao nhất, và ngược lại
  const tyLeTinhBotThap = 100 - quyDinh.tyLeDamCao - quyDinh.tyLeBeoCao;
  const tyLeTinhBotCao = 100 - quyDinh.tyLeDamThap - quyDinh.tyLeBeoThap;

  return {
    dam_g_thap: Math.round((mucTieuCalo * quyDinh.tyLeDamThap) / 100 / quyDinh.kcalMoiGDam),
    dam_g_cao: Math.round((mucTieuCalo * quyDinh.tyLeDamCao) / 100 / quyDinh.kcalMoiGDam),
    tinh_bot_g_thap: Math.round((mucTieuCalo * tyLeTinhBotThap) / 100 / quyDinh.kcalMoiGTinhBot),
    tinh_bot_g_cao: Math.round((mucTieuCalo * tyLeTinhBotCao) / 100 / quyDinh.kcalMoiGTinhBot),
    beo_g_thap: Math.round((mucTieuCalo * quyDinh.tyLeBeoThap) / 100 / quyDinh.kcalMoiGBeo),
    beo_g_cao: Math.round((mucTieuCalo * quyDinh.tyLeBeoCao) / 100 / quyDinh.kcalMoiGBeo),
  };
}
