import { xemNhatKyNgay } from '../bua-an/BuaAnService.ts';
import { layHoSo } from '../ho-so/HoSoQueries.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';
import { LUAT_HEALTHY } from '../tu-van/TaoLoiNhac.ts';
import { docThucDon } from './DocThucDon.ts';
import type { MonThucDon } from './DocThucDon.ts';
import { layThucDon, luuThucDon } from './ThucDonQueries.ts';

// Giới hạn chữ của món, giống CHECK trong 005_bua_an.sql, để bấm "Đã ăn" lưu được
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;

// Thực đơn là câu trả lời dài (4 món kèm nguyên liệu, cách nấu) nên chờ AI tối đa 30 giây; các tính năng AI khác chờ 15 giây
const THOI_GIAN_CHO_AI_MS = 30000;

// Ngày phải có dạng 2026-10-09 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Khuôn JSON bắt Gemini phải trả về
const KHUON_THUC_DON = {
  type: 'object',
  properties: {
    bua: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          loai_bua: { type: 'string' },
          cach_an: { type: 'string' },
          ten_mon: { type: 'string' },
          khau_phan: { type: 'string' },
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
        required: ['loai_bua', 'cach_an', 'ten_mon', 'khau_phan', 'so_calo', 'dam_g', 'tinh_bot_g', 'beo_g', 'muoi_g', 'duong_g', 'beo_no_g'],
      },
    },
  },
  required: ['bua'],
};

// Thực đơn một ngày gửi về app; chưa tạo thì danh sách món là null
export type ThucDonNgay = {
  ngay: string;
  muc_tieu_calo: number | null;
  tong_calo: number;
  mon: MonThucDon[] | null;
};

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

// Nhờ AI lập thực đơn một ngày theo mục tiêu của người dùng, kiểm rồi lưu (tạo lại thì ghi đè)
export async function taoThucDon(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<ThucDonNgay> {
  // Bước 1. Kiểm ngày
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }

  // Bước 2. Lấy mục tiêu từ nhật ký ngày (cùng cách tính với trang chủ), dị ứng từ hồ sơ, thực đơn cũ nếu có
  const nhatKy = await xemNhatKyNgay(nguoiDungId, ngay);
  if (nhatKy.muc_tieu_calo === null || nhatKy.muc_tieu_chat === null || nhatKy.gioi_han_nen_han_che === null) {
    throw new HttpError(400, 'Hãy thiết lập hồ sơ trước để có mục tiêu calo');
  }
  const hoSo = await layHoSo(nguoiDungId);
  const thucDonCu = await layThucDon(nguoiDungId, ngay);

  // Bước 3. Ghép lời nhắc: mục tiêu, cấu trúc bữa, món Việt bình dân, healthy, cách ghi số liệu
  const dong = [
    'Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam. Hãy lập thực đơn 1 ngày cho 1 người.',
    `Mục tiêu: tổng khoảng ${nhatKy.muc_tieu_calo} kcal cả ngày; đạm ít nhất ${nhatKy.muc_tieu_chat.dam_g_toi_thieu} g; muối dưới ${nhatKy.gioi_han_nen_han_che.muoi_g_toi_da} g.`,
    'Gồm bữa sáng, trưa, tối và tối đa 1 bữa phụ; mỗi bữa 1 món (có thể là 1 suất, ví dụ "cơm, cá kho, canh bí đỏ").',
    'loai_bua là sang, trua, toi hoặc phu. cach_an là an_ngoai (mua ở quán) hoặc tu_nau (nấu ở nhà); ít nhất 1 bữa tu_nau.',
    'Chỉ chọn món Việt thường ngày, nguyên liệu dễ mua ở chợ Việt Nam, giá bình dân; không chọn món Tây hay nguyên liệu nhập khẩu đắt.',
    LUAT_HEALTHY,
    'Món tu_nau bắt buộc có nguyen_lieu (kèm lượng cho 1 người, ví dụ "Bí đỏ 200 g") và cach_nau (3-5 bước ngắn). Món an_ngoai: để trống nguyen_lieu và cach_nau.',
    `Mỗi món: ten_mon tối đa ${TEN_MON_DAI_NHAT} ký tự; khau_phan bằng chữ; so_calo (kcal), dam_g, tinh_bot_g, beo_g, muoi_g (tính cả nước mắm, bột ngọt, hạt nêm quy ra muối), duong_g, beo_no_g (gam) cho đúng khẩu phần.`,
  ];
  if (hoSo.di_ung_kieng_an !== '') {
    dong.push(`Người này dị ứng hoặc kiêng: ${hoSo.di_ung_kieng_an}. Tên món và nguyên liệu tuyệt đối không có các thành phần này; không ghi kiểu "thay bằng".`);
  }
  if (thucDonCu !== null) {
    const tenMonCu = thucDonCu.map((mon) => mon.ten_mon);
    dong.push(`Đổi khác các món của thực đơn trước: ${tenMonCu.join(', ')}.`);
  }

  // Bước 4. Hỏi AI một lần (không gửi ảnh, chờ lâu hơn mặc định) rồi kiểm; không còn món nào dùng được thì báo để thử lại
  const traLoi = await askGeminiForJson(dong.join('\n'), KHUON_THUC_DON, undefined, THOI_GIAN_CHO_AI_MS);
  const danhSachMon = docThucDon(traLoi, { tenMonDaiNhat: TEN_MON_DAI_NHAT, khauPhanDaiNhat: KHAU_PHAN_DAI_NHAT });
  if (danhSachMon.length === 0) {
    throw new HttpError(503, 'AI chưa lập được thực đơn, thử lại sau');
  }

  // Bước 5. Lưu (ngày đã có thì ghi đè) rồi trả về thực đơn mới
  await luuThucDon(nguoiDungId, ngay, danhSachMon);
  return xemThucDon(nguoiDungId, ngay);
}
