import assert from 'node:assert/strict';
import { test } from 'node:test';

import { kiemTraKhoangNgay, tomTatBaoCao, tomTatUongNuoc, tongHopCacNgay } from './BaoCaoService.ts';

// Giới hạn muối, đường, béo no của mục tiêu 1.900 kcal (muối 5 g; đường 1.900 x 10% / 4 = 47,5; béo no 1.900 x 10% / 9 = 21,1)
const gioiHan = {
  muoi_g_toi_da: 5,
  duong_g_toi_da: 48,
  beo_no_g_toi_da: 21,
};

// Giống bảng quy_dinh: đạm và tinh bột 4 kcal/g, béo 9 kcal/g; tinh bột 50-65%, béo 20-25% năng lượng
const quyDinhBaoCao = {
  kcalMoiGDam: 4,
  kcalMoiGTinhBot: 4,
  kcalMoiGBeo: 9,
  tyLeTinhBotThap: 50,
  tyLeTinhBotCao: 65,
  tyLeBeoThap: 20,
  tyLeBeoCao: 25,
};

test('khoảng ngày đúng 31 ngày thì không báo lỗi', () => {
  assert.doesNotThrow(() => kiemTraKhoangNgay('2026-10-01', '2026-10-31', 31));
});

test('khoảng 32 ngày, ngày ngược, ngày sai dạng đều báo lỗi 400', () => {
  assert.throws(() => kiemTraKhoangNgay('2026-10-01', '2026-11-01', 31), { status: 400 });
  assert.throws(() => kiemTraKhoangNgay('2026-11-02', '2026-10-27', 31), { status: 400 });
  assert.throws(() => kiemTraKhoangNgay('2026-10-1', '2026-10-31', 31), { status: 400 });
});

test('gom món theo ngày; vượt là lớn hơn hẳn, ăn đúng bằng mục tiêu không tính vượt', () => {
  const danhSachMon = [
    { ngay: '2026-10-27', ten_mon: 'Phở bò', so_calo: 450, dam_g: 25, tinh_bot_g: 60, beo_g: 12, muoi_g: 3, duong_g: 2, beo_no_g: 4 },
    { ngay: '2026-10-27', ten_mon: 'Cơm sườn', so_calo: 1500, dam_g: 40, tinh_bot_g: 180, beo_g: 50, muoi_g: 2.5, duong_g: 10, beo_no_g: 15 },
    { ngay: '2026-10-29', ten_mon: 'Bún chả', so_calo: 1900, dam_g: null, tinh_bot_g: null, beo_g: null, muoi_g: null, duong_g: null, beo_no_g: null },
  ];
  const cacNgay = tongHopCacNgay(danhSachMon, 1900, gioiHan);
  assert.equal(cacNgay.length, 2);

  // Ngày 27: 450 + 1.500 = 1.950 kcal; muối 3 + 2,5 = 5,5 g
  assert.equal(cacNgay[0].ngay, '2026-10-27');
  assert.deepEqual(cacNgay[0].ten_mon, ['Phở bò', 'Cơm sườn']);
  assert.equal(cacNgay[0].tong_hop.tong_calo, 1950);
  assert.equal(cacNgay[0].vuot_calo, true);
  assert.equal(cacNgay[0].vuot_muoi, true);
  assert.equal(cacNgay[0].vuot_duong, false);
  assert.equal(cacNgay[0].vuot_beo_no, false);

  // Ngày 29: đúng 1.900 kcal
  assert.equal(cacNgay[1].ngay, '2026-10-29');
  assert.equal(cacNgay[1].vuot_calo, false);
  assert.equal(cacNgay[1].vuot_muoi, false);
});

test('tóm tắt 2 ngày: trung bình, % năng lượng 3 chất, đếm ngày vượt', () => {
  const danhSachMon = [
    { ngay: '2026-10-27', ten_mon: 'Ngày A', so_calo: 1800, dam_g: 70, tinh_bot_g: 250, beo_g: 50, muoi_g: 6, duong_g: 10, beo_no_g: 10 },
    { ngay: '2026-10-28', ten_mon: 'Ngày B', so_calo: 2100, dam_g: 66, tinh_bot_g: 262, beo_g: 58, muoi_g: 4, duong_g: 10, beo_no_g: 25 },
  ];
  const cacNgay = tongHopCacNgay(danhSachMon, 1900, gioiHan);

  // Năng lượng: đạm 136 x 4 = 544, tinh bột 512 x 4 = 2.048, béo 108 x 9 = 972; tổng 3.564
  assert.deepEqual(tomTatBaoCao(cacNgay, 62, quyDinhBaoCao), {
    so_ngay_co_ghi: 2,
    so_ngay_khong_vuot: 1,
    calo_trung_binh: 1950,
    dam_g_trung_binh: 68,
    phan_tram_dam: 15,
    phan_tram_tinh_bot: 57,
    phan_tram_beo: 27,
    dam_dat: true,
    tinh_bot_dat: true,
    beo_dat: false,
    so_ngay_vuot_muoi: 1,
    so_ngay_vuot_duong: 0,
    so_ngay_vuot_beo_no: 1,
  });
});

test('béo đúng 25% năng lượng vẫn nằm trong khoảng', () => {
  // Đạm 63 x 4 = 252, tinh bột 180 x 4 = 720, béo 36 x 9 = 324; 324 / 1.296 = 25%
  const danhSachMon = [
    { ngay: '2026-10-27', ten_mon: 'Cơm gà', so_calo: 1296, dam_g: 63, tinh_bot_g: 180, beo_g: 36, muoi_g: 2, duong_g: 5, beo_no_g: 8 },
  ];
  const cacNgay = tongHopCacNgay(danhSachMon, 1900, gioiHan);
  assert.equal(tomTatBaoCao(cacNgay, 62, quyDinhBaoCao).beo_dat, true);
});

test('chưa ghi ngày nào: không chia cho 0, số trung bình và % đều null', () => {
  assert.deepEqual(tomTatBaoCao([], 62, quyDinhBaoCao), {
    so_ngay_co_ghi: 0,
    so_ngay_khong_vuot: 0,
    calo_trung_binh: null,
    dam_g_trung_binh: null,
    phan_tram_dam: null,
    phan_tram_tinh_bot: null,
    phan_tram_beo: null,
    dam_dat: null,
    tinh_bot_dat: null,
    beo_dat: null,
    so_ngay_vuot_muoi: 0,
    so_ngay_vuot_duong: 0,
    so_ngay_vuot_beo_no: 0,
  });
});

test('ngày chỉ có calo, không món nào có số chất: % và ✓ đều null', () => {
  const danhSachMon = [
    { ngay: '2026-10-27', ten_mon: 'Bún chả', so_calo: 1700, dam_g: null, tinh_bot_g: null, beo_g: null, muoi_g: null, duong_g: null, beo_no_g: null },
  ];
  const tomTat = tomTatBaoCao(tongHopCacNgay(danhSachMon, 1900, gioiHan), 62, quyDinhBaoCao);
  assert.equal(tomTat.calo_trung_binh, 1700);
  assert.equal(tomTat.dam_g_trung_binh, 0);
  assert.equal(tomTat.phan_tram_dam, null);
  assert.equal(tomTat.phan_tram_tinh_bot, null);
  assert.equal(tomTat.phan_tram_beo, null);
  assert.equal(tomTat.dam_dat, null);
  assert.equal(tomTat.tinh_bot_dat, null);
  assert.equal(tomTat.beo_dat, null);
});

test('uống nước 6 ngày: đếm ngày đạt và trung bình chỉ chia cho ngày có ghi', () => {
  const cacNgay = [
    { ngay: '2026-10-26', so_ml: 2400 },
    { ngay: '2026-10-27', so_ml: 1500 },
    { ngay: '2026-10-28', so_ml: 2350 },
    { ngay: '2026-10-30', so_ml: 1750 },
    { ngay: '2026-10-31', so_ml: 2500 },
    { ngay: '2026-11-01', so_ml: 1250 },
  ];
  // Tổng 11.750 ml / 6 ngày = 1.958,3
  assert.deepEqual(tomTatUongNuoc(cacNgay, 2310), { so_ngay_co_ghi: 6, so_ngay_dat: 3, ml_trung_binh: 1958 });
});

test('uống đúng bằng mục tiêu là đạt', () => {
  assert.equal(tomTatUongNuoc([{ ngay: '2026-10-26', so_ml: 2310 }], 2310).so_ngay_dat, 1);
});

test('chưa ghi ngày nào thì trung bình là null', () => {
  assert.deepEqual(tomTatUongNuoc([], 2310), { so_ngay_co_ghi: 0, so_ngay_dat: 0, ml_trung_binh: null });
});
