import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NhatKyNgay } from '../bua-an/BuaAnService.ts';
import type { TienDo } from '../tien-do/TienDoService.ts';
import { taoLoiNhac } from './TaoLoiNhac.ts';
import type { DuLieuLoiNhac } from './TaoLoiNhac.ts';

// Một ngày mẫu: đã ăn phở bò buổi sáng, mục tiêu 1724 kcal
const nhatKyMau: NhatKyNgay = {
  ngay: '2026-10-06',
  muc_tieu_calo: 1724,
  muc_tieu_chat: { dam_g_toi_thieu: 48, tinh_bot_g_thap: 216, tinh_bot_g_cao: 280, beo_g_thap: 38, beo_g_cao: 48 },
  gioi_han_nen_han_che: { muoi_g_toi_da: 5, duong_g_toi_da: 43, beo_no_g_toi_da: 19 },
  bua_an: [
    {
      id: 1, ngay: '2026-10-06', loai_bua: 'sang', ten_mon: 'Phở bò', khau_phan: '1 tô lớn', so_calo: 550,
      dam_g: 35, tinh_bot_g: 70, beo_g: 12, muoi_g: 4.5, duong_g: 5, beo_no_g: 6.5, nguon_so_lieu: 'ai',
    },
  ],
  tong_hop: {
    tong_calo: 550, con_lai: 1174, tong_dam_g: 35, tong_tinh_bot_g: 70, tong_beo_g: 12,
    tong_muoi_g: 4.5, tong_duong_g: 5, tong_beo_no_g: 6.5, so_mon_thieu_so_lieu: 0,
  },
};

// Tiến độ mẫu: đang giảm cân, giảm khoảng 1 kg mỗi tháng
const tienDoMau: TienDo = {
  ngay: '2026-10-06',
  can_nang: [],
  can_nang_xu_huong: 51.9,
  muc_tieu: 'giam',
  muc_tieu_calo: 1500,
  tom_tat: { so_ngay: 28, so_ngay_co_ghi: 24, calo_trung_binh: 1650, thay_doi_kg_moi_thang: -1, danh_gia_toc_do: 'cham_hon' },
  giam_can_kg_moi_thang_thap: 2,
  giam_can_kg_moi_thang_cao: 3,
};

const duLieuMau: DuLieuLoiNhac = {
  hoSo: { gioi_tinh: 'nu', tuoi: 26, chieu_cao_cm: 158, can_nang_kg: 52, bmi: 20.8, phan_loai_bmi: 'Bình thường', muc_tieu: 'giu', di_ung_kieng_an: 'tôm, cua' },
  nhatKy: nhatKyMau,
  bayNgay: [{ ngay: '2026-10-05', tong_calo: 1800 }, { ngay: '2026-10-06', tong_calo: 550 }],
  tienDo: tienDoMau,
  monHayAn: [{ ten_mon: 'Phở bò', khau_phan: '1 tô lớn', so_calo: 550, dam_g: 35, tinh_bot_g: 70, beo_g: 12, muoi_g: 4.5, duong_g: 5, beo_no_g: 6.5, nguon_so_lieu: 'ai' }],
  lichSu: [
    { vai_tro: 'nguoi_dung', noi_dung: 'Chào coach' },
    { vai_tro: 'coach', noi_dung: 'Chào bạn' },
  ],
  cauHoi: 'Tối nay nên ăn gì?',
};

test('lời nhắc có đủ số liệu thật của người dùng', () => {
  const loiNhac = taoLoiNhac(duLieuMau);
  assert.ok(loiNhac.includes('nữ, 26 tuổi, cao 158 cm, nặng 52 kg, BMI 20.8 (Bình thường), mục tiêu giữ cân'));
  assert.ok(loiNhac.includes('đã ăn 550 / 1724 kcal, còn lại 1174 kcal'));
  assert.ok(loiNhac.includes('Đạm 35 g (nên ít nhất 48 g)'));
  assert.ok(loiNhac.includes('muối 4.5 / dưới 5 g'));
  assert.ok(loiNhac.includes('Bữa sáng: Phở bò (1 tô lớn) 550 kcal'));
  assert.ok(loiNhac.includes('2026-10-05: 1800 kcal'));
  assert.ok(loiNhac.includes('- Dị ứng hoặc kiêng ăn: tôm, cua'));
  assert.ok(loiNhac.includes('Cân nặng theo đường xu hướng 7 ngày: 51.9 kg'));
  assert.ok(loiNhac.includes('ăn trung bình 1650 kcal mỗi ngày có ghi, ghi món 24/28 ngày'));
  assert.ok(loiNhac.includes('theo QĐ 2892 của Bộ Y tế: 2–3 kg mỗi tháng'));
});

test('cuộc trò chuyện giữ đúng thứ tự cũ trước mới sau, câu hỏi mới nằm cuối', () => {
  const loiNhac = taoLoiNhac(duLieuMau);
  assert.ok(loiNhac.indexOf('Người dùng: Chào coach') < loiNhac.indexOf('Coach: Chào bạn'));
  assert.ok(loiNhac.indexOf('Coach: Chào bạn') < loiNhac.indexOf('Câu hỏi mới của người dùng: "Tối nay nên ăn gì?"'));
});

test('chưa có mục tiêu, chưa ăn gì, chưa trò chuyện thì ghi rõ thay vì để trống', () => {
  const loiNhac = taoLoiNhac({
    ...duLieuMau,
    nhatKy: { ...nhatKyMau, muc_tieu_calo: null, muc_tieu_chat: null, gioi_han_nen_han_che: null, bua_an: [] },
    hoSo: { ...duLieuMau.hoSo, di_ung_kieng_an: '' },
    lichSu: [],
  });
  assert.ok(loiNhac.includes('chưa thiết lập mục tiêu'));
  assert.ok(loiNhac.includes('Hôm nay chưa ghi món nào'));
  assert.ok(loiNhac.includes('(chưa có)'));
  assert.ok(loiNhac.includes('- Dị ứng hoặc kiêng ăn: không có'));
});
