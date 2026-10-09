// Một món trong thực đơn, đã kiểm; món ăn ngoài thì không có nguyên liệu và cách nấu
export type MonThucDon = {
  loai_bua: 'sang' | 'trua' | 'toi' | 'phu';
  cach_an: 'an_ngoai' | 'tu_nau';
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguyen_lieu: string[];
  cach_nau: string[];
};

// Độ dài tối đa của tên món và khẩu phần, do Service truyền vào (giống giới hạn của bảng bua_an)
export type GioiHanChu = {
  tenMonDaiNhat: number;
  khauPhanDaiNhat: number;
};

// Kiểm một số: phải là số hữu hạn, không âm
function laSoKhongAm(giaTri: unknown): giaTri is number {
  return typeof giaTri === 'number' && Number.isFinite(giaTri) && giaTri >= 0;
}

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Muối, đường, béo no: hợp lệ thì làm tròn, sai hoặc thiếu thì null (vẫn giữ món)
function docSoGamPhu(giaTri: unknown): number | null {
  if (laSoKhongAm(giaTri)) {
    return lamTronMotSoLe(giaTri);
  }
  return null;
}

// Lấy danh sách chữ, bỏ phần tử rỗng hoặc không phải chữ
function docDanhSachChu(giaTri: unknown): string[] {
  if (!Array.isArray(giaTri)) {
    return [];
  }
  const danhSach: string[] = [];
  for (const phanTu of giaTri) {
    if (typeof phanTu === 'string' && phanTu.trim() !== '') {
      danhSach.push(phanTu.trim());
    }
  }
  return danhSach;
}

// Kiểm JSON AI trả về: bỏ món thiếu hoặc sai số liệu; món ăn ngoài thì bỏ nguyên liệu và cách nấu
export function docThucDon(duLieu: unknown, gioiHan: GioiHanChu): MonThucDon[] {
  if (typeof duLieu !== 'object' || duLieu === null) {
    return [];
  }
  const danhSachTho = (duLieu as { bua?: unknown }).bua;
  if (!Array.isArray(danhSachTho)) {
    return [];
  }

  const danhSachMon: MonThucDon[] = [];
  for (const muc of danhSachTho) {
    const mon = muc as Record<string, unknown>;

    // Bữa và cách ăn phải đúng một trong các giá trị cho phép
    const loaiBua = mon.loai_bua;
    if (loaiBua !== 'sang' && loaiBua !== 'trua' && loaiBua !== 'toi' && loaiBua !== 'phu') {
      continue;
    }
    const cachAn = mon.cach_an;
    if (cachAn !== 'an_ngoai' && cachAn !== 'tu_nau') {
      continue;
    }

    // Tên món phải có; tên và khẩu phần không quá dài để bấm "Đã ăn" lưu được
    const tenMon = mon.ten_mon;
    if (typeof tenMon !== 'string' || tenMon.trim() === '' || tenMon.trim().length > gioiHan.tenMonDaiNhat) {
      continue;
    }
    const khauPhan = mon.khau_phan;
    if (typeof khauPhan !== 'string' || khauPhan.trim().length > gioiHan.khauPhanDaiNhat) {
      continue;
    }

    // Calo và ba chất chính phải là số không âm
    if (!laSoKhongAm(mon.so_calo) || !laSoKhongAm(mon.dam_g) || !laSoKhongAm(mon.tinh_bot_g) || !laSoKhongAm(mon.beo_g)) {
      continue;
    }

    // Chỉ món tự nấu mới giữ nguyên liệu và cách nấu
    let nguyenLieu: string[] = [];
    let cachNau: string[] = [];
    if (cachAn === 'tu_nau') {
      nguyenLieu = docDanhSachChu(mon.nguyen_lieu);
      cachNau = docDanhSachChu(mon.cach_nau);
    }

    danhSachMon.push({
      loai_bua: loaiBua,
      cach_an: cachAn,
      ten_mon: tenMon.trim(),
      khau_phan: khauPhan.trim(),
      so_calo: Math.round(mon.so_calo),
      dam_g: lamTronMotSoLe(mon.dam_g),
      tinh_bot_g: lamTronMotSoLe(mon.tinh_bot_g),
      beo_g: lamTronMotSoLe(mon.beo_g),
      muoi_g: docSoGamPhu(mon.muoi_g),
      duong_g: docSoGamPhu(mon.duong_g),
      beo_no_g: docSoGamPhu(mon.beo_no_g),
      nguyen_lieu: nguyenLieu,
      cach_nau: cachNau,
    });
  }
  return danhSachMon;
}
