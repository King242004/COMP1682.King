import assert from 'node:assert/strict';
import { test } from 'node:test';

import { doiRaSoNgay, tinhXuHuongCanNang } from './TinhXuHuongCanNang.ts';

test('hai ngày liền nhau cách nhau 1, qua tháng vẫn đúng', () => {
  assert.equal(doiRaSoNgay('2026-10-07') - doiRaSoNgay('2026-10-06'), 1);
  assert.equal(doiRaSoNgay('2026-10-01') - doiRaSoNgay('2026-09-30'), 1);
});

test('lần cân đầu tiên: xu hướng bằng chính nó', () => {
  const diem = tinhXuHuongCanNang([{ ngay: '2026-10-01', can_nang_kg: 52 }], 7);
  assert.equal(diem[0].xu_huong_kg, 52);
});

test('xu hướng là trung bình các lần cân trong 7 ngày tính tới ngày đó', () => {
  const diem = tinhXuHuongCanNang(
    [
      { ngay: '2026-10-01', can_nang_kg: 52.4 },
      { ngay: '2026-10-03', can_nang_kg: 51.6 },
      { ngay: '2026-10-07', can_nang_kg: 52.0 },
      // Ngày 10: ngày 01 và 03 đã ra khỏi cửa sổ 7 ngày (04 tới 10)
      { ngay: '2026-10-10', can_nang_kg: 51.4 },
    ],
    7,
  );
  // Ngày 07: (52,4 + 51,6 + 52,0) / 3 = 52,0
  assert.equal(diem[2].xu_huong_kg, 52);
  // Ngày 10: (52,0 + 51,4) / 2 = 51,7
  assert.equal(diem[3].xu_huong_kg, 51.7);
});
