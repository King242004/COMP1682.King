import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docThucDon } from './DocThucDon.ts';

// Giống giới hạn của bảng bua_an
const gioiHan = { tenMonDaiNhat: 100, khauPhanDaiNhat: 100 };

test('giữ món hợp lệ, làm tròn số; món ăn ngoài bị bỏ nguyên liệu và cách nấu', () => {
  const duLieu = {
    bua: [
      {
        loai_bua: 'sang', cach_an: 'an_ngoai', ten_mon: ' Bánh mì trứng ', khau_phan: '1 ổ',
        so_calo: 380.4, dam_g: 15.26, tinh_bot_g: 45, beo_g: 14, muoi_g: 1.84, duong_g: 3, beo_no_g: 4,
        nguyen_lieu: ['Bánh mì 1 ổ'], cach_nau: ['Chiên trứng'],
      },
      {
        loai_bua: 'trua', cach_an: 'tu_nau', ten_mon: 'Cơm, cá kho, canh bí đỏ', khau_phan: '1 suất',
        so_calo: 520, dam_g: 28, tinh_bot_g: 70, beo_g: 12, muoi_g: 2, duong_g: 4, beo_no_g: 3,
        nguyen_lieu: ['Cá rô phi 150 g', '', 'Bí đỏ 200 g'], cach_nau: ['Ướp cá', 'Kho lửa nhỏ', 'Nấu canh'],
      },
    ],
  };
  assert.deepEqual(docThucDon(duLieu, gioiHan), [
    {
      loai_bua: 'sang', cach_an: 'an_ngoai', ten_mon: 'Bánh mì trứng', khau_phan: '1 ổ',
      so_calo: 380, dam_g: 15.3, tinh_bot_g: 45, beo_g: 14, muoi_g: 1.8, duong_g: 3, beo_no_g: 4,
      nguyen_lieu: [], cach_nau: [],
    },
    {
      loai_bua: 'trua', cach_an: 'tu_nau', ten_mon: 'Cơm, cá kho, canh bí đỏ', khau_phan: '1 suất',
      so_calo: 520, dam_g: 28, tinh_bot_g: 70, beo_g: 12, muoi_g: 2, duong_g: 4, beo_no_g: 3,
      nguyen_lieu: ['Cá rô phi 150 g', 'Bí đỏ 200 g'], cach_nau: ['Ướp cá', 'Kho lửa nhỏ', 'Nấu canh'],
    },
  ]);
});

test('bỏ món sai bữa, sai cách ăn, thiếu tên, tên quá dài, calo âm; muối sai thì để null nhưng vẫn giữ món', () => {
  const monDung = { loai_bua: 'toi', cach_an: 'tu_nau', ten_mon: 'Bún gà', khau_phan: '1 tô', so_calo: 420, dam_g: 26, tinh_bot_g: 55, beo_g: 9 };
  const duLieu = {
    bua: [
      { ...monDung, loai_bua: 'khuya' },
      { ...monDung, cach_an: 'giao_tan_nha' },
      { ...monDung, ten_mon: '' },
      { ...monDung, ten_mon: 'a'.repeat(101) },
      { ...monDung, so_calo: -5 },
      { ...monDung, muoi_g: 'nhiều' },
    ],
  };
  const ketQua = docThucDon(duLieu, gioiHan);
  assert.equal(ketQua.length, 1);
  assert.equal(ketQua[0].muoi_g, null);
});

test('dữ liệu không đúng dạng thì trả về danh sách rỗng', () => {
  assert.deepEqual(docThucDon(null, gioiHan), []);
  assert.deepEqual(docThucDon({ bua: 'không phải danh sách' }, gioiHan), []);
});
