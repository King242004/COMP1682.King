import assert from 'node:assert/strict';
import { test } from 'node:test';

import { saiSoCoDauTrungBinh, saiSoPhanTramTrungVi, saiSoTuyetDoiTrungBinh } from './TinhSaiSo.ts';

// Ba đĩa thật 200, 400, 500 kcal; AI đoán 150, 440, 500
const baDia = [
  { that: 200, doan: 150 },
  { that: 400, doan: 440 },
  { that: 500, doan: 500 },
];

test('sai số tuyệt đối trung bình: (50 + 40 + 0) / 3 = 30', () => {
  assert.equal(saiSoTuyetDoiTrungBinh(baDia), 30);
});

test('sai số có dấu trung bình: (-50 + 40 + 0) / 3 = -3,3 (hơi đoán thấp)', () => {
  assert.equal(saiSoCoDauTrungBinh(baDia), -3.3);
});

test('sai số phần trăm trung vị: 25%, 10%, 0% xếp lại là 0, 10, 25 nên trung vị 10', () => {
  assert.equal(saiSoPhanTramTrungVi(baDia), 10);
});

test('số phần tử chẵn thì lấy trung bình hai số giữa; bỏ đĩa có số thật bằng 0', () => {
  const danhSach = [
    { that: 100, doan: 110 },
    { that: 100, doan: 130 },
    { that: 0, doan: 50 },
  ];
  // Còn 10% và 30%, trung vị là 20%
  assert.equal(saiSoPhanTramTrungVi(danhSach), 20);
});

test('danh sách rỗng thì trả về 0', () => {
  assert.equal(saiSoTuyetDoiTrungBinh([]), 0);
  assert.equal(saiSoPhanTramTrungVi([]), 0);
});
