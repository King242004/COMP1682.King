import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhMucTieuChat } from './TinhMucTieuChat.ts';

// Giống bảng quy_dinh: Viện Dinh dưỡng 2026 (đạm 0,93 g/kg, bột đường 50-65%, béo 20-25%, chia 4 và 9)
const quyDinh = {
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
  assert.deepEqual(tinhMucTieuChat(2000, 60, quyDinh), {
    dam_g_toi_thieu: 56,
    tinh_bot_g_thap: 250,
    tinh_bot_g_cao: 325,
    beo_g_thap: 44,
    beo_g_cao: 56,
  });
});

test('khớp công cụ tra cứu của Viện: 1740 kcal ra béo 39-48 g, tinh bột 218-283 g', () => {
  // Công cụ ghi béo 38,7-48,3 g, bột đường 217,5-282,8 g cho nữ 30-49 tuổi lao động nhẹ
  const ketQua = tinhMucTieuChat(1740, 52.7, quyDinh);
  assert.equal(ketQua.beo_g_thap, 39);
  assert.equal(ketQua.beo_g_cao, 48);
  assert.equal(ketQua.tinh_bot_g_thap, 218);
  assert.equal(ketQua.tinh_bot_g_cao, 283);
});
