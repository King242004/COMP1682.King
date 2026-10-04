import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tongHopNgay } from './TongHopNgay.ts';

test('ngày chưa ăn gì: tổng 0, còn lại bằng mục tiêu', () => {
  const ketQua = tongHopNgay([], 2000);
  assert.equal(ketQua.tong_calo, 0);
  assert.equal(ketQua.con_lai, 2000);
  assert.equal(ketQua.so_mon_thieu_chat, 0);
});

test('cộng calo và ba chất; món thiếu chất vẫn cộng calo và được đếm', () => {
  const danhSachMon = [
    { so_calo: 350, dam_g: 20, tinh_bot_g: 45.5, beo_g: 9 },
    { so_calo: 530, dam_g: null, tinh_bot_g: null, beo_g: null },
  ];
  const ketQua = tongHopNgay(danhSachMon, 2000);
  assert.equal(ketQua.tong_calo, 880);
  assert.equal(ketQua.con_lai, 1120);
  assert.equal(ketQua.tong_dam_g, 20);
  assert.equal(ketQua.tong_tinh_bot_g, 45.5);
  assert.equal(ketQua.tong_beo_g, 9);
  assert.equal(ketQua.so_mon_thieu_chat, 1);
});

test('ăn vượt mục tiêu thì còn lại là số âm', () => {
  const ketQua = tongHopNgay([{ so_calo: 2300, dam_g: 50, tinh_bot_g: 300, beo_g: 80 }], 2000);
  assert.equal(ketQua.con_lai, -300);
});

test('số gam làm tròn 1 số lẻ, không để lộ số lẻ dài do cộng số thực', () => {
  const danhSachMon = [
    { so_calo: 100, dam_g: 0.1, tinh_bot_g: 0, beo_g: 0 },
    { so_calo: 100, dam_g: 0.2, tinh_bot_g: 0, beo_g: 0 },
  ];
  assert.equal(tongHopNgay(danhSachMon, 2000).tong_dam_g, 0.3);
});

test('chưa có mục tiêu calo thì còn lại là null', () => {
  assert.equal(tongHopNgay([], null).con_lai, null);
});
