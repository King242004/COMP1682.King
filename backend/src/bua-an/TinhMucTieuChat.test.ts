import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhMucTieuChat } from './TinhMucTieuChat.ts';

// Giống bảng quy_dinh: Bộ Y tế 2016 (đạm 13-20%, béo 20-25%) và hệ số Atwater 4/4/9 (FAO 2003)
const quyDinh = {
  tyLeDamThap: 13,
  tyLeDamCao: 20,
  tyLeBeoThap: 20,
  tyLeBeoCao: 25,
  kcalMoiGDam: 4,
  kcalMoiGTinhBot: 4,
  kcalMoiGBeo: 9,
};

test('mục tiêu 2000 kcal: đạm 65-100 g, béo 44-56 g, tinh bột 275-335 g', () => {
  // Đạm: 2000 x 13% / 4 = 65; 2000 x 20% / 4 = 100
  // Béo: 2000 x 20% / 9 = 44,4; 2000 x 25% / 9 = 55,6
  // Tinh bột: còn lại 55-67%: 2000 x 55% / 4 = 275; 2000 x 67% / 4 = 335
  assert.deepEqual(tinhMucTieuChat(2000, quyDinh), {
    dam_g_thap: 65,
    dam_g_cao: 100,
    tinh_bot_g_thap: 275,
    tinh_bot_g_cao: 335,
    beo_g_thap: 44,
    beo_g_cao: 56,
  });
});
