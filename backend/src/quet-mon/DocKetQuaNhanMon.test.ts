import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docKetQuaNhanMon } from './DocKetQuaNhanMon.ts';

test('ảnh không phải đồ ăn thì không có khả năng nào', () => {
  const ketQua = docKetQuaNhanMon({ la_mon_an: false, kha_nang: [] }, 3);
  assert.equal(ketQua.la_mon_an, false);
  assert.equal(ketQua.kha_nang.length, 0);
});

test('AI trả dữ liệu không phải object thì coi như không nhận ra', () => {
  assert.equal(docKetQuaNhanMon('xin lỗi', 3).la_mon_an, false);
  assert.equal(docKetQuaNhanMon(null, 3).la_mon_an, false);
});

test('xếp chắc nhất lên đầu, làm tròn số, cắt còn tối đa 3', () => {
  const duLieu = {
    la_mon_an: true,
    kha_nang: [
      { ten_mon: 'Bún riêu', khau_phan: '1 tô', so_calo: 480.4, dam_g: 20, tinh_bot_g: 60, beo_g: 15, do_tin_cay: 0.2 },
      { ten_mon: ' Bún bò Huế ', khau_phan: '1 tô lớn', so_calo: 620.6, dam_g: 30.25, tinh_bot_g: 70, beo_g: 22, do_tin_cay: 0.7 },
      { ten_mon: 'Phở bò', khau_phan: '1 tô', so_calo: 500, dam_g: 25, tinh_bot_g: 65, beo_g: 12, do_tin_cay: 0.08 },
      { ten_mon: 'Hủ tiếu', khau_phan: '1 tô', so_calo: 450, dam_g: 18, tinh_bot_g: 62, beo_g: 10, do_tin_cay: 0.02 },
    ],
  };
  const ketQua = docKetQuaNhanMon(duLieu, 3);
  assert.equal(ketQua.kha_nang.length, 3);
  assert.equal(ketQua.kha_nang[0].ten_mon, 'Bún bò Huế');
  assert.equal(ketQua.kha_nang[0].so_calo, 621);
  assert.equal(ketQua.kha_nang[0].dam_g, 30.3);
  assert.equal(ketQua.kha_nang[2].ten_mon, 'Phở bò');
});

test('bỏ khả năng thiếu tên hoặc có số âm, giữ khả năng hợp lệ', () => {
  const duLieu = {
    la_mon_an: true,
    kha_nang: [
      { ten_mon: '', so_calo: 300, dam_g: 1, tinh_bot_g: 1, beo_g: 1, do_tin_cay: 0.5 },
      { ten_mon: 'Cơm tấm', khau_phan: '1 dĩa', so_calo: -10, dam_g: 1, tinh_bot_g: 1, beo_g: 1, do_tin_cay: 0.3 },
      { ten_mon: 'Bánh mì thịt', khau_phan: '1 ổ', so_calo: 450, dam_g: 18, tinh_bot_g: 55, beo_g: 17, do_tin_cay: 0.2 },
    ],
  };
  const ketQua = docKetQuaNhanMon(duLieu, 3);
  assert.equal(ketQua.kha_nang.length, 1);
  assert.equal(ketQua.kha_nang[0].ten_mon, 'Bánh mì thịt');
});

test('đọc muối, đường, béo no; số sai hoặc thiếu thì để null mà vẫn giữ khả năng', () => {
  const duLieu = {
    la_mon_an: true,
    kha_nang: [
      { ten_mon: 'Phở bò', khau_phan: '1 tô lớn', so_calo: 550, dam_g: 35, tinh_bot_g: 70, beo_g: 12, muoi_g: 4.46, duong_g: 5, beo_no_g: 6.5, do_tin_cay: 0.6 },
      { ten_mon: 'Bún bò', khau_phan: '1 tô', so_calo: 500, dam_g: 30, tinh_bot_g: 60, beo_g: 15, muoi_g: -1, do_tin_cay: 0.4 },
    ],
  };
  const ketQua = docKetQuaNhanMon(duLieu, 3);
  assert.equal(ketQua.kha_nang.length, 2);
  assert.equal(ketQua.kha_nang[0].muoi_g, 4.5);
  assert.equal(ketQua.kha_nang[0].duong_g, 5);
  assert.equal(ketQua.kha_nang[1].muoi_g, null);
  assert.equal(ketQua.kha_nang[1].beo_no_g, null);
});
