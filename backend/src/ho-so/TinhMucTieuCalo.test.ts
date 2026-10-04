import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhMucTieuCalo } from './TinhMucTieuCalo.ts';

// Nam 20-29 tuổi, vận động nhẹ: số liệu giống bảng của Bộ Y tế 2016 và QĐ 2892
const heSoNam25TuoiVanDongNhe = { kcalMoiKg: 24.0, heSoVanDong: 1.5, bmiLyTuong: 22, giamCanKcalMoiKg: 25 };

test('khớp ví dụ trong tài liệu Bộ Y tế: 61,1 kg, hệ số 1,75 ra khoảng 2566 kcal', () => {
  // 24,0 x 61,1 = 1466,4 (tài liệu làm tròn thành 1470); 1466,4 x 1,75 = 2566,2. Tài liệu ghi 2572
  const heSo = { ...heSoNam25TuoiVanDongNhe, heSoVanDong: 1.75 };
  assert.equal(tinhMucTieuCalo({ canNangKg: 61.1, chieuCaoCm: 170, mucTieu: 'giu' }, heSo), 2566);
});

test('giữ cân: 60 kg ra 24 x 60 x 1,5 = 2160 kcal', () => {
  assert.equal(tinhMucTieuCalo({ canNangKg: 60, chieuCaoCm: 170, mucTieu: 'giu' }, heSoNam25TuoiVanDongNhe), 2160);
});

test('giảm cân: cao 160 cm, cân nặng lý tưởng 56,32 kg x 25 = 1408 kcal', () => {
  assert.equal(tinhMucTieuCalo({ canNangKg: 58, chieuCaoCm: 160, mucTieu: 'giam' }, heSoNam25TuoiVanDongNhe), 1408);
});

test('giảm cân tính theo cân nặng lý tưởng: cùng chiều cao thì cùng mục tiêu, dù nặng bao nhiêu', () => {
  const nguoiNhe = tinhMucTieuCalo({ canNangKg: 58, chieuCaoCm: 160, mucTieu: 'giam' }, heSoNam25TuoiVanDongNhe);
  const nguoiNang = tinhMucTieuCalo({ canNangKg: 90, chieuCaoCm: 160, mucTieu: 'giam' }, heSoNam25TuoiVanDongNhe);
  assert.equal(nguoiNang, nguoiNhe);
});

test('tăng cân: 50 kg, cao 170 cm ăn theo cân nặng lý tưởng 24 x 63,58 x 1,5 = 2289 kcal', () => {
  assert.equal(tinhMucTieuCalo({ canNangKg: 50, chieuCaoCm: 170, mucTieu: 'tang' }, heSoNam25TuoiVanDongNhe), 2289);
});
