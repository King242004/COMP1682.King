import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tinhPhutTuongDuongMucVua, xacDinhMucVanDong } from './XacDinhMucVanDong.ts';

// Giống bảng quy_dinh: 150 phút mức vừa mỗi tuần, một phút mức nặng tính bằng hai phút mức vừa
const quyDinh = { phutKhuyenNghi: 150, heSoPhutMucNang: 2 };

test('không tập thì số phút tương đương là 0', () => {
  const cauTraLoi = { congViec: 'ngoi_nhieu' as const, soBuoiTap: 0, soPhutMoiBuoi: null, camNhanKhiTap: null };
  assert.equal(tinhPhutTuongDuongMucVua(cauTraLoi, quyDinh), 0);
});

test('mức nặng nhân 2, mức nhẹ không tính', () => {
  const tapNang = { congViec: 'ngoi_nhieu' as const, soBuoiTap: 2, soPhutMoiBuoi: 45, camNhanKhiTap: 'nang' as const };
  const tapNhe = { congViec: 'ngoi_nhieu' as const, soBuoiTap: 5, soPhutMoiBuoi: 60, camNhanKhiTap: 'nhe' as const };
  assert.equal(tinhPhutTuongDuongMucVua(tapNang, quyDinh), 180);
  assert.equal(tinhPhutTuongDuongMucVua(tapNhe, quyDinh), 0);
});

test('ngồi nhiều, không tập đủ thì mức nhẹ', () => {
  const cauTraLoi = { congViec: 'ngoi_nhieu' as const, soBuoiTap: 2, soPhutMoiBuoi: 30, camNhanKhiTap: 'vua' as const };
  assert.equal(xacDinhMucVanDong(cauTraLoi, quyDinh), 'nhe');
});

test('ngồi nhiều nhưng tập đủ 150 phút mức vừa thì lên trung bình', () => {
  const cauTraLoi = { congViec: 'ngoi_nhieu' as const, soBuoiTap: 3, soPhutMoiBuoi: 60, camNhanKhiTap: 'vua' as const };
  assert.equal(xacDinhMucVanDong(cauTraLoi, quyDinh), 'trung_binh');
});

test('đi lại nhiều và tập đủ thì lên nặng; lao động nặng luôn là nặng', () => {
  const diLai = { congViec: 'di_lai_nhieu' as const, soBuoiTap: 3, soPhutMoiBuoi: 30, camNhanKhiTap: 'nang' as const };
  const laoDong = { congViec: 'lao_dong_nang' as const, soBuoiTap: 0, soPhutMoiBuoi: null, camNhanKhiTap: null };
  assert.equal(xacDinhMucVanDong(diLai, quyDinh), 'nang');
  assert.equal(xacDinhMucVanDong(laoDong, quyDinh), 'nang');
});
