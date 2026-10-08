import assert from 'node:assert/strict';
import { test } from 'node:test';

import { laDungTen, soTenMon } from './SoTenMon.ts';

test('tên AI dài hơn nhưng chứa tên món là đúng, không phân biệt dấu và hoa thường', () => {
  assert.equal(laDungTen('Phở bò tái', ['Phở']), true);
  assert.equal(laDungTen('PHO BO', ['Phở']), true);
  assert.equal(laDungTen('Bún chả Hà Nội', ['Bún chả']), true);
});

test('tên vùng khác được chấp nhận; món khác thì sai', () => {
  assert.equal(laDungTen('Nem rán', ['Chả giò', 'Nem rán']), true);
  assert.equal(laDungTen('Bún bò Huế', ['Phở']), false);
});

test('chữ đ được bỏ dấu thành d', () => {
  assert.equal(laDungTen('Bánh đúc', ['banh duc']), true);
});

test('đúng ở khả năng thứ hai: sai khả năng đầu nhưng đúng trong 3 khả năng', () => {
  const ketQua = soTenMon(['Bún riêu', 'Bún bò Huế', 'Phở'], ['Bún bò Huế']);
  assert.equal(ketQua.dungKhaNangDau, false);
  assert.equal(ketQua.dungTrongBaKhaNang, true);
});

test('AI không đưa khả năng nào thì sai cả hai', () => {
  assert.deepEqual(soTenMon([], ['Phở']), { dungKhaNangDau: false, dungTrongBaKhaNang: false });
});
