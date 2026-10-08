import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhGioiHanNenHanChe } from './TinhGioiHanNenHanChe.ts';

// Giống bảng quy_dinh: Viện Dinh dưỡng 2026 (muối dưới 5 g, đường tối đa 10% năng lượng, chia 4 và 9), WHO 2023 (béo no tối đa 10%)
const quyDinh = {
  muoiToiDaG: 5,
  tyLeDuongToiDa: 10,
  tyLeBeoNoToiDa: 10,
  kcalMoiGDuong: 4,
  kcalMoiGBeo: 9,
};

test('mục tiêu 2000 kcal: muối 5 g, đường 50 g, béo no 22 g', () => {
  // Đường: 2000 x 10% / 4 = 50; béo no: 2000 x 10% / 9 = 22,2
  assert.deepEqual(tinhGioiHanNenHanChe(2000, quyDinh), {
    muoi_g_toi_da: 5,
    duong_g_toi_da: 50,
    beo_no_g_toi_da: 22,
  });
});

test('muối không đổi theo calo, đường và béo no tăng theo calo', () => {
  // Đường: 2730 x 10% / 4 = 68,25; béo no: 2730 x 10% / 9 = 30,3
  const gioiHan = tinhGioiHanNenHanChe(2730, quyDinh);
  assert.equal(gioiHan.muoi_g_toi_da, 5);
  assert.equal(gioiHan.duong_g_toi_da, 68);
  assert.equal(gioiHan.beo_no_g_toi_da, 30);
});
