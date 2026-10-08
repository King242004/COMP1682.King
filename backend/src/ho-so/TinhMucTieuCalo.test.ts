import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhMucTieuCalo } from './TinhMucTieuCalo.ts';

// Giống bảng quy_dinh: Ganpule (Chuẩn Nhật 2025), hằng số của nữ, hệ số vận động nhẹ 1,50, QĐ 2892 (22 và 25 kcal/kg), cắt tối đa 500 (KSSO 2022)
const heSoNuVanDongNhe = {
  ganpuleHeSoCan: 0.0481,
  ganpuleHeSoChieuCao: 0.0234,
  ganpuleHeSoTuoi: 0.0138,
  ganpuleHangSo: 0.9708,
  kjMoiKcal: 4.186,
  heSoVanDong: 1.5,
  bmiLyTuong: 22,
  giamCanKcalMoiKg: 25,
  giamCanKcalCatToiDa: 500,
};

// Giống trên nhưng là hằng số của nam
const heSoNamVanDongNhe = { ...heSoNuVanDongNhe, ganpuleHangSo: 0.4235 };

test('giữ cân: nữ 30 tuổi, 155 cm, 65 kg ra Ganpule 1282,5 x 1,5 = 1924 kcal', () => {
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 155, canNangKg: 65, mucTieu: 'giu' }, heSoNuVanDongNhe), 1924);
});

test('giảm cân người nặng hơn cân lý tưởng nhiều: cắt đúng 500 so với giữ cân, ra 1424 kcal', () => {
  // QĐ 2892: 1,55 x 1,55 x 22 x 25 = 1321; giữ cân trừ 500 = 1424; lấy số lớn hơn
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 155, canNangKg: 65, mucTieu: 'giam' }, heSoNuVanDongNhe), 1424);
});

test('giảm cân người gần cân lý tưởng: không thấp hơn mức QĐ 2892, ra 1321 kcal', () => {
  // Giữ cân 1751 trừ 500 = 1251, thấp hơn mức QĐ 2892 là 1321, nên lấy 1321
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 155, canNangKg: 55, mucTieu: 'giam' }, heSoNuVanDongNhe), 1321);
});

test('nam dùng hằng số của nam: 30 tuổi, 170 cm, 100 kg giữ cân 2849, giảm cân 2349 kcal', () => {
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 170, canNangKg: 100, mucTieu: 'giu' }, heSoNamVanDongNhe), 2849);
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 170, canNangKg: 100, mucTieu: 'giam' }, heSoNamVanDongNhe), 2349);
});

test('tăng cân: nam 25 tuổi, 165 cm, 50 kg ăn theo cân lý tưởng 59,9 kg, ra 2141 kcal (giữ cân là 1970)', () => {
  assert.equal(tinhMucTieuCalo({ tuoi: 25, chieuCaoCm: 165, canNangKg: 50, mucTieu: 'tang' }, heSoNamVanDongNhe), 2141);
  assert.equal(tinhMucTieuCalo({ tuoi: 25, chieuCaoCm: 165, canNangKg: 50, mucTieu: 'giu' }, heSoNamVanDongNhe), 1970);
});
