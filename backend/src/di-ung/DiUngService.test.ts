import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NhomDiUng, TuKhoaDiUng } from './DiUngQueries.ts';
import { timNhomDiUng, vietDanhSachDiUngChoAi } from './DiUngService.ts';

// Năm nhóm giả để thử, không phải dữ liệu thật trong database
const tomCua: NhomDiUng = { ma: 'tom_cua', ten: 'Tôm, cua', ma_open_food_facts: 'en:crustaceans' };
const ca: NhomDiUng = { ma: 'ca', ten: 'Cá', ma_open_food_facts: 'en:fish' };
const sua: NhomDiUng = { ma: 'sua', ten: 'Sữa', ma_open_food_facts: 'en:milk' };
const gluten: NhomDiUng = { ma: 'gluten', ten: 'Lúa mì, bột mì (gluten)', ma_open_food_facts: 'en:gluten' };
const trung: NhomDiUng = { ma: 'trung', ten: 'Trứng', ma_open_food_facts: 'en:eggs' };

// Từ khóa giả: "thanh cua" làm từ cá nên là từ bắt của Cá, từ loại trừ của Tôm, cua
const danhSachTuKhoa: TuKhoaDiUng[] = [
  { nhom_di_ung_ma: 'tom_cua', tu_khoa: 'tôm', loai_tru: false },
  { nhom_di_ung_ma: 'tom_cua', tu_khoa: 'cua', loai_tru: false },
  { nhom_di_ung_ma: 'tom_cua', tu_khoa: 'thanh cua', loai_tru: true },
  { nhom_di_ung_ma: 'ca', tu_khoa: 'cá', loai_tru: false },
  { nhom_di_ung_ma: 'ca', tu_khoa: 'nước mắm', loai_tru: false },
  { nhom_di_ung_ma: 'ca', tu_khoa: 'thanh cua', loai_tru: false },
  { nhom_di_ung_ma: 'sua', tu_khoa: 'sữa', loai_tru: false },
  { nhom_di_ung_ma: 'sua', tu_khoa: 'bơ', loai_tru: false },
  { nhom_di_ung_ma: 'sua', tu_khoa: 'quả bơ', loai_tru: true },
  { nhom_di_ung_ma: 'gluten', tu_khoa: 'bánh mỳ', loai_tru: false },
  { nhom_di_ung_ma: 'trung', tu_khoa: 'trứng', loai_tru: false },
];

test('bắt từ khóa nằm trong tên: "Ruốc tôm" có Tôm, cua', () => {
  assert.deepEqual(timNhomDiUng(['Ruốc tôm'], danhSachTuKhoa, [tomCua]), ['Tôm, cua']);
});

test('từ loại trừ của nhóm này vẫn có thể là từ bắt của nhóm khác: "Thanh cua" chỉ có Cá', () => {
  assert.deepEqual(timNhomDiUng(['Thanh cua'], danhSachTuKhoa, [tomCua, ca]), ['Cá']);
});

test('"Quả bơ" không phải bơ sữa', () => {
  assert.deepEqual(timNhomDiUng(['Quả bơ'], danhSachTuKhoa, [sua]), []);
});

test('"Sốt bơ" là bơ sữa', () => {
  assert.deepEqual(timNhomDiUng(['Sốt bơ'], danhSachTuKhoa, [sua]), ['Sữa']);
});

test('xóa từ loại trừ chứ không bỏ cả tên: "Quả bơ, sữa chua" vẫn có Sữa', () => {
  assert.deepEqual(timNhomDiUng(['Quả bơ, sữa chua'], danhSachTuKhoa, [sua]), ['Sữa']);
});

test('chỉ khớp nguyên chữ: "Các loại rau" không có Cá', () => {
  assert.deepEqual(timNhomDiUng(['Các loại rau'], danhSachTuKhoa, [ca]), []);
});

test('tên lưu dấu kiểu tách rời vẫn bắt được', () => {
  assert.deepEqual(timNhomDiUng(['Ruốc tôm'.normalize('NFD')], danhSachTuKhoa, [tomCua]), ['Tôm, cua']);
});

test('một tên trùng nhiều nhóm thì trả đủ, theo thứ tự nhóm đã chọn', () => {
  assert.deepEqual(timNhomDiUng(['Bánh mỳ trứng'], danhSachTuKhoa, [gluten, trung]), ['Lúa mì, bột mì (gluten)', 'Trứng']);
});

test('chưa chọn nhóm nào thì không báo gì', () => {
  assert.deepEqual(timNhomDiUng(['Ruốc tôm'], danhSachTuKhoa, []), []);
});

test('từ khóa có 2 chữ: "Nước mắm cá" có Cá', () => {
  assert.deepEqual(timNhomDiUng(['Nước mắm cá'], danhSachTuKhoa, [ca]), ['Cá']);
});

test('nhiều tên cùng trùng một nhóm thì tên nhóm chỉ ghi một lần', () => {
  assert.deepEqual(timNhomDiUng(['Ruốc tôm', 'Riêu cua'], danhSachTuKhoa, [tomCua]), ['Tôm, cua']);
});

test('viết danh sách dị ứng cho AI: tên nhóm kèm các từ bắt, không có từ loại trừ', () => {
  assert.equal(vietDanhSachDiUngChoAi([ca, tomCua], danhSachTuKhoa), 'Cá (cá, nước mắm, thanh cua); Tôm, cua (tôm, cua)');
});

test('chưa chọn nhóm nào thì danh sách cho AI là chuỗi rỗng', () => {
  assert.equal(vietDanhSachDiUngChoAi([], danhSachTuKhoa), '');
});
