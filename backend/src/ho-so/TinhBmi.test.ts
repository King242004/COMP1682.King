import assert from 'node:assert/strict';
import { test } from 'node:test';

import { phanLoaiBmi, tinhBmi } from './TinhBmi.ts';

// Ngưỡng giống bảng quy_dinh (QĐ 2892, Bảng 4.1)
const nguong = { thieuCan: 18.5, thuaCan: 23, beoPhiDo1: 25, beoPhiDo2: 30 };

test('tính BMI: 60 kg, cao 170 cm ra 20,8', () => {
  assert.equal(tinhBmi(60, 170), 20.8);
});

test('phân loại đúng ở từng ngưỡng', () => {
  assert.equal(phanLoaiBmi(18.4, nguong), 'Thiếu cân');
  assert.equal(phanLoaiBmi(18.5, nguong), 'Bình thường');
  assert.equal(phanLoaiBmi(22.9, nguong), 'Bình thường');
  assert.equal(phanLoaiBmi(23, nguong), 'Thừa cân');
  assert.equal(phanLoaiBmi(25, nguong), 'Béo phì độ I');
  assert.equal(phanLoaiBmi(30, nguong), 'Béo phì độ II');
});
