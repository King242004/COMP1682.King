import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  docCanNang,
  docChieuCaoFeetInch,
  docKhoiLuong,
  doiCmRaFeetInch,
  doiGamRaDonVi,
  doiKgRaDonVi,
  vietCanNang,
  vietChieuCao,
  vietGioiHan,
  vietKhoiLuong,
  vietThayDoiCanNang,
} from './DoiDonVi.ts';

// Giống bảng quy_dinh (NIST Handbook 44, Phụ lục C)
const HE_SO = { kgMoiPound: 0.45359237, cmMoiInch: 2.54, inchMoiFoot: 12, gamMoiOunce: 28.349523125 };

test('cân nặng: Mét giữ kg làm tròn 1 số lẻ, Anh-Mỹ đổi ra lb', () => {
  assert.equal(vietCanNang(50, 'met', HE_SO), '50 kg');
  assert.equal(vietCanNang(68.04, 'met', HE_SO), '68 kg');
  assert.equal(vietCanNang(50, 'anh_my', HE_SO), '110,2 lb');
  assert.equal(vietCanNang(70, 'anh_my', HE_SO), '154,3 lb');
  assert.equal(vietCanNang(68.04, 'anh_my', HE_SO), '150 lb');
});

test('chưa tải xong hệ số thì hiện theo Mét', () => {
  assert.equal(vietCanNang(50, 'anh_my', null), '50 kg');
});

test('thay đổi cân nặng có dấu', () => {
  assert.equal(vietThayDoiCanNang(0.4, 'anh_my', HE_SO), '+0,9 lb');
  assert.equal(vietThayDoiCanNang(-1, 'met', HE_SO), '−1 kg');
  assert.equal(vietThayDoiCanNang(0, 'met', HE_SO), '0 kg');
});

test('chiều cao: Anh-Mỹ ra ft và in, không bao giờ có 12 in', () => {
  assert.equal(vietChieuCao(170, 'anh_my', HE_SO), '5 ft 7 in');
  assert.equal(vietChieuCao(182.5, 'anh_my', HE_SO), '6 ft 0 in');
  assert.equal(vietChieuCao(170, 'met', HE_SO), '170 cm');
});

test('lượng thức ăn: Anh-Mỹ ra oz 1 số lẻ', () => {
  assert.equal(vietKhoiLuong(150, 'anh_my', HE_SO), '5,3 oz');
  assert.equal(vietKhoiLuong(150, 'met', HE_SO), '150 g');
});

test('số cân để điền sẵn ô và vẽ trục biểu đồ: cả hai đơn vị làm tròn 1 số lẻ', () => {
  assert.equal(doiKgRaDonVi(50, 'anh_my', HE_SO), 110.2);
  assert.equal(doiKgRaDonVi(50, 'met', HE_SO), 50);
  assert.equal(doiKgRaDonVi(69.98949, 'met', HE_SO), 70);
});

test('đổi cm ra ft và in để điền 2 ô; làm tròn tổng số inch trước nên không có 12 in', () => {
  assert.deepEqual(doiCmRaFeetInch(170, HE_SO), { feet: 5, inch: 7 });
  assert.deepEqual(doiCmRaFeetInch(182.5, HE_SO), { feet: 6, inch: 0 });
});

test('số lượng thức ăn theo đơn vị để điền sẵn ô: oz 1 số lẻ, Mét giữ g', () => {
  assert.equal(doiGamRaDonVi(150, 'anh_my', HE_SO), 5.3);
  assert.equal(doiGamRaDonVi(150, 'met', HE_SO), 150);
});

test('đọc cân nặng người dùng gõ: nhận dấu phẩy, lb đổi ra kg, không làm tròn', () => {
  assert.equal(Math.round((docCanNang('110,2', 'anh_my', HE_SO) ?? 0) * 10) / 10, 50);
  assert.equal(docCanNang('50,4', 'met', HE_SO), 50.4);
  assert.equal(docCanNang('', 'met', HE_SO), null);
  assert.equal(docCanNang('abc', 'met', HE_SO), null);
});

test('gõ lb sát giới hạn: 66,1 lb dưới 30 kg, 66,2 lb từ 30 kg trở lên', () => {
  assert.ok((docCanNang('66,1', 'anh_my', HE_SO) ?? 0) < 30);
  assert.ok((docCanNang('66,2', 'anh_my', HE_SO) ?? 0) >= 30);
});

test('gõ 150 lb, lưu 2 số lẻ, hiện lại vẫn là 150 lb', () => {
  const canNangLuu = Math.round((docCanNang('150', 'anh_my', HE_SO) ?? 0) * 100) / 100;
  assert.equal(vietCanNang(canNangLuu, 'anh_my', HE_SO), '150 lb');
});

test('đọc chiều cao ft và in ra cm; inch trống là 0; inch từ 12 trở lên là sai', () => {
  assert.equal(docChieuCaoFeetInch('5', '7', HE_SO), 170.2);
  assert.equal(docChieuCaoFeetInch('6', '', HE_SO), 182.9);
  assert.equal(docChieuCaoFeetInch('5', '12', HE_SO), null);
});

test('đọc lượng thức ăn: oz đổi ra g 1 số lẻ', () => {
  assert.equal(docKhoiLuong('5,3', 'anh_my', HE_SO), 150.3);
  assert.equal(docKhoiLuong('150', 'met', HE_SO), 150);
});

test('giới hạn theo đơn vị: cận dưới làm tròn lên, cận trên làm tròn xuống', () => {
  assert.equal(vietGioiHan(30, 300, 'can_nang', 'anh_my', HE_SO), 'từ 66,2 đến 661,3 lb');
  assert.equal(vietGioiHan(30, 300, 'can_nang', 'met', HE_SO), 'từ 30 đến 300 kg');
  assert.equal(vietGioiHan(100, 250, 'chieu_cao', 'anh_my', HE_SO), 'từ 3 ft 4 in đến 8 ft 2 in');
  assert.equal(vietGioiHan(100, 250, 'chieu_cao', 'met', HE_SO), 'từ 100 đến 250 cm');
  assert.equal(vietGioiHan(1, 5000, 'khoi_luong', 'anh_my', HE_SO), 'từ 0,1 đến 176,3 oz');
  assert.equal(vietGioiHan(1, 5000, 'khoi_luong', 'met', HE_SO), 'từ 1 đến 5.000 g');
});
