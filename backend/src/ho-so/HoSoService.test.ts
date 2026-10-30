import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chonMucVanDongTheoTuoi, docMaNhomDiUng, docNgaySinh, phanLoaiBmi, tinhBmi, tinhChuyenHoaCoBan, tinhMucTieuCalo, tinhTuoi } from './HoSoService.ts';

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

test('BMR (Ganpule): nam 22 tuổi, 170 cm, 50 kg ra 1351 kcal; nhân 1,5 ra TDEE 2027 đúng bằng mục tiêu giữ cân', () => {
  const chuyenHoaCoBan = tinhChuyenHoaCoBan(50, 170, 22, heSoNamVanDongNhe);
  assert.equal(Math.round(chuyenHoaCoBan), 1351);
  assert.equal(Math.round(chuyenHoaCoBan * 1.5), 2027);
  assert.equal(tinhMucTieuCalo({ tuoi: 22, chieuCaoCm: 170, canNangKg: 50, mucTieu: 'giu' }, heSoNamVanDongNhe), 2027);
});

// Mã 9 nhóm dị ứng như trong bảng nhom_di_ung
const maNhomHopLe = ['gluten', 'tom_cua', 'trung', 'ca', 'lac', 'sua', 'vung', 'hat_cay', 'nhuyen_the'];

test('nhóm dị ứng: không gửi thì coi như chưa chọn nhóm nào', () => {
  assert.deepEqual(docMaNhomDiUng(undefined, maNhomHopLe), []);
});

test('nhóm dị ứng: mã đúng thì giữ nguyên', () => {
  assert.deepEqual(docMaNhomDiUng(['tom_cua', 'sua'], maNhomHopLe), ['tom_cua', 'sua']);
});

test('nhóm dị ứng: mã không có thật, gửi trùng, không phải mảng hoặc không phải chữ thì không hợp lệ', () => {
  assert.equal(docMaNhomDiUng(['ga'], maNhomHopLe), null);
  assert.equal(docMaNhomDiUng(['sua', 'sua'], maNhomHopLe), null);
  assert.equal(docMaNhomDiUng('sua', maNhomHopLe), null);
  assert.equal(docMaNhomDiUng([1], maNhomHopLe), null);
});

test('mức vận động theo tuổi: từ tuổi không còn mức nặng thì nặng thành trung bình, mức khác giữ nguyên', () => {
  assert.equal(chonMucVanDongTheoTuoi('nang', 75, 75), 'trung_binh');
  assert.equal(chonMucVanDongTheoTuoi('nang', 74, 75), 'nang');
  assert.equal(chonMucVanDongTheoTuoi('nhe', 80, 75), 'nhe');
});

test('tuổi tính theo ngày sinh: chưa tới sinh nhật năm nay thì trừ 1', () => {
  assert.equal(tinhTuoi('2004-11-24', '2026-11-23'), 21);
  assert.equal(tinhTuoi('2004-11-24', '2026-11-24'), 22);
  assert.equal(tinhTuoi('2004-11-24', '2026-12-01'), 22);
});

test('tuổi của người sinh 29/2: năm không nhuận thì sang 1/3 mới thêm tuổi', () => {
  assert.equal(tinhTuoi('2004-02-29', '2026-02-28'), 21);
  assert.equal(tinhTuoi('2004-02-29', '2026-03-01'), 22);
});

test('đọc ngày sinh app gửi lên: đúng dạng năm-tháng-ngày và là ngày có thật', () => {
  assert.equal(docNgaySinh('2004-11-24'), '2004-11-24');
  assert.equal(docNgaySinh('2004-02-30'), null);
  assert.equal(docNgaySinh('2005-02-29'), null);
  assert.equal(docNgaySinh('24/11/2004'), null);
  assert.equal(docNgaySinh(2004), null);
});
