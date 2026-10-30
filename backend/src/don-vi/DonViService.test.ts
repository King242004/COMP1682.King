import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docDonVi, vietCanNang, vietChieuCao, vietKhoiLuong, vietLoiDanDonViChoAi, vietThayDoiCanNang } from './DonViService.ts';

// Giống bảng quy_dinh (NIST Handbook 44, Phụ lục C)
const HE_SO = { kgMoiPound: 0.45359237, cmMoiInch: 2.54, inchMoiFoot: 12, gamMoiOunce: 28.349523125 };

test('đọc đơn vị: chỉ nhận met và anh_my', () => {
  assert.equal(docDonVi('met'), 'met');
  assert.equal(docDonVi('anh_my'), 'anh_my');
  assert.equal(docDonVi('kg'), null);
  assert.equal(docDonVi(undefined), null);
});

test('cân nặng: Mét giữ kg làm tròn 1 số lẻ, Anh-Mỹ đổi ra lb', () => {
  assert.equal(vietCanNang(50, 'met', HE_SO), '50 kg');
  assert.equal(vietCanNang(68.04, 'met', HE_SO), '68 kg');
  assert.equal(vietCanNang(50, 'anh_my', HE_SO), '110,2 lb');
  assert.equal(vietCanNang(70, 'anh_my', HE_SO), '154,3 lb');
  assert.equal(vietCanNang(68.04, 'anh_my', HE_SO), '150 lb');
});

test('cân nặng: chưa có hệ số thì hiện theo Mét', () => {
  assert.equal(vietCanNang(50, 'anh_my', null), '50 kg');
});

test('thay đổi cân nặng có dấu', () => {
  assert.equal(vietThayDoiCanNang(0.4, 'anh_my', HE_SO), '+0,9 lb');
  assert.equal(vietThayDoiCanNang(-1, 'met', HE_SO), '−1 kg');
  assert.equal(vietThayDoiCanNang(0, 'met', HE_SO), '0 kg');
});

test('chiều cao: Anh-Mỹ ra ft và in, làm tròn inch trước nên không bao giờ có 12 in', () => {
  assert.equal(vietChieuCao(170, 'anh_my', HE_SO), '5 ft 7 in');
  assert.equal(vietChieuCao(182.5, 'anh_my', HE_SO), '6 ft 0 in');
  assert.equal(vietChieuCao(170, 'met', HE_SO), '170 cm');
});

test('lượng thức ăn: Anh-Mỹ ra oz 1 số lẻ', () => {
  assert.equal(vietKhoiLuong(150, 'anh_my', HE_SO), '5,3 oz');
  assert.equal(vietKhoiLuong(150, 'met', HE_SO), '150 g');
});

test('lời dặn AI: Mét không dặn gì, Anh-Mỹ dặn dùng lb và oz', () => {
  assert.equal(vietLoiDanDonViChoAi('met'), '');
  assert.ok(vietLoiDanDonViChoAi('anh_my').includes('lb'));
  assert.ok(vietLoiDanDonViChoAi('anh_my').includes('oz'));
});
