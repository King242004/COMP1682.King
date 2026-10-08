import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tomTatBonTuan } from './TomTatBonTuan.ts';
import type { DauVaoTomTat } from './TomTatBonTuan.ts';

// Giống Service: 28 ngày, cần trải dài 14 ngày, 1 tháng = 30 ngày; QĐ 2892: giảm 2–3 kg/tháng
const dauVaoMau: DauVaoTomTat = {
  caloCacNgay: [
    { ngay: '2026-10-01', tong_calo: 1600 },
    { ngay: '2026-10-02', tong_calo: 1700 },
  ],
  diemCanNang: [
    { ngay: '2026-09-10', can_nang_kg: 55, xu_huong_kg: 55 },
    { ngay: '2026-10-10', can_nang_kg: 53, xu_huong_kg: 53 },
  ],
  mucTieu: 'giam',
  soNgay: 28,
  soNgayToiThieu: 14,
  soNgayMotThang: 30,
  giamCanKgMoiThangThap: 2,
  giamCanKgMoiThangCao: 3,
};

test('calo trung bình chỉ tính ngày có ghi; đếm số ngày có ghi', () => {
  const tomTat = tomTatBonTuan(dauVaoMau);
  assert.equal(tomTat.calo_trung_binh, 1650);
  assert.equal(tomTat.so_ngay_co_ghi, 2);
  assert.equal(tomTat.so_ngay, 28);
});

test('giảm 2 kg trong 30 ngày là -2 kg/tháng, nằm trong khoảng 2–3 kg', () => {
  const tomTat = tomTatBonTuan(dauVaoMau);
  assert.equal(tomTat.thay_doi_kg_moi_thang, -2);
  assert.equal(tomTat.danh_gia_toc_do, 'trong_khoang');
});

test('giảm 2,1 kg trong 15 ngày là -4,2 kg/tháng: nhanh quá; giảm ít là chậm hơn', () => {
  const nhanh = tomTatBonTuan({
    ...dauVaoMau,
    diemCanNang: [
      { ngay: '2026-09-25', can_nang_kg: 55, xu_huong_kg: 55 },
      { ngay: '2026-10-10', can_nang_kg: 52.9, xu_huong_kg: 52.9 },
    ],
  });
  assert.equal(nhanh.thay_doi_kg_moi_thang, -4.2);
  assert.equal(nhanh.danh_gia_toc_do, 'nhanh_qua');

  const cham = tomTatBonTuan({
    ...dauVaoMau,
    diemCanNang: [
      { ngay: '2026-09-10', can_nang_kg: 55, xu_huong_kg: 55 },
      { ngay: '2026-10-10', can_nang_kg: 54.2, xu_huong_kg: 54.2 },
    ],
  });
  assert.equal(cham.danh_gia_toc_do, 'cham_hon');
});

test('chưa trải dài đủ 14 ngày thì chưa tính; giữ cân thì không so sánh; chưa ghi món thì calo là null', () => {
  const chuaDu = tomTatBonTuan({
    ...dauVaoMau,
    diemCanNang: [
      { ngay: '2026-10-01', can_nang_kg: 55, xu_huong_kg: 55 },
      { ngay: '2026-10-10', can_nang_kg: 54, xu_huong_kg: 54 },
    ],
  });
  assert.equal(chuaDu.thay_doi_kg_moi_thang, null);
  assert.equal(chuaDu.danh_gia_toc_do, null);

  const giuCan = tomTatBonTuan({ ...dauVaoMau, mucTieu: 'giu', caloCacNgay: [] });
  assert.equal(giuCan.thay_doi_kg_moi_thang, -2);
  assert.equal(giuCan.danh_gia_toc_do, null);
  assert.equal(giuCan.calo_trung_binh, null);
});
