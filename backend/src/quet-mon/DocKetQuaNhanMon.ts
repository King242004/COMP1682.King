// Một khả năng AI đoán: món gì, khẩu phần nhìn thấy, số liệu, độ chắc chắn (0 tới 1)
export type KhaNang = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  do_tin_cay: number;
};

// Kết quả đã kiểm: la_mon_an = false nghĩa là AI thấy ảnh không phải đồ ăn
export type KetQuaNhanMon = {
  la_mon_an: boolean;
  kha_nang: KhaNang[];
};

// Kiểm một số: phải là số hữu hạn, không âm
function laSoKhongAm(giaTri: unknown): giaTri is number {
  return typeof giaTri === 'number' && Number.isFinite(giaTri) && giaTri >= 0;
}

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Muối, đường, béo no: hợp lệ thì làm tròn, sai hoặc thiếu thì null (vẫn giữ khả năng đó)
function docSoGamPhu(giaTri: unknown): number | null {
  if (laSoKhongAm(giaTri)) {
    return lamTronMotSoLe(giaTri);
  }
  return null;
}

// Kiểm JSON AI trả về: bỏ khả năng nào thiếu hoặc sai số liệu, xếp chắc nhất lên đầu, giữ tối đa soKhaNangToiDa
export function docKetQuaNhanMon(duLieu: unknown, soKhaNangToiDa: number): KetQuaNhanMon {
  if (typeof duLieu !== 'object' || duLieu === null) {
    return { la_mon_an: false, kha_nang: [] };
  }
  const ketQuaTho = duLieu as { la_mon_an?: unknown; kha_nang?: unknown };
  if (ketQuaTho.la_mon_an !== true || !Array.isArray(ketQuaTho.kha_nang)) {
    return { la_mon_an: false, kha_nang: [] };
  }

  // Giữ lại khả năng có đủ tên và số liệu hợp lệ
  const danhSachHopLe: KhaNang[] = [];
  for (const muc of ketQuaTho.kha_nang) {
    const khaNang = muc as Record<string, unknown>;
    if (typeof khaNang.ten_mon !== 'string' || khaNang.ten_mon.trim() === '') {
      continue;
    }
    if (!laSoKhongAm(khaNang.so_calo) || !laSoKhongAm(khaNang.dam_g) || !laSoKhongAm(khaNang.tinh_bot_g) || !laSoKhongAm(khaNang.beo_g)) {
      continue;
    }
    let doTinCay = 0;
    if (laSoKhongAm(khaNang.do_tin_cay) && khaNang.do_tin_cay <= 1) {
      doTinCay = khaNang.do_tin_cay;
    }
    let khauPhan = '';
    if (typeof khaNang.khau_phan === 'string') {
      khauPhan = khaNang.khau_phan.trim();
    }
    danhSachHopLe.push({
      ten_mon: khaNang.ten_mon.trim(),
      khau_phan: khauPhan,
      so_calo: Math.round(khaNang.so_calo),
      dam_g: lamTronMotSoLe(khaNang.dam_g),
      tinh_bot_g: lamTronMotSoLe(khaNang.tinh_bot_g),
      beo_g: lamTronMotSoLe(khaNang.beo_g),
      muoi_g: docSoGamPhu(khaNang.muoi_g),
      duong_g: docSoGamPhu(khaNang.duong_g),
      beo_no_g: docSoGamPhu(khaNang.beo_no_g),
      do_tin_cay: doTinCay,
    });
  }

  // Chắc nhất đứng đầu, cắt bớt cho đủ số lượng
  danhSachHopLe.sort((khaNangTruoc, khaNangSau) => khaNangSau.do_tin_cay - khaNangTruoc.do_tin_cay);
  return { la_mon_an: danhSachHopLe.length > 0, kha_nang: danhSachHopLe.slice(0, soKhaNangToiDa) };
}
