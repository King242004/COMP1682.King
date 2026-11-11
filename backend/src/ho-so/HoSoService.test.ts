import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chonCanBatDau, chonCanGiuQuanh, chonMucVanDongTheoTuoi, chonTocDoGiamCan, docMaNhomDiUng, docNgaySinh, kiemTraCanMucTieu, duocChonNhanh, phanLoaiBmi, tinhBmi, tinhChuyenHoaCoBan, tinhMucTieuCalo, tinhTuoi } from './HoSoService.ts';

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

// Giống bảng quy_dinh: Ganpule (Chuẩn Nhật 2025), hằng số của nữ, hệ số vận động nhẹ 1,50, QĐ 2892 (22 và 25 kcal/kg), tốc độ Vừa 2 kg/tháng, 250 kcal mỗi kg/tháng (KSSO 2022)
const heSoNuVanDongNhe = {
  ganpuleHeSoCan: 0.0481,
  ganpuleHeSoChieuCao: 0.0234,
  ganpuleHeSoTuoi: 0.0138,
  ganpuleHangSo: 0.9708,
  kjMoiKcal: 4.186,
  heSoVanDong: 1.5,
  bmiLyTuong: 22,
  giamCanKcalMoiKg: 25,
  soKgGiamMoiThang: 2,
  soKcalBotChoMoiKg: 250,
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

test('giảm cân không cao hơn giữ cân: nữ 90 tuổi, 145 cm, 46 kg, hệ số 1,40 ra 1135 kcal (mức QĐ 2892 là 1156)', () => {
  // Giữ cân 810,5 x 1,40 = 1135; mức QĐ 2892 là 1,45 x 1,45 x 22 x 25 = 1156, cao hơn giữ cân nên lấy giữ cân
  const heSoNuTu75Tuoi = { ...heSoNuVanDongNhe, heSoVanDong: 1.4 };
  assert.equal(tinhMucTieuCalo({ tuoi: 90, chieuCaoCm: 145, canNangKg: 46, mucTieu: 'giu' }, heSoNuTu75Tuoi), 1135);
  assert.equal(tinhMucTieuCalo({ tuoi: 90, chieuCaoCm: 145, canNangKg: 46, mucTieu: 'giam' }, heSoNuTu75Tuoi), 1135);
});

test('nam dùng hằng số của nam: 30 tuổi, 170 cm, 100 kg giữ cân 2849, giảm cân 2349 kcal', () => {
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 170, canNangKg: 100, mucTieu: 'giu' }, heSoNamVanDongNhe), 2849);
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 170, canNangKg: 100, mucTieu: 'giam' }, heSoNamVanDongNhe), 2349);
});

test('giảm nhanh 3 kg/tháng cắt 750 kcal: nam 30 tuổi, 170 cm, 100 kg ra 2849 − 750 = 2099 kcal', () => {
  const heSoNamGiamNhanh = { ...heSoNamVanDongNhe, soKgGiamMoiThang: 3 };
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 170, canNangKg: 100, mucTieu: 'giam' }, heSoNamGiamNhanh), 2099);
});

test('giảm nhanh vẫn không thấp hơn mức QĐ 2892: nữ 30 tuổi, 155 cm, 55 kg vẫn ra 1321 kcal', () => {
  const heSoNuGiamNhanh = { ...heSoNuVanDongNhe, soKgGiamMoiThang: 3 };
  assert.equal(tinhMucTieuCalo({ tuoi: 30, chieuCaoCm: 155, canNangKg: 55, mucTieu: 'giam' }, heSoNuGiamNhanh), 1321);
});

test('nút Nhanh chỉ chọn được khi bớt đủ 750 kcal mà vẫn trên mức tối thiểu', () => {
  assert.equal(duocChonNhanh(2849, 1590, 3, 250), true);
  assert.equal(duocChonNhanh(1751, 1321, 3, 250), false);
  assert.equal(duocChonNhanh(2340, 1590, 3, 250), true);
  assert.equal(duocChonNhanh(2339, 1590, 3, 250), false);
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

// Ngưỡng cân mục tiêu giống bảng quy_dinh: sàn giảm cân BMI 18,5 (QĐ 2892), cân lý tưởng BMI 22
const nguongCanMucTieu = { bmiSanGiamCan: 18.5, bmiLyTuong: 22 };

test('cân mục tiêu giảm cân: nhỏ hơn cân hiện tại và không dưới sàn BMI', () => {
  assert.equal(kiemTraCanMucTieu(65, 'giam', 72, 170, nguongCanMucTieu), null);
  assert.equal(kiemTraCanMucTieu(72, 'giam', 72, 170, nguongCanMucTieu), 'Cân mục tiêu phải nhỏ hơn cân hiện tại');
  assert.equal(kiemTraCanMucTieu(53.4, 'giam', 72, 170, nguongCanMucTieu), 'Cân mục tiêu thấp nhất là 53,5 kg');
  // 117,9 lb (số thấp nhất app báo cho người dùng Anh-Mỹ) đổi ra kg vẫn qua
  assert.equal(kiemTraCanMucTieu(53.4785, 'giam', 72, 170, nguongCanMucTieu), null);
});

test('cân mục tiêu giảm cân từ 65 tuổi dùng sàn BMI 21,5', () => {
  assert.equal(
    kiemTraCanMucTieu(60, 'giam', 72, 170, { bmiSanGiamCan: 21.5, bmiLyTuong: 22 }),
    'Cân mục tiêu thấp nhất là 62,2 kg',
  );
});

test('cân mục tiêu tăng cân: lớn hơn cân hiện tại và không quá cân lý tưởng', () => {
  assert.equal(kiemTraCanMucTieu(62, 'tang', 55, 175, nguongCanMucTieu), null);
  assert.equal(kiemTraCanMucTieu(55, 'tang', 55, 175, nguongCanMucTieu), 'Cân mục tiêu phải lớn hơn cân hiện tại');
  assert.equal(kiemTraCanMucTieu(67.4, 'tang', 55, 175, nguongCanMucTieu), 'Cân mục tiêu cao nhất là 67,3 kg');
  assert.equal(kiemTraCanMucTieu(67.375, 'tang', 55, 175, nguongCanMucTieu), null);
});

test('cân mục tiêu ngoài 30–300 kg', () => {
  assert.equal(kiemTraCanMucTieu(29, 'giam', 40, 100, nguongCanMucTieu), 'Cân mục tiêu từ 30 đến 300 kg');
});

// Hồ sơ cũ đang giảm cân về 65 kg, bắt đầu từ 72 kg
const hoSoDangGiam = {
  gioi_tinh: 'nam' as const,
  ngay_sinh: '1996-01-01',
  chieu_cao_cm: 170,
  can_nang_kg: 70,
  muc_van_dong: 'trung_binh' as const,
  muc_tieu: 'giam' as const,
  muc_tieu_calo: 1900,
  di_ung_kieng_an: '',
  vong_eo_cm: 92,
  can_muc_tieu_kg: 65,
  can_bat_dau_kg: 72,
  can_giu_quanh_kg: null,
  toc_do_giam_can: 'vua' as const,
};

test('chọn cân lúc bắt đầu: giữ số cũ khi không đổi mục tiêu, tính lại khi đổi', () => {
  assert.equal(chonCanBatDau(hoSoDangGiam, 'giu', null, 70), null);
  assert.equal(chonCanBatDau(hoSoDangGiam, 'giam', null, 70), null);
  assert.equal(chonCanBatDau(hoSoDangGiam, 'giam', 65, 70), 72);
  assert.equal(chonCanBatDau(hoSoDangGiam, 'giam', 63, 70), 70);
  assert.equal(chonCanBatDau(hoSoDangGiam, 'tang', 62, 55), 55);
  assert.equal(chonCanBatDau({ ...hoSoDangGiam, can_muc_tieu_kg: null, can_bat_dau_kg: null }, 'giam', 65, 72), 72);
});

// Hồ sơ cũ đang giữ cân quanh 80 kg
const hoSoDangGiu = { ...hoSoDangGiam, muc_tieu: 'giu' as const, can_muc_tieu_kg: null, can_bat_dau_kg: null, can_giu_quanh_kg: 80 };

test('chọn cân giữ quanh: mới chuyển sang giữ cân thì lấy cân lúc này, đang giữ thì giữ số cũ, không giữ thì không có', () => {
  assert.equal(chonCanGiuQuanh(hoSoDangGiam, 'giu', 65.2), 65.2);
  assert.equal(chonCanGiuQuanh(hoSoDangGiu, 'giu', 82), 80);
  assert.equal(chonCanGiuQuanh({ ...hoSoDangGiu, can_giu_quanh_kg: null }, 'giu', 82), 82);
  assert.equal(chonCanGiuQuanh(hoSoDangGiu, 'giam', 82), null);
  assert.equal(chonCanGiuQuanh(hoSoDangGiam, 'tang', 70), null);
});

test('tốc độ giảm cân: gửi Nhanh khi đang giảm cân thì lưu Nhanh', () => {
  assert.equal(chonTocDoGiamCan('vua', 'nhanh', 'giam', 'giam'), 'nhanh');
});

test('tốc độ giảm cân: không gửi thì giữ tốc độ cũ, chưa có thì Vừa', () => {
  assert.equal(chonTocDoGiamCan('nhanh', undefined, 'giam', 'giam'), 'nhanh');
  assert.equal(chonTocDoGiamCan(null, undefined, 'giam', 'giam'), 'vua');
});

test('tốc độ giảm cân: mục tiêu lưu không phải giảm cân thì không có tốc độ', () => {
  assert.equal(chonTocDoGiamCan('nhanh', 'nhanh', 'giam', 'giu'), null);
  assert.equal(chonTocDoGiamCan('vua', undefined, 'tang', 'tang'), null);
});

test('tốc độ giảm cân: gửi giá trị lạ thì báo lỗi', () => {
  assert.throws(() => chonTocDoGiamCan('vua', 'cham', 'giam', 'giam'), /Tốc độ giảm cân không hợp lệ/);
});
