// Số liệu của một món cần để cộng tổng; các chất có thể chưa có (null)
export type SoLieuMon = {
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
};

// Kết quả tổng hợp một ngày, gửi thẳng về app
export type TongHop = {
  tong_calo: number;
  con_lai: number | null;
  tong_dam_g: number;
  tong_tinh_bot_g: number;
  tong_beo_g: number;
  tong_muoi_g: number;
  tong_duong_g: number;
  tong_beo_no_g: number;
  so_mon_thieu_so_lieu: number;
};

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Cộng tổng calo, gam đạm, tinh bột, béo và muối, đường, béo no của các món trong ngày; còn lại = mục tiêu trừ đã ăn (âm là đã vượt)
export function tongHopNgay(danhSachMon: SoLieuMon[], mucTieuCalo: number | null): TongHop {
  let tongCalo = 0;
  let tongDam = 0;
  let tongTinhBot = 0;
  let tongBeo = 0;
  let tongMuoi = 0;
  let tongDuong = 0;
  let tongBeoNo = 0;
  let soMonThieuSoLieu = 0;

  for (const mon of danhSachMon) {
    tongCalo = tongCalo + mon.so_calo;

    // Món thiếu một trong sáu chất thì vẫn cộng phần đã có, và đếm vào số món thiếu số liệu
    if (
      mon.dam_g === null || mon.tinh_bot_g === null || mon.beo_g === null ||
      mon.muoi_g === null || mon.duong_g === null || mon.beo_no_g === null
    ) {
      soMonThieuSoLieu = soMonThieuSoLieu + 1;
    }
    if (mon.dam_g !== null) {
      tongDam = tongDam + mon.dam_g;
    }
    if (mon.tinh_bot_g !== null) {
      tongTinhBot = tongTinhBot + mon.tinh_bot_g;
    }
    if (mon.beo_g !== null) {
      tongBeo = tongBeo + mon.beo_g;
    }
    if (mon.muoi_g !== null) {
      tongMuoi = tongMuoi + mon.muoi_g;
    }
    if (mon.duong_g !== null) {
      tongDuong = tongDuong + mon.duong_g;
    }
    if (mon.beo_no_g !== null) {
      tongBeoNo = tongBeoNo + mon.beo_no_g;
    }
  }

  let conLai: number | null = null;
  if (mucTieuCalo !== null) {
    conLai = mucTieuCalo - tongCalo;
  }

  return {
    tong_calo: tongCalo,
    con_lai: conLai,
    tong_dam_g: lamTronMotSoLe(tongDam),
    tong_tinh_bot_g: lamTronMotSoLe(tongTinhBot),
    tong_beo_g: lamTronMotSoLe(tongBeo),
    tong_muoi_g: lamTronMotSoLe(tongMuoi),
    tong_duong_g: lamTronMotSoLe(tongDuong),
    tong_beo_no_g: lamTronMotSoLe(tongBeoNo),
    so_mon_thieu_so_lieu: soMonThieuSoLieu,
  };
}
