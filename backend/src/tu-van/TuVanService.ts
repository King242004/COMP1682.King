import { layMonHayAn, layTongCaloCacNgay } from '../bua-an/BuaAnQueries.ts';
import { xemNhatKyNgay } from '../bua-an/BuaAnService.ts';
import { xemHoSo } from '../ho-so/HoSoService.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { xemTienDo } from '../tien-do/TienDoService.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';
import { taoLoiNhac } from './TaoLoiNhac.ts';
import { layTinNhanGanNhat, themTinNhan, xoaTinNhan } from './TuVanQueries.ts';
import type { TinNhan } from './TuVanQueries.ts';

// Giới hạn và số lượng; là lựa chọn giao diện, không phải luật dinh dưỡng (giống CHECK trong 008_tin_nhan_tu_van.sql)
const CAU_HOI_DAI_NHAT = 500;
const TRA_LOI_DAI_NHAT = 2000;
const SO_TIN_HIEN_THI = 50;
const SO_TIN_GUI_AI = 10;
const SO_NGAY_NHAN_XET = 7;
const SO_MON_HAY_AN = 6;

// Ngày phải có dạng 2026-10-06 (ngày trên điện thoại người dùng)
const DANG_NGAY = /^\d{4}-\d{2}-\d{2}$/;

// Câu trả lời cố định khi câu hỏi ngoài phạm vi
const CAU_NGOAI_PHAM_VI = 'Mình chỉ hỗ trợ về ăn uống, dinh dưỡng, nấu ăn healthy và vận động trong MealMate.';

// Khuôn JSON bắt Gemini phải trả về
const KHUON_TRA_LOI = {
  type: 'object',
  properties: {
    trong_pham_vi: { type: 'boolean' },
    tra_loi: { type: 'string' },
  },
  required: ['trong_pham_vi', 'tra_loi'],
};

// Lấy các tin nhắn gần nhất để hiện trên màn Coach
export async function xemTinNhan(nguoiDungId: number): Promise<TinNhan[]> {
  return layTinNhanGanNhat(nguoiDungId, SO_TIN_HIEN_THI);
}

// Nhận câu hỏi, gửi AI kèm số liệu thật, lưu câu hỏi và câu trả lời, trả về hai tin vừa lưu
export async function hoiCoach(nguoiDungId: number, duLieu: Record<string, unknown>): Promise<TinNhan[]> {
  // Bước 1. Kiểm câu hỏi và ngày
  const cauHoi = duLieu.cau_hoi;
  if (typeof cauHoi !== 'string' || cauHoi.trim() === '' || cauHoi.trim().length > CAU_HOI_DAI_NHAT) {
    throw new HttpError(400, `Câu hỏi cần từ 1 đến ${CAU_HOI_DAI_NHAT} ký tự`);
  }
  const ngay = duLieu.ngay;
  if (typeof ngay !== 'string' || !DANG_NGAY.test(ngay)) {
    throw new HttpError(400, 'Ngày không hợp lệ');
  }

  // Bước 2. Lấy số liệu thật: hồ sơ, nhật ký hôm nay, calo 7 ngày, món hay ăn, tiến độ cân nặng, tin nhắn gần nhất
  const hoSo = await xemHoSo(nguoiDungId);
  const nhatKy = await xemNhatKyNgay(nguoiDungId, ngay);
  const bayNgay = await layTongCaloCacNgay(nguoiDungId, ngay, SO_NGAY_NHAN_XET);
  const monHayAn = await layMonHayAn(nguoiDungId, SO_MON_HAY_AN);
  const tienDo = await xemTienDo(nguoiDungId, ngay);
  const lichSu = await layTinNhanGanNhat(nguoiDungId, SO_TIN_GUI_AI);

  // Tuổi tính theo năm của ngày đang hỏi
  let tuoi: number | null = null;
  if (hoSo.nam_sinh !== null) {
    tuoi = Number(ngay.slice(0, 4)) - hoSo.nam_sinh;
  }

  // Bước 3. Ghép lời nhắc và hỏi AI đúng một lần
  const loiNhac = taoLoiNhac({
    hoSo: {
      gioi_tinh: hoSo.gioi_tinh,
      tuoi: tuoi,
      chieu_cao_cm: hoSo.chieu_cao_cm,
      can_nang_kg: hoSo.can_nang_kg,
      bmi: hoSo.bmi,
      phan_loai_bmi: hoSo.phan_loai_bmi,
      muc_tieu: hoSo.muc_tieu,
      di_ung_kieng_an: hoSo.di_ung_kieng_an,
    },
    nhatKy: nhatKy,
    bayNgay: bayNgay,
    monHayAn: monHayAn,
    tienDo: tienDo,
    lichSu: lichSu,
    cauHoi: cauHoi.trim(),
  });
  const traLoiAi = (await askGeminiForJson(loiNhac, KHUON_TRA_LOI)) as { trong_pham_vi?: unknown; tra_loi?: unknown };

  // Bước 4. Ngoài phạm vi thì dùng câu cố định; trong phạm vi mà không có câu trả lời thì báo lỗi
  let noiDungTraLoi = CAU_NGOAI_PHAM_VI;
  if (traLoiAi.trong_pham_vi !== false) {
    if (typeof traLoiAi.tra_loi !== 'string' || traLoiAi.tra_loi.trim() === '') {
      throw new HttpError(503, 'AI trả lời sai định dạng, thử lại sau');
    }
    noiDungTraLoi = traLoiAi.tra_loi.trim().slice(0, TRA_LOI_DAI_NHAT);
  }

  // Bước 5. Chỉ lưu khi AI đã trả lời được
  const tinNguoiDung = await themTinNhan(nguoiDungId, 'nguoi_dung', cauHoi.trim());
  const tinCoach = await themTinNhan(nguoiDungId, 'coach', noiDungTraLoi);
  return [tinNguoiDung, tinCoach];
}

// Xóa cả cuộc trò chuyện
export async function xoaTroChuyen(nguoiDungId: number): Promise<void> {
  await xoaTinNhan(nguoiDungId);
}
