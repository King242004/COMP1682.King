import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhGioiHanNenHanChe, tinhMucTieuChat, tongHopNgay } from './BuaAnService.ts';

// Giống bảng quy_dinh: Viện Dinh dưỡng 2026 (đạm 0,93 g/kg, bột đường 50-65%, béo 20-25%, chia 4 và 9)
const quyDinhChat = {
  damGMoiKg: 0.93,
  tyLeTinhBotThap: 50,
  tyLeTinhBotCao: 65,
  tyLeBeoThap: 20,
  tyLeBeoCao: 25,
  kcalMoiGTinhBot: 4,
  kcalMoiGBeo: 9,
};

test('mục tiêu 2000 kcal, nặng 60 kg: đạm ít nhất 56 g, tinh bột 250-325 g, béo 44-56 g', () => {
  // Đạm: 60 x 0,93 = 55,8
  // Tinh bột: 2000 x 50% / 4 = 250; 2000 x 65% / 4 = 325
  // Béo: 2000 x 20% / 9 = 44,4; 2000 x 25% / 9 = 55,6
  assert.deepEqual(tinhMucTieuChat(2000, 60, quyDinhChat), {
    dam_g_toi_thieu: 56,
    tinh_bot_g_thap: 250,
    tinh_bot_g_cao: 325,
    beo_g_thap: 44,
    beo_g_cao: 56,
  });
});

test('khớp công cụ tra cứu của Viện: 1740 kcal ra béo 39-48 g, tinh bột 218-283 g', () => {
  // Công cụ ghi béo 38,7-48,3 g, bột đường 217,5-282,8 g cho nữ 30-49 tuổi lao động nhẹ
  const ketQua = tinhMucTieuChat(1740, 52.7, quyDinhChat);
  assert.equal(ketQua.beo_g_thap, 39);
  assert.equal(ketQua.beo_g_cao, 48);
  assert.equal(ketQua.tinh_bot_g_thap, 218);
  assert.equal(ketQua.tinh_bot_g_cao, 283);
});

// Giống bảng quy_dinh: Viện Dinh dưỡng 2026 (muối dưới 5 g, đường tối đa 10% năng lượng, chia 4 và 9), WHO 2023 (béo no tối đa 10%)
const quyDinhNenHanChe = {
  muoiToiDaG: 5,
  tyLeDuongToiDa: 10,
  tyLeBeoNoToiDa: 10,
  kcalMoiGDuong: 4,
  kcalMoiGBeo: 9,
};

test('mục tiêu 2000 kcal: muối 5 g, đường 50 g, béo no 22 g', () => {
  // Đường: 2000 x 10% / 4 = 50; béo no: 2000 x 10% / 9 = 22,2
  assert.deepEqual(tinhGioiHanNenHanChe(2000, quyDinhNenHanChe), {
    muoi_g_toi_da: 5,
    duong_g_toi_da: 50,
    beo_no_g_toi_da: 22,
  });
});

test('muối không đổi theo calo, đường và béo no tăng theo calo', () => {
  // Đường: 2730 x 10% / 4 = 68,25; béo no: 2730 x 10% / 9 = 30,3
  const gioiHan = tinhGioiHanNenHanChe(2730, quyDinhNenHanChe);
  assert.equal(gioiHan.muoi_g_toi_da, 5);
  assert.equal(gioiHan.duong_g_toi_da, 68);
  assert.equal(gioiHan.beo_no_g_toi_da, 30);
});

test('ngày chưa ăn gì: tổng 0, còn lại bằng mục tiêu', () => {
  const ketQua = tongHopNgay([], 2000);
  assert.equal(ketQua.tong_calo, 0);
  assert.equal(ketQua.con_lai, 2000);
  assert.equal(ketQua.so_mon_thieu_so_lieu, 0);
});

test('cộng calo và ba chất; món thiếu chất vẫn cộng calo và được đếm', () => {
  const danhSachMon = [
    { so_calo: 350, dam_g: 20, tinh_bot_g: 45.5, beo_g: 9, muoi_g: 1.2, duong_g: 4, beo_no_g: 3 },
    { so_calo: 530, dam_g: null, tinh_bot_g: null, beo_g: null, muoi_g: null, duong_g: null, beo_no_g: null },
  ];
  const ketQua = tongHopNgay(danhSachMon, 2000);
  assert.equal(ketQua.tong_calo, 880);
  assert.equal(ketQua.con_lai, 1120);
  assert.equal(ketQua.tong_dam_g, 20);
  assert.equal(ketQua.tong_tinh_bot_g, 45.5);
  assert.equal(ketQua.tong_beo_g, 9);
  assert.equal(ketQua.so_mon_thieu_so_lieu, 1);
});

test('ăn vượt mục tiêu thì còn lại là số âm', () => {
  const ketQua = tongHopNgay([{ so_calo: 2300, dam_g: 50, tinh_bot_g: 300, beo_g: 80, muoi_g: null, duong_g: null, beo_no_g: null }], 2000);
  assert.equal(ketQua.con_lai, -300);
});

test('số gam làm tròn 1 số lẻ, không để lộ số lẻ dài do cộng số thực', () => {
  const danhSachMon = [
    { so_calo: 100, dam_g: 0.1, tinh_bot_g: 0, beo_g: 0, muoi_g: null, duong_g: null, beo_no_g: null },
    { so_calo: 100, dam_g: 0.2, tinh_bot_g: 0, beo_g: 0, muoi_g: null, duong_g: null, beo_no_g: null },
  ];
  assert.equal(tongHopNgay(danhSachMon, 2000).tong_dam_g, 0.3);
});

test('chưa có mục tiêu calo thì còn lại là null', () => {
  assert.equal(tongHopNgay([], null).con_lai, null);
});

test('cộng muối, đường, béo no; món nhập tay thiếu số liệu thì được đếm', () => {
  const danhSachMon = [
    { so_calo: 550, dam_g: 35, tinh_bot_g: 70, beo_g: 12, muoi_g: 4.5, duong_g: 5, beo_no_g: 6.5 },
    { so_calo: 350, dam_g: 3, tinh_bot_g: 55, beo_g: 14, muoi_g: 0.2, duong_g: 55, beo_no_g: 6.5 },
    { so_calo: 300, dam_g: null, tinh_bot_g: null, beo_g: null, muoi_g: null, duong_g: null, beo_no_g: null },
  ];
  const ketQua = tongHopNgay(danhSachMon, 2000);
  assert.equal(ketQua.tong_muoi_g, 4.7);
  assert.equal(ketQua.tong_duong_g, 60);
  assert.equal(ketQua.tong_beo_no_g, 13);
  assert.equal(ketQua.so_mon_thieu_so_lieu, 1);
});
