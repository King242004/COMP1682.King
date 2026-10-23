import { xemNhatKyNgay } from '../bua-an/BuaAnService.ts';
import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';
import { layTatCaMonTraCuu } from '../tra-mon/TraMonQueries.ts';
import type { MonTraCuu, NhomMon } from '../tra-mon/TraMonQueries.ts';
import { LUAT_HEALTHY } from '../tu-van/TaoLoiNhac.ts';
import { layThucDon, layThucDonCacNgayTruoc, luuThucDon } from './ThucDonQueries.ts';
import type { MonThucDon } from './ThucDonQueries.ts';

// Giới hạn khẩu phần, giống CHECK trong 005_bua_an.sql, để bấm "Đã ăn" lưu được
const KHAU_PHAN_DAI_NHAT = 100;

// Thực đơn là câu trả lời dài (danh sách món Viện, mâm cơm nhà kèm nguyên liệu, cách nấu) nên chờ AI tối đa 30 giây; các tính năng AI khác chờ 15 giây
const THOI_GIAN_CHO_AI_MS = 30000;

// Dặn AI tránh lặp món đã gợi ý trong 6 ngày trước (cùng hôm nay là 1 tuần); là lựa chọn thiết kế
const SO_NGAY_TRANH_LAP = 6;

// Dặn AI chọn cho tổng calo lệch mục tiêu không quá khoảng 10%, giống bản cũ; là lựa chọn thiết kế, code không ép
const LECH_MUC_TIEU_PHAN_TRAM = 10;

// Ghi chú cho AI dài nhất bằng ô dị ứng trong hồ sơ; mâm cơm nhà từ 2 đến 5 món (không tính cơm); là lựa chọn giao diện
const GHI_CHU_DAI_NHAT = 200;
const SO_MON_IT_NHAT = 2;
const SO_MON_NHIEU_NHAT = 5;

// Ngày phải có dạng 2026-10-09 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Bữa chính (bữa phụ không ăn cơm gia đình)
type BuaChinh = 'sang' | 'trua' | 'toi';
const CAC_BUA_CHINH: BuaChinh[] = ['sang', 'trua', 'toi'];
const TEN_BUA_CHINH: Record<BuaChinh, string> = { sang: 'sang (sáng)', trua: 'trua (trưa)', toi: 'toi (tối)' };

// Những thứ người dùng chọn cho mâm cơm nhà, và chữ gửi cho AI
type ThuTrongMam = 'ca' | 'thit_heo' | 'thit_bo' | 'ga' | 'tom' | 'trung' | 'dau_phu' | 'rau' | 'canh';
const CHU_THU_TRONG_MAM: Record<ThuTrongMam, string> = {
  ca: 'cá',
  thit_heo: 'thịt heo',
  thit_bo: 'thịt bò',
  ga: 'gà',
  tom: 'tôm',
  trung: 'trứng',
  dau_phu: 'đậu phụ',
  rau: 'rau',
  canh: 'canh',
};
const CAC_THU_TRONG_MAM = Object.keys(CHU_THU_TRONG_MAM) as ThuTrongMam[];

// Nhóm món Viện cho bữa chính (người dùng chọn trong đây) và cho bữa phụ
const NHOM_BUA_CHINH: NhomMon[] = ['bun_pho', 'com_chao_xoi', 'banh', 'mon_khac'];
const NHOM_BUA_PHU: NhomMon[] = ['che_do_uong', 'banh'];

type UuTien = 'khong' | 'giau_dam' | 'it_calo';
const CAC_UU_TIEN: UuTien[] = ['khong', 'giau_dam', 'it_calo'];

// Cài đặt người dùng chọn trước khi tạo thực đơn
export type CaiDatThucDon = {
  bua_com_nha: BuaChinh[];
  so_mon_com_nha: number;
  thu_trong_mam: ThuTrongMam[];
  co_bua_phu: boolean;
  // Rỗng là thích tất cả các nhóm
  nhom_mon: NhomMon[];
  uu_tien: UuTien;
  ghi_chu: string;
};

// Khuôn JSON bắt Gemini phải trả về: món Viện chỉ ghi mã, mâm cơm nhà ghi đủ
const KHUON_THUC_DON = {
  type: 'object',
  properties: {
    mon_vien: {
      type: 'array',
      items: {
        type: 'object',
        properties: { loai_bua: { type: 'string' }, ma_so: { type: 'string' } },
        required: ['loai_bua', 'ma_so'],
      },
    },
    com_nha: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          loai_bua: { type: 'string' },
          cac_mon: { type: 'array', items: { type: 'string' } },
          so_calo: { type: 'number' },
          dam_g: { type: 'number' },
          tinh_bot_g: { type: 'number' },
          beo_g: { type: 'number' },
          muoi_g: { type: 'number' },
          duong_g: { type: 'number' },
          beo_no_g: { type: 'number' },
          nguyen_lieu: { type: 'array', items: { type: 'string' } },
          cach_nau: { type: 'array', items: { type: 'string' } },
        },
        required: ['loai_bua', 'cac_mon', 'so_calo', 'dam_g', 'tinh_bot_g', 'beo_g', 'muoi_g', 'duong_g', 'beo_no_g', 'nguyen_lieu', 'cach_nau'],
      },
    },
  },
  required: ['mon_vien', 'com_nha'],
};

// Thực đơn một ngày gửi về app; chưa tạo thì danh sách món là null
export type ThucDonNgay = {
  ngay: string;
  muc_tieu_calo: number | null;
  tong_calo: number;
  mon: MonThucDon[] | null;
};

// Những gì docThucDon cần để kiểm món AI chọn: cài đặt, món Viện được phép cho bữa chính và bữa phụ (theo mã), giới hạn chữ
export type BoiCanhThucDon = {
  caiDat: CaiDatThucDon;
  monBuaChinh: Map<string, MonTraCuu>;
  monBuaPhu: Map<string, MonTraCuu>;
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

// Kiểm một danh sách lựa chọn: phải là mảng, mỗi phần tử nằm trong danh sách cho phép, không trùng
function laDanhSachLuaChon(giaTri: unknown, choPhep: string[]): boolean {
  if (!Array.isArray(giaTri)) {
    return false;
  }
  for (let viTri = 0; viTri < giaTri.length; viTri++) {
    if (!choPhep.includes(giaTri[viTri]) || giaTri.indexOf(giaTri[viTri]) !== viTri) {
      return false;
    }
  }
  return true;
}

// Kiểm cài đặt app gửi lên; sai bất kỳ chỗ nào thì trả null
export function docCaiDat(duLieu: Record<string, unknown>): CaiDatThucDon | null {
  const soMon = duLieu.so_mon_com_nha;
  if (typeof soMon !== 'number' || !Number.isInteger(soMon) || soMon < SO_MON_IT_NHAT || soMon > SO_MON_NHIEU_NHAT) {
    return null;
  }
  if (!laDanhSachLuaChon(duLieu.bua_com_nha, CAC_BUA_CHINH)) {
    return null;
  }
  // Mâm có những gì: tối đa bằng số món
  if (!laDanhSachLuaChon(duLieu.thu_trong_mam, CAC_THU_TRONG_MAM) || (duLieu.thu_trong_mam as string[]).length > soMon) {
    return null;
  }
  if (typeof duLieu.co_bua_phu !== 'boolean') {
    return null;
  }
  if (!laDanhSachLuaChon(duLieu.nhom_mon, NHOM_BUA_CHINH)) {
    return null;
  }
  if (!CAC_UU_TIEN.includes(duLieu.uu_tien as UuTien)) {
    return null;
  }
  const ghiChu = duLieu.ghi_chu;
  if (typeof ghiChu !== 'string' || ghiChu.trim().length > GHI_CHU_DAI_NHAT) {
    return null;
  }

  return {
    bua_com_nha: duLieu.bua_com_nha as BuaChinh[],
    so_mon_com_nha: soMon,
    thu_trong_mam: duLieu.thu_trong_mam as ThuTrongMam[],
    co_bua_phu: duLieu.co_bua_phu,
    nhom_mon: duLieu.nhom_mon as NhomMon[],
    uu_tien: duLieu.uu_tien as UuTien,
    ghi_chu: ghiChu.trim(),
  };
}

// Kiểm JSON AI trả về: món Viện phải có trong danh sách cho phép và đúng bữa, số lấy từ database;
// cơm nhà phải đúng bữa đã chọn, đúng số món, đủ số liệu, nguyên liệu, cách nấu; mỗi bữa 1 món
export function docThucDon(duLieu: unknown, boiCanh: BoiCanhThucDon): MonThucDon[] {
  if (typeof duLieu !== 'object' || duLieu === null) {
    return [];
  }
  const caiDat = boiCanh.caiDat;
  const danhSachMon: MonThucDon[] = [];
  const buaDaCo: string[] = [];

  // Bữa thường: AI chỉ ghi mã món, tên, ảnh và số lấy từ món Viện
  const monVienTho = (duLieu as { mon_vien?: unknown }).mon_vien;
  if (Array.isArray(monVienTho)) {
    for (const muc of monVienTho) {
      const mon = muc as Record<string, unknown>;
      const loaiBua = mon.loai_bua;
      if (loaiBua !== 'sang' && loaiBua !== 'trua' && loaiBua !== 'toi' && loaiBua !== 'phu') {
        continue;
      }
      // Mỗi bữa 1 món; bữa đã chọn ăn cơm gia đình thì không nhận món Viện
      if (buaDaCo.includes(loaiBua) || (loaiBua !== 'phu' && caiDat.bua_com_nha.includes(loaiBua))) {
        continue;
      }
      if (loaiBua === 'phu' && !caiDat.co_bua_phu) {
        continue;
      }

      // Mã phải nằm trong danh sách món của đúng loại bữa, và không trùng món đã chọn
      const maSo = String(mon.ma_so);
      const monGoc = loaiBua === 'phu' ? boiCanh.monBuaPhu.get(maSo) : boiCanh.monBuaChinh.get(maSo);
      if (monGoc === undefined || danhSachMon.some((monDaChon) => monDaChon.ma_so === maSo)) {
        continue;
      }

      danhSachMon.push({
        loai_bua: loaiBua,
        kieu: 'mon_vien',
        ma_so: maSo,
        anh_url: monGoc.anh_url,
        ten_mon: monGoc.ten_mon,
        khau_phan: '1 suất',
        so_calo: Math.round(monGoc.so_calo),
        dam_g: monGoc.dam_g,
        tinh_bot_g: monGoc.tinh_bot_g,
        beo_g: monGoc.beo_g,
        muoi_g: monGoc.muoi_g,
        duong_g: null,
        beo_no_g: null,
        nguyen_lieu: [],
        cach_nau: [],
      });
      buaDaCo.push(loaiBua);
    }
  }

  // Bữa cơm gia đình: mâm AI ghép, khẩu phần ghi các món trong mâm
  const comNhaTho = (duLieu as { com_nha?: unknown }).com_nha;
  if (Array.isArray(comNhaTho)) {
    for (const muc of comNhaTho) {
      const mam = muc as Record<string, unknown>;
      const loaiBua = mam.loai_bua;
      if (loaiBua !== 'sang' && loaiBua !== 'trua' && loaiBua !== 'toi') {
        continue;
      }
      if (!caiDat.bua_com_nha.includes(loaiBua) || buaDaCo.includes(loaiBua)) {
        continue;
      }

      // Đúng số món người dùng chọn, khẩu phần không quá dài để bấm "Đã ăn" lưu được
      const cacMon = docDanhSachChu(mam.cac_mon);
      const khauPhan = cacMon.join(', ');
      if (cacMon.length !== caiDat.so_mon_com_nha || khauPhan.length > boiCanh.khauPhanDaiNhat) {
        continue;
      }

      // Calo và ba chất chính phải là số không âm; phải có nguyên liệu và cách nấu
      if (!laSoKhongAm(mam.so_calo) || !laSoKhongAm(mam.dam_g) || !laSoKhongAm(mam.tinh_bot_g) || !laSoKhongAm(mam.beo_g)) {
        continue;
      }
      const nguyenLieu = docDanhSachChu(mam.nguyen_lieu);
      const cachNau = docDanhSachChu(mam.cach_nau);
      if (nguyenLieu.length === 0 || cachNau.length === 0) {
        continue;
      }

      danhSachMon.push({
        loai_bua: loaiBua,
        kieu: 'com_nha',
        ma_so: null,
        anh_url: null,
        ten_mon: 'Cơm nhà',
        khau_phan: khauPhan,
        so_calo: Math.round(mam.so_calo),
        dam_g: lamTronMotSoLe(mam.dam_g),
        tinh_bot_g: lamTronMotSoLe(mam.tinh_bot_g),
        beo_g: lamTronMotSoLe(mam.beo_g),
        muoi_g: docSoGamPhu(mam.muoi_g),
        duong_g: docSoGamPhu(mam.duong_g),
        beo_no_g: docSoGamPhu(mam.beo_no_g),
        nguyen_lieu: nguyenLieu,
        cach_nau: cachNau,
      });
      buaDaCo.push(loaiBua);
    }
  }
  return danhSachMon;
}

// Lấy thực đơn của một ngày kèm mục tiêu calo và tổng calo các món
export async function xemThucDon(nguoiDungId: number, ngay: string): Promise<ThucDonNgay> {
  if (!DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const danhSachMon = await layThucDon(nguoiDungId, ngay);
  const hoSo = await layHoSo(nguoiDungId);

  // Tổng calo do code tự cộng, không tin số tổng của AI
  let tongCalo = 0;
  if (danhSachMon !== null) {
    for (const mon of danhSachMon) {
      tongCalo = tongCalo + mon.so_calo;
    }
  }

  return { ngay: ngay, muc_tieu_calo: hoSo.muc_tieu_calo, tong_calo: tongCalo, mon: danhSachMon };
}

// Nhờ AI lập thực đơn một ngày theo cài đặt và mục tiêu của người dùng, kiểm rồi lưu (tạo lại thì ghi đè)
export async function taoThucDon(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<ThucDonNgay> {
  // Bước 1. Kiểm ngày và cài đặt
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }
  const caiDat = docCaiDat(duLieu);
  if (caiDat === null) {
    throw new HttpError(400, 'Cài đặt thực đơn không hợp lệ');
  }

  // Bước 2. Lấy mục tiêu từ nhật ký ngày (cùng cách tính với trang chủ), dị ứng từ hồ sơ, thực đơn cũ để tránh lặp
  const nhatKy = await xemNhatKyNgay(nguoiDungId, ngay);
  if (nhatKy.muc_tieu_calo === null || nhatKy.muc_tieu_chat === null || nhatKy.gioi_han_nen_han_che === null) {
    throw new HttpError(400, 'Hãy thiết lập hồ sơ trước để có mục tiêu calo');
  }
  const hoSo = await layHoSo(nguoiDungId);
  const thucDonCu = await layThucDon(nguoiDungId, ngay);
  const thucDonCacNgayTruoc = await layThucDonCacNgayTruoc(nguoiDungId, ngay, SO_NGAY_TRANH_LAP);

  // Bước 3. Danh sách món Viện được chọn: món đang hiện ở Khám phá, bữa chính theo nhóm người dùng thích (không chọn nhóm nào là thích tất cả)
  let nhomBuaChinh = NHOM_BUA_CHINH;
  if (caiDat.nhom_mon.length > 0) {
    nhomBuaChinh = caiDat.nhom_mon;
  }
  const monBuaChinh = new Map<string, MonTraCuu>();
  const monBuaPhu = new Map<string, MonTraCuu>();
  for (const mon of await layTatCaMonTraCuu()) {
    if (!mon.hien_o_kham_pha) {
      continue;
    }
    if (nhomBuaChinh.includes(mon.nhom_mon)) {
      monBuaChinh.set(mon.ma_so, mon);
    }
    if (NHOM_BUA_PHU.includes(mon.nhom_mon)) {
      monBuaPhu.set(mon.ma_so, mon);
    }
  }

  // Bước 4. Gom món đã gợi ý ở thực đơn trước và 6 ngày qua: món Viện theo mã, cơm nhà theo tên các món
  const maSoDaGoiY: string[] = [];
  const monNhaDaGoiY: string[] = [];
  const cacThucDonTruoc = [...thucDonCacNgayTruoc];
  if (thucDonCu !== null) {
    cacThucDonTruoc.push(thucDonCu);
  }
  for (const thucDonMotNgay of cacThucDonTruoc) {
    for (const mon of thucDonMotNgay) {
      if (mon.kieu === 'mon_vien' && mon.ma_so !== null && !maSoDaGoiY.includes(mon.ma_so)) {
        maSoDaGoiY.push(mon.ma_so);
      }
      if (mon.kieu === 'com_nha') {
        monNhaDaGoiY.push(mon.khau_phan);
      }
    }
  }

  // Bước 5. Ghép lời nhắc: mục tiêu, bữa thường chọn món Viện, bữa cơm gia đình ghép mâm, ưu tiên, healthy, dị ứng, ghi chú, tránh lặp
  const buaThuong = CAC_BUA_CHINH.filter((bua) => !caiDat.bua_com_nha.includes(bua));
  const dong = [
    'Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam. Hãy lập thực đơn 1 ngày cho 1 người. Mọi chữ viết tiếng Việt có dấu.',
    `Mục tiêu: tổng khoảng ${nhatKy.muc_tieu_calo} kcal cả ngày (lệch không quá khoảng ${LECH_MUC_TIEU_PHAN_TRAM}%, không cần khớp đúng); đạm ít nhất ${nhatKy.muc_tieu_chat.dam_g_toi_thieu} g; muối dưới ${nhatKy.gioi_han_nen_han_che.muoi_g_toi_da} g.`,
  ];
  if (buaThuong.length > 0) {
    dong.push(
      `Bữa ${buaThuong.map((bua) => TEN_BUA_CHINH[bua]).join(', ')}: mỗi bữa chọn đúng 1 món trong DANH SÁCH MÓN BỮA CHÍNH, ghi vào mon_vien bằng ma_so; không ghi các bữa này vào com_nha. Chọn món hợp với bữa đó theo thói quen người Việt; không chọn món ăn chung cho nhiều người (ví dụ pizza cỡ L).`,
    );
  }
  if (caiDat.co_bua_phu) {
    dong.push('Thêm 1 bữa phụ (loai_bua là phu): chọn 1 món trong DANH SÁCH MÓN BỮA PHỤ, ghi vào mon_vien bằng ma_so.');
  } else {
    dong.push('Không có bữa phụ.');
  }
  if (caiDat.bua_com_nha.length > 0) {
    let canCo = '';
    if (caiDat.thu_trong_mam.length > 0) {
      canCo = ` Mâm phải có: ${caiDat.thu_trong_mam.map((thu) => CHU_THU_TRONG_MAM[thu]).join(', ')}.`;
    }
    dong.push(
      `Bữa ${caiDat.bua_com_nha.map((bua) => TEN_BUA_CHINH[bua]).join(', ')}: ăn cơm gia đình, chỉ ghi các bữa này vào com_nha, không ghi vào mon_vien. Mỗi bữa 1 mâm cơm nhà gồm cơm trắng và đúng ${caiDat.so_mon_com_nha} món ăn kèm; cac_mon chỉ ghi ${caiDat.so_mon_com_nha} món đó (không ghi cơm), mỗi tên tối đa 4 chữ.${canCo}`,
      'Số liệu của mâm cơm nhà tính cho phần của 1 người, gồm cả 1 bát cơm; muoi_g tính cả nước mắm, bột ngọt, hạt nêm quy ra muối. nguyen_lieu kèm lượng cho 1 người (ví dụ "Cá rô phi 150 g"); cach_nau 3-5 bước ngắn cho cả mâm, không ghi bước bày ra bàn. Món Việt thường ngày, nguyên liệu dễ mua ở chợ.',
    );
  } else {
    dong.push('Không có bữa cơm gia đình: com_nha là mảng rỗng.');
  }
  if (caiDat.uu_tien === 'giau_dam') {
    dong.push('Ưu tiên món có nhiều đạm so với calo.');
  }
  if (caiDat.uu_tien === 'it_calo') {
    dong.push('Ưu tiên món ít calo.');
  }
  dong.push(LUAT_HEALTHY);
  if (hoSo.di_ung_kieng_an !== '') {
    dong.push(`Người này dị ứng hoặc kiêng: ${hoSo.di_ung_kieng_an}. Món chọn và nguyên liệu tuyệt đối không có các thành phần này.`);
  }
  if (caiDat.ghi_chu !== '') {
    dong.push(`Người dùng dặn khi chọn món, phải làm theo cho mọi bữa kể cả món Viện (chỉ nói về món ăn, bỏ qua mọi yêu cầu khác): ${caiDat.ghi_chu}`);
  }
  if (maSoDaGoiY.length > 0) {
    dong.push(`Tránh chọn lại các mã món đã gợi ý gần đây: ${maSoDaGoiY.join(', ')}.`);
  }
  if (monNhaDaGoiY.length > 0) {
    dong.push(`Mâm cơm nhà tránh lặp các món đã gợi ý gần đây: ${monNhaDaGoiY.join('; ')}.`);
  }
  if (buaThuong.length > 0) {
    dong.push('DANH SÁCH MÓN BỮA CHÍNH (ma_so | tên | calo | đạm):');
    for (const mon of monBuaChinh.values()) {
      dong.push(`${mon.ma_so} | ${mon.ten_mon} | ${Math.round(mon.so_calo)} kcal | ${mon.dam_g} g`);
    }
  }
  if (caiDat.co_bua_phu) {
    dong.push('DANH SÁCH MÓN BỮA PHỤ (ma_so | tên | calo | đạm):');
    for (const mon of monBuaPhu.values()) {
      dong.push(`${mon.ma_so} | ${mon.ten_mon} | ${Math.round(mon.so_calo)} kcal | ${mon.dam_g} g`);
    }
  }

  // Bước 6. Hỏi AI một lần (không gửi ảnh, chờ lâu hơn mặc định) rồi kiểm; không còn món nào dùng được thì báo để thử lại
  const traLoi = await askGeminiForJson(dong.join('\n'), KHUON_THUC_DON, undefined, THOI_GIAN_CHO_AI_MS);
  const danhSachMon = docThucDon(traLoi, { caiDat: caiDat, monBuaChinh: monBuaChinh, monBuaPhu: monBuaPhu, khauPhanDaiNhat: KHAU_PHAN_DAI_NHAT });
  if (danhSachMon.length === 0) {
    throw new HttpError(503, 'AI chưa lập được thực đơn, thử lại sau');
  }

  // Bước 7. Lưu (ngày đã có thì ghi đè) rồi trả về thực đơn mới
  await luuThucDon(nguoiDungId, ngay, danhSachMon);
  return xemThucDon(nguoiDungId, ngay);
}
