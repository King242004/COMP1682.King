import assert from 'node:assert/strict';
import { test } from 'node:test';

import { kiemTraCaiDatNuoc, tinhMucTieuNuoc } from './UongNuocService.ts';

// Giống bảng quy_dinh: Viện Dinh dưỡng 2016, Bảng 44 (35 ml/kg; trên 55 tuổi 30 ml/kg)
const quyDinhNuoc = {
  mlMoiKg: 35,
  mlMoiKgTrenMocTuoi: 30,
  mocTuoi: 55,
};

test('nặng 66 kg, 30 tuổi: 66 x 35 = 2.310 ml', () => {
  assert.equal(tinhMucTieuNuoc(66, 30, quyDinhNuoc), 2310);
});

test('đúng 55 tuổi vẫn tính 35 ml/kg, vì chưa là "trên 55 tuổi"', () => {
  assert.equal(tinhMucTieuNuoc(66, 55, quyDinhNuoc), 2310);
});

test('56 tuổi tính 30 ml/kg: 66 x 30 = 1.980 ml', () => {
  assert.equal(tinhMucTieuNuoc(66, 56, quyDinhNuoc), 1980);
});

test('mục tiêu làm tròn số nguyên: 50,5 x 35 = 1.767,5 thành 1.768', () => {
  assert.equal(tinhMucTieuNuoc(50.5, 30, quyDinhNuoc), 1768);
});

test('cài đặt hợp lệ thì trả lại đúng như vậy', () => {
  const caiDat = { nuoc_ml_moi_lan: 250, muc_tieu_ml: null, nhac_uong_nuoc: true, gio_nhac: ['08:00', '20:00'] };
  assert.deepEqual(kiemTraCaiDatNuoc(caiDat), caiDat);
  const caiDatTuDat = { nuoc_ml_moi_lan: 300, muc_tieu_ml: 2500, nhac_uong_nuoc: false, gio_nhac: [] };
  assert.deepEqual(kiemTraCaiDatNuoc(caiDatTuDat), caiDatTuDat);
});

test('cài đặt sai thì báo lỗi 400', () => {
  const hopLe = { nuoc_ml_moi_lan: 250, muc_tieu_ml: null, nhac_uong_nuoc: true, gio_nhac: ['08:00'] };
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, nuoc_ml_moi_lan: 30 }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, nuoc_ml_moi_lan: 1001 }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, nuoc_ml_moi_lan: 250.5 }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, muc_tieu_ml: 400 }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, nhac_uong_nuoc: 'co' }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, gio_nhac: ['25:00'] }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, gio_nhac: ['8:00'] }), { status: 400 });
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, gio_nhac: ['08:00', '08:00'] }), { status: 400 });

  // 13 giờ khác nhau: 08:00 tới 20:00
  const muoiBaGio: string[] = [];
  for (let gio = 8; gio <= 20; gio++) {
    muoiBaGio.push(`${String(gio).padStart(2, '0')}:00`);
  }
  assert.throws(() => kiemTraCaiDatNuoc({ ...hopLe, gio_nhac: muoiBaGio }), { status: 400 });
});
